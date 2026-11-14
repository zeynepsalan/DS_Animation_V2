# Gerçek kullanıcı dosyalarından ayrı geçici dizinde HTTP ve kuyruk sözleşmesini doğrular.
import concurrent.futures
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen
import uuid

class DeliveryTest(unittest.TestCase):
    # Her test yeni runtime, yeni token ve gerçek loopback HTTP sunucusu kullanır.
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        with patch.dict(os.environ, {'QUESTIONNAIRE_RUNTIME': self.temp.name, 'QUESTIONNAIRE_THREAD_ID': str(uuid.uuid4()), 'QUESTIONNAIRE_CODEX': '/test/codex'}):
            spec = importlib.util.spec_from_file_location('questionnaire_server', Path(__file__).with_name('server.py'))
            self.module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(self.module)
        self.http = self.module.ThreadingHTTPServer(('127.0.0.1', 0), self.module.Handler)
        self.thread = threading.Thread(target=self.http.serve_forever, daemon=True)
        self.thread.start()
        self.url = f'http://127.0.0.1:{self.http.server_port}'
        self.data = {'version': self.module.VERSION, 'submitId': str(uuid.uuid4()), 'answers': [{'option': None, 'text': 'TEKNİK TEST, kullanıcı kararı değil'} for _ in range(1)]}

    # Arka plan sunucusu ve geçici yanıtlar test sonunda temizlenir.
    def tearDown(self):
        self.http.shutdown()
        self.http.server_close()
        self.thread.join()
        self.temp.cleanup()

    # Hata durumlarında da HTTP yanıt gövdesini denetlenebilir döndürür.
    def post(self, data=None, token=None):
        request = Request(self.url+'/submit', data=json.dumps(data or self.data).encode(), headers={'Origin': self.url, 'X-Session-Token': token or self.module.TOKEN, 'Content-Type': 'application/json'})
        try:
            response = urlopen(request)
        except HTTPError as error:
            response = error
        return response.code, json.load(response)

    # Aynı gönderi eşzamanlı tekrarlandığında yalnız bir CLI çağrısı yapılır.
    def test_concurrent_duplicate(self):
        with patch.object(self.module.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0)) as run:
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
                results = list(pool.map(lambda _: self.post(), range(4)))
            self.assertTrue(all(code == 200 and body['delivery']=='queued' for code, body in results))
            self.assertEqual(run.call_count, 1)
            args = run.call_args.args[0]
            self.assertEqual(args[:3], ['/test/codex', 'queue', '--thread'])
            self.assertLessEqual(len(args[-1].encode()), 1000)
            self.assertFalse(run.call_args.kwargs['shell'])

    # Queue hatası cevapları korur; aynı kimlikle yeniden deneme kabul edilir.
    def test_failure_then_retry(self):
        with patch.object(self.module.subprocess, 'run', side_effect=[OSError(), subprocess.CompletedProcess([], 0)]) as run:
            self.assertEqual(self.post(), (503, {'saved': True, 'delivery': 'retryable'}))
            self.assertTrue((Path(self.temp.name)/(self.data['submitId']+'.response.json')).exists())
            self.assertFalse((Path(self.temp.name)/(self.data['submitId']+'.ack.json')).exists())
            self.assertEqual(self.post(), (200, {'saved': True, 'delivery': 'queued'}))
            self.assertEqual(run.call_count, 2)

    # Yeniden başlayan sunucudaki eski token yanıt kaydetmez.
    def test_stale_token_and_conflict(self):
        self.assertEqual(self.post(token='old-token'), (403, {'error': 'stale_session'}))
        with patch.object(self.module.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0)) as run:
            self.post()
            changed = json.loads(json.dumps(self.data))
            changed['answers'][0]['text'] = 'Başka yanıt'
            self.assertEqual(self.post(changed)[0], 409)
            self.assertEqual(run.call_count, 1)

    # Belirsiz CLI sonucu yeniden gönderilmez; dispatching crash kaydı da korunur.
    def test_timeout_nonzero_and_crash(self):
        for outcome in [subprocess.TimeoutExpired('codex', 25), subprocess.CompletedProcess([], 1)]:
            identifier = str(uuid.uuid4())
            self.data['submitId'] = identifier
            with patch.object(self.module.subprocess, 'run', side_effect=outcome if isinstance(outcome, Exception) else None, return_value=outcome) as run:
                self.assertEqual(self.post(), (503, {'saved': True, 'delivery': 'unknown'}))
                self.assertEqual(self.post(), (503, {'saved': True, 'delivery': 'unknown'}))
                self.assertEqual(run.call_count, 1)
        self.data['submitId'] = str(uuid.uuid4())
        self.module.atomic_json(Path(self.temp.name)/(self.data['submitId']+'.delivery.json'), {'state':'dispatching'})
        with patch.object(self.module.subprocess, 'run') as run:
            self.assertEqual(self.post()[1]['delivery'], 'unknown')
            run.assert_not_called()

    # Eski yönetici okuma ack'i ve form sürümü kendi anlamını korur.
    def test_old_schema_and_manager_read(self):
        old = dict(self.data, version='2026-11-14-v1')
        self.assertEqual(self.post(old), (409, {'error':'schema_changed'}))
        self.module.atomic_json(Path(self.temp.name)/(self.data['submitId']+'.ack.json'), {'method':'manager-read'})
        with patch.object(self.module.subprocess, 'run') as run:
            self.assertEqual(self.post(), (200, {'saved':True, 'delivery':'read'}))
            run.assert_not_called()

    # Kabul sonrası ack yazılamazsa dispatching kaydı ikinci queue çağrısını engeller.
    def test_ack_failure(self):
        original = self.module.atomic_json
        def fail_ack(path, data):
            if str(path).endswith('.ack.json'):
                raise OSError('disk unavailable')
            original(path, data)
        with patch.object(self.module, 'atomic_json', side_effect=fail_ack):
            with patch.object(self.module.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0)) as run:
                self.assertEqual(self.post()[1]['delivery'], 'unknown')
                self.assertEqual(self.post()[1]['delivery'], 'unknown')
                self.assertEqual(run.call_count, 1)

if __name__ == '__main__':
    unittest.main()
