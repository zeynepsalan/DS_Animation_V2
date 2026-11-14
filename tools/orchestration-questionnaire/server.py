#!/usr/bin/env python3
# Yerel formu ve cevapların atomik kaydını sağlayan sunucu.
import hashlib
import json
import os
from pathlib import Path
import secrets
import sys
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# Oturum verileri kaynak koddan ayrı ve Git dışında tutulur.
BASE = Path(__file__).resolve().parent
RUNTIME = Path(os.environ.get('QUESTIONNAIRE_RUNTIME', BASE / 'runtime')).resolve()
RUNTIME.mkdir(parents=True, exist_ok=True, mode=0o700)
TOKEN = secrets.token_urlsafe(32)
VERSION = '2026-11-14-v1'
MAX_BODY = 65536

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
                ack = RUNTIME / (submit + '.ack.json')
                self.respond(200, json.dumps({'delivered': ack.is_file()}).encode())
                return
        self.respond(404, b'{}')

    # Aynı oturumdan gelen, geçerli ve tam yanıtları kaydeder.
    def do_POST(self):
        expected = f'http://127.0.0.1:{self.server.server_port}'
        if self.path != '/submit' or self.headers.get('Origin') != expected or not secrets.compare_digest(self.headers.get('X-Session-Token', ''), TOKEN):
            self.respond(403, b'{}')
            return
        try:
            length = int(self.headers.get('Content-Length', '-1'))
            if length < 0 or length > MAX_BODY:
                self.respond(413, b'{}')
                return
            data = json.loads(self.rfile.read(length))
            submit = data['submitId']
            answers = data['answers']
            if data['version'] != VERSION or len(submit) != 36 or any(c not in '0123456789abcdef-' for c in submit) or len(answers) != 3:
                raise ValueError()
            for index, answer in enumerate(answers):
                if not isinstance(answer, dict) or set(answer) != {'option', 'text'} or not isinstance(answer['text'], str) or answer['option'] not in ([None, '1', '2'] if index < 2 else [None, '1', '2', '3']) or not (answer['option'] or answer['text'].strip()):
                    raise ValueError()
            path = RUNTIME / (submit + '.response.json')
            if path.exists():
                if json.loads(path.read_text()) != data:
                    self.respond(409, b'{}')
                    return
            else:
                atomic_json(path, data)
            self.respond(200, b'{"saved":true}')
        except (ValueError, TypeError, KeyError, json.JSONDecodeError):
            self.respond(400, b'{}')

# Sunucu yalnız bu bilgisayarın loopback arayüzünü dinler.
if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', int(os.environ.get('QUESTIONNAIRE_PORT', '0'))), Handler)
    print(f'http://127.0.0.1:{server.server_port}/', flush=True)
    print(f'Yanıt dizini: {RUNTIME}', flush=True)
    server.serve_forever()
