#!/usr/bin/env python3
# Yerel formu ve cevapların atomik kaydını sağlayan sunucu.
import json
import os
from pathlib import Path
import secrets
import sys
import tempfile
import time
import shutil
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# Oturum verileri kaynak koddan ayrı ve Git dışında tutulur.
BASE = Path(__file__).resolve().parent
RUNTIME = Path(os.environ.get('QUESTIONNAIRE_RUNTIME', BASE / 'runtime')).resolve()
RUNTIME.mkdir(parents=True, exist_ok=True, mode=0o700)
TOKEN = secrets.token_urlsafe(32)
VERSION = '2026-11-14-v2'
MAX_BODY = 65536
THREAD_ID = os.environ.get('QUESTIONNAIRE_THREAD_ID', '')
CODEX = os.environ.get('QUESTIONNAIRE_CODEX') or shutil.which('codex')
DELIVERY_LOCK = threading.Lock()
SAVE_LOCK = threading.Lock()

# Kaydedilen cevapları aynı sohbetin kuyruğuna yollar; shell veya yeni model açılmaz.
def delivery_state(submit):
    ack = RUNTIME / (submit + '.ack.json')
    # Önceki yönetici okuma kayıtları queue kabulü olarak yeniden etiketlenmez.
    if ack.exists():
        data = json.loads(ack.read_text())
        if data.get('method') == 'codex-queue' and data.get('state') == 'queued':
            return 'queued'
        if data.get('method') == 'manager-read':
            return 'read'
        return 'unknown'
    intent = RUNTIME / (submit + '.delivery.json')
    if intent.exists():
        data = json.loads(intent.read_text())
        if data.get('state') in ('dispatching', 'unknown'):
            return 'unknown'
    return 'retryable'

# Belirsiz kabul sonucunda aynı bildirimi körlemesine yeniden göndermez.
def deliver(submit, path):
    with DELIVERY_LOCK:
        state = delivery_state(submit)
        if state != 'retryable':
            return state
        if not THREAD_ID or not CODEX or not Path(CODEX).is_absolute():
            return 'retryable'
        prompt = ('Yerel karar formu yanıtı geldi. Kullanıcı ayrıca mesaj yazmadan bu sohbeti '
                  'otomatik tetikleyen form gönderimidir. Gönderi: ' + submit +
                  '. Yanıt dosyasını oku ve kullanıcı yanıtlarını ilgili kanonik kayda işle: ' + str(path))
        # Uzun yanıtlar dosyada korunur; sohbete yalnız kısa dosya bildirimi gider.
        if len(prompt.encode('utf-8')) > 1000:
            return 'retryable'
        intent = RUNTIME / (submit + '.delivery.json')
        # Çökme sonrası dispatching belirsizdir; başlangıçta tekrar queue yapılmaz.
        atomic_json(intent, {'state': 'dispatching', 'startedAt': time.time()})
        try:
            result = subprocess.run([CODEX, 'queue', '--thread', THREAD_ID, '--message', prompt],
                                    shell=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                    timeout=25, check=False)
        except OSError:
            # Süreç oluşturulamadığı için bu hata güvenle yeniden denenebilir.
            atomic_json(intent, {'state': 'not-started', 'updatedAt': time.time()})
            return 'retryable'
        except subprocess.TimeoutExpired:
            return 'unknown'
        if result.returncode != 0:
            return 'unknown'
        # CLI kabulü okunma garantisi değildir; ack açıkça kuyruk kabulünü kaydeder.
        try:
            atomic_json(RUNTIME / (submit + '.ack.json'), {'method': 'codex-queue', 'acceptedAt': time.time(), 'state': 'queued'})
        except OSError:
            return 'unknown'
        return 'queued'

# Kaydı kısmi dosya görünmeden diske taşır.
def atomic_json(path, data):
    fd, name = tempfile.mkstemp(dir=RUNTIME, prefix='.tmp-')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(data, stream, ensure_ascii=False)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)

# HTTP isteklerini yalnız beklenen uç noktalara yönlendirir.
class Handler(BaseHTTPRequestHandler):
    # Özel verilerin günlükte görünmesini engeller.
    def log_message(self, *args):
        pass

    # Yanıtları önbelleğe almadan yollar.
    def respond(self, status, content, kind='application/json; charset=utf-8'):
        self.send_response(status)
        self.send_header('Content-Type', kind)
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(content)

    # Sayfayı ve belirli gönderinin iletim durumunu sunar.
    def do_GET(self):
        if self.path == '/':
            html = (BASE / 'index.html').read_text(encoding='utf-8').replace('__TOKEN__', TOKEN)
            self.respond(200, html.encode(), 'text/html; charset=utf-8')
            return
        if self.path.startswith('/status/'):
            submit = self.path.removeprefix('/status/')
            if len(submit) == 36 and all(c in '0123456789abcdef-' for c in submit):
                self.respond(200, json.dumps({'delivery': delivery_state(submit)}).encode())
                return
        self.respond(404, b'{}')

    # Aynı oturumdan gelen, geçerli ve tam yanıtları kaydeder.
    def do_POST(self):
        expected = f'http://127.0.0.1:{self.server.server_port}'
        if self.path != '/submit' or self.headers.get('Origin') != expected:
            self.respond(403, b'{}')
            return
        # Sunucu yenilenince eski sekme taslağı silmeden güncel token alabilir.
        if not secrets.compare_digest(self.headers.get('X-Session-Token', ''), TOKEN):
            self.respond(403, b'{"error":"stale_session"}')
            return
        try:
            length = int(self.headers.get('Content-Length', '-1'))
            if length < 0 or length > MAX_BODY:
                self.respond(413, b'{}')
                return
            data = json.loads(self.rfile.read(length))
            submit = data['submitId']
            answers = data['answers']
            if data['version'] != VERSION:
                self.respond(409, b'{"error":"schema_changed"}')
                return
            if len(submit) != 36 or any(c not in '0123456789abcdef-' for c in submit) or len(answers) != 1:
                raise ValueError()
            for index, answer in enumerate(answers):
                if not isinstance(answer, dict) or set(answer) != {'option', 'text'} or not isinstance(answer['text'], str) or answer['option'] not in [None, '1', '2'] or not (answer['option'] or answer['text'].strip()):
                    raise ValueError()
            path = RUNTIME / (submit + '.response.json')
            # Aynı kimlikle eşzamanlı iki farklı yanıtın birbirini ezmesini önler.
            with SAVE_LOCK:
                if path.exists():
                    if json.loads(path.read_text()) != data:
                        self.respond(409, b'{}')
                        return
                else:
                    atomic_json(path, data)
            state = deliver(submit, path)
            self.respond(200 if state in ('queued', 'read') else 503, json.dumps({'saved': True, 'delivery': state}).encode())
        except (ValueError, TypeError, KeyError, json.JSONDecodeError):
            self.respond(400, b'{}')

# Sunucu yalnız bu bilgisayarın loopback arayüzünü dinler.
if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', int(os.environ.get('QUESTIONNAIRE_PORT', '0'))), Handler)
    print(f'http://127.0.0.1:{server.server_port}/', flush=True)
    print(f'Yanıt dizini: {RUNTIME}', flush=True)
    server.serve_forever()
