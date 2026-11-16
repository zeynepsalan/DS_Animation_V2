#!/usr/bin/env python3
# Yerel formu ve cevapların atomik kaydını sağlayan sunucu.
import json
import hashlib
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
CATALOG = json.loads((BASE / 'catalog.json').read_text(encoding='utf-8'))
VERSION = CATALOG['version']
ROOT = BASE.parent.parent
DOCUMENTS = {
    'plan': 'docs/planning/PROJECT_PLAN.md',
    'architecture': 'docs/planning/ARCHITECTURE.md',
    'uml': 'docs/UML.md',
    'sources': 'docs/planning/SOURCE_MAP.md',
}
# Sabit allowlist herhangi bir kullanıcı yolunu dosya sistemine taşımaz.
for category in CATALOG['categories']:
    for question in category['questions']:
        if question.get('decision'):
            DOCUMENTS[question['id']] = question['decision']
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

# Onayın hangi belge metnine ait olduğu cevap dosyasında özel olarak korunur.
def document_snapshot():
    result = {}
    for key in ('plan', 'architecture', 'uml', 'sources'):
        path = ROOT / DOCUMENTS[key]
        if path.is_file():
            raw = path.read_bytes()
            result[key] = {'path': DOCUMENTS[key], 'sha256': hashlib.sha256(raw).hexdigest(), 'text': raw.decode('utf-8')}
    return result

# Tarayıcıya metin yığını yerine yalnız kanonik yol ve içerik hash'i gider.
def document_versions(snapshot):
    return {key: {'path': value['path'], 'sha256': value['sha256']} for key, value in snapshot.items()}

# Gönderi kimlikleri dosya adına dönüştürülmeden önce sıkı biçimde doğrulanır.
def valid_id(value):
    import uuid
    try:
        return isinstance(value, str) and str(uuid.UUID(value)) == value
    except (ValueError, TypeError, AttributeError):
        return False

# Katalog anlık görüntüsü etiket ve seçenek anlamlarını yanıtla birlikte kalıcı tutar.
def validate_submission(data):
    if set(data) != {'version', 'submitId', 'categoryId', 'answers', 'documentVersions'} or not valid_id(data['submitId']):
        raise ValueError()
    category = next((item for item in CATALOG['categories'] if item['id'] == data['categoryId']), None)
    if not category or not isinstance(data['answers'], list):
        raise ValueError()
    questions = [question for question in category['questions'] if question['state'] == 'pending']
    if not questions or len(data['answers']) != len(questions):
        raise ValueError()
    for question, answer in zip(questions, data['answers']):
        if not isinstance(answer, dict) or set(answer) != {'questionId', 'revision', 'option', 'text', 'snapshot'}:
            raise ValueError()
        snapshot = {'label': question['label'], 'description': question.get('description', ''), 'options': question['options']}
        if answer['questionId'] != question['id'] or type(answer['revision']) is not int or answer['revision'] != question['revision'] or answer['snapshot'] != snapshot:
            raise ValueError()
        if not isinstance(answer['text'], str) or answer['option'] not in [None] + [option['id'] for option in question['options']]:
            raise ValueError()
        if not (answer['option'] or answer['text'].strip()):
            raise ValueError()

# Eski sürümler yalnız özgün soru sırasıyla yorumlanır; kayıt dosyaları değiştirilmez.
def history():
    result = []
    mapping = json.loads((BASE / 'legacy-catalog.json').read_text(encoding='utf-8'))
    for path in sorted(RUNTIME.glob('*.response.json'), key=lambda item: item.stat().st_mtime):
        try:
            data = json.loads(path.read_text(encoding='utf-8'))
            if not valid_id(data.get('submitId')) or not isinstance(data.get('answers'), list):
                continue
            questions = mapping.get(data.get('version'))
            answers = []
            for index, answer in enumerate(data['answers']):
                if questions is not None:
                    if index >= len(questions):
                        continue
                    question = questions[index]
                    snapshot = {'label': question['label'], 'options': question['options']}
                    qid = question['id']
                else:
                    snapshot = answer.get('snapshot', {'label': 'Etiketi bilinmeyen eski soru', 'options': []})
                    qid = answer.get('questionId', 'unknown')
                answers.append({'questionId': qid, 'snapshot': snapshot, 'option': answer.get('option'), 'text': answer.get('text', '')})
            result.append({'submitId': data['submitId'], 'version': data.get('version'),
                           'categoryId': 'orchestration' if questions is not None else data.get('categoryId'),
                           'documentVersions': data.get('documentVersions', {}), 'savedAt': path.stat().st_mtime, 'delivery': delivery_state(data['submitId']), 'answers': answers})
        except (ValueError, OSError, TypeError, KeyError):
            # Bir bozuk dosya diğer geçmişi saklamaz; hiçbir kayıt yeniden yazılmaz.
            continue
    return result

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
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('X-Frame-Options', 'DENY')
        self.end_headers()
        self.wfile.write(content)

    # Host doğrulaması DNS rebinding ile özel geçmişin açılmasını önler.
    def valid_host(self):
        return self.headers.get('Host') == f'127.0.0.1:{self.server.server_port}'

    # JSON uçları mevcut sayfanın özel oturum token'ını gerektirir.
    def authorized(self):
        return self.valid_host() and secrets.compare_digest(self.headers.get('X-Session-Token', ''), TOKEN)

    # Yalnız açıkça tanımlanmış kaynakları ve oturum geçmişini sunar.
    def do_GET(self):
        if not self.valid_host():
            self.respond(403, b'{}')
            return
        if self.path == '/':
            html = (BASE / 'index.html').read_text(encoding='utf-8').replace('__TOKEN__', TOKEN)
            self.respond(200, html.encode(), 'text/html; charset=utf-8')
            return
        if not self.authorized():
            self.respond(403, b'{}')
            return
        if self.path == '/catalog':
            self.respond(200, json.dumps(dict(CATALOG, documentVersions=document_versions(document_snapshot())), ensure_ascii=False).encode())
            return
        # Arşiv yalnız özgün herkese açık soru tanımlarını içerir; özel taslakları içermez.
        if self.path == '/catalog-history':
            self.respond(200, (BASE / 'catalog-history.json').read_bytes())
            return
        if self.path == '/history':
            self.respond(200, json.dumps(history(), ensure_ascii=False).encode())
            return
        if self.path.startswith('/document/'):
            key = self.path.removeprefix('/document/')
            if key in DOCUMENTS and (ROOT / DOCUMENTS[key]).is_file():
                self.respond(200, (ROOT / DOCUMENTS[key]).read_bytes(), 'text/plain; charset=utf-8')
                return
        if self.path == '/diagrams':
            manifest = BASE / 'static' / 'diagrams.json'
            self.respond(200, manifest.read_bytes() if manifest.exists() else b'[]')
            return
        if self.path.startswith('/diagram/'):
            name = self.path.removeprefix('/diagram/')
            # SVG dosyaları build manifestinde bulunmalı; traversal kabul edilmez.
            manifest = BASE / 'static' / 'diagrams.json'
            items = json.loads(manifest.read_text()) if manifest.exists() else []
            if name in [item['file'] for item in items]:
                self.respond(200, (BASE / 'static' / name).read_bytes(), 'image/svg+xml')
                return
        if self.path.startswith('/status/'):
            submit = self.path.removeprefix('/status/')
            if valid_id(submit):
                self.respond(200, json.dumps({'delivery': delivery_state(submit)}).encode())
                return
        self.respond(404, b'{}')

    # Aynı oturumdan gelen, geçerli ve tam yanıtları kaydeder.
    def do_POST(self):
        expected = f'http://127.0.0.1:{self.server.server_port}'
        if not self.valid_host() or self.path != '/submit' or self.headers.get('Origin') != expected:
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
            validate_submission(data)
            path = RUNTIME / (submit + '.response.json')
            # Aynı kimlikle eşzamanlı iki farklı yanıtın birbirini ezmesini önler.
            with SAVE_LOCK:
                if path.exists():
                    if {key: value for key, value in json.loads(path.read_text()).items() if key != 'artifactSnapshot'} != data:
                        self.respond(409, b'{}')
                        return
                else:
                    artifacts = document_snapshot()
                    if len(artifacts) != 4 or data['documentVersions'] != document_versions(artifacts):
                        self.respond(409, b'{"error":"documents_changed"}')
                        return
                    atomic_json(path, dict(data, artifactSnapshot=artifacts))
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
