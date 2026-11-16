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
        # İzole test kataloğu gerçek kullanıcı sorularını ve yanıtlarını kullanmaz.
        self.module.CATALOG['categories'][1]['questions'] = [{'id': 'technical-test', 'revision': 1, 'label': 'TEKNİK TEST, kullanıcı kararı değil', 'description':'Kaynak kapsamı otomatik onay değildir.', 'options': [{'id': '1', 'label': 'Teknik seçenek'}], 'state': 'pending'}]
        self.http = self.module.ThreadingHTTPServer(('127.0.0.1', 0), self.module.Handler)
        self.thread = threading.Thread(target=self.http.serve_forever, daemon=True)
        self.thread.start()
        self.url = f'http://127.0.0.1:{self.http.server_port}'
        self.data = {'documentVersions':self.module.document_versions(self.module.document_snapshot()), 'version': self.module.VERSION, 'submitId': str(uuid.uuid4()), 'categoryId': 'project-planning', 'answers': [{'questionId':'technical-test','revision':1,'option':None,'text':'TEKNİK TEST, kullanıcı kararı değil','snapshot':{'label':'TEKNİK TEST, kullanıcı kararı değil','description':'Kaynak kapsamı otomatik onay değildir.','options':[{'id':'1','label':'Teknik seçenek'}]}}]}

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
        try:
            return response.code, json.load(response)
        finally:
            response.close()

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

    # Gerçek alt süreç yalnız izole sahte CLI'dır; dosya kaydından sonra queue sözleşmesi doğrulanır.
    def test_isolated_cli_process(self):
        executable=Path(self.temp.name)/'fake-codex'
        ledger=Path(self.temp.name)/'cli-arguments.json'
        executable.write_text('#!/usr/bin/env python3\nimport json,sys\nfrom pathlib import Path\nPath('+repr(str(ledger))+').write_text(json.dumps(sys.argv[1:]))\n')
        executable.chmod(0o700)
        self.module.CODEX=str(executable)
        self.assertEqual(self.post(), (200, {'saved':True,'delivery':'queued'}))
        arguments=json.loads(ledger.read_text())
        self.assertEqual(arguments[:3],['queue','--thread',self.module.THREAD_ID])
        saved=json.loads((Path(self.temp.name)/(self.data['submitId']+'.response.json')).read_text())
        self.assertEqual({k:v for k,v in saved.items() if k!='artifactSnapshot'},self.data)
        self.assertEqual(self.module.document_versions(saved['artifactSnapshot']),self.data['documentVersions'])
        self.assertTrue(all('text' in item for item in saved['artifactSnapshot'].values()))
        self.assertIn(str(Path(self.temp.name)/(self.data['submitId']+'.response.json')),arguments[-1])
        self.assertEqual(self.post()[0],200)

    # Kimlik, revizyon ve etiket anlık görüntüsü bozulursa yanıt kaydedilmez.
    def test_catalog_validation(self):
        for field, value in [('questionId','other'), ('revision',2), ('snapshot',{}), ('option','2')]:
            data = json.loads(json.dumps(self.data))
            data['answers'][0][field] = value
            self.assertEqual(self.post(data)[0], 400)
        for change in [{'categoryId':'orchestration'}, {'categoryId':'../private'}, {'answers':[]}]:
            self.assertEqual(self.post(dict(self.data, **change))[0], 400)
        self.assertFalse(list(Path(self.temp.name).glob('*.response.json')))

    # Belge GET ve POST arasında değişirse onay eski metne bağlanmaz, queue çağrılmaz.
    def test_stale_documents_and_immutable_snapshot(self):
        with patch.object(self.module.subprocess, 'run', return_value=subprocess.CompletedProcess([],0)) as run:
            changed=self.module.document_snapshot()
            changed['plan']['text']+='\nTEKNİK DEĞİŞİKLİK'
            changed['plan']['sha256']='0'*64
            with patch.object(self.module,'document_snapshot',return_value=changed):
                self.assertEqual(self.post(),(409,{'error':'documents_changed'}))
                run.assert_not_called()
            self.assertEqual(self.post()[0],200)
            path=Path(self.temp.name)/(self.data['submitId']+'.response.json')
            saved=json.loads(path.read_text())
            self.assertEqual(saved['artifactSnapshot']['plan']['text'],self.module.document_snapshot()['plan']['text'])
            # Sonraki katalog açıklaması değişse de geçmiş özgün koşulu taşır.
            self.module.CATALOG['categories'][1]['questions'][0]['description']='değişen açıklama'
            self.assertEqual(self.module.history()[0]['answers'][0]['snapshot']['description'],'Kaynak kapsamı otomatik onay değildir.')

    # Serbest yanıt, seçenek ve ikisi birlikte geçerlidir; boş yanıt karara dönüşmez.
    def test_answer_modes(self):
        with patch.object(self.module.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0)):
            for option, text in [(None,'serbest'), ('1',''), ('1','ek metin')]:
                data=json.loads(json.dumps(self.data))
                data['submitId']=str(uuid.uuid4())
                data['answers'][0].update(option=option,text=text)
                self.assertEqual(self.post(data)[0],200)
            self.data['answers'][0].update(option=None,text='  ')
            self.assertEqual(self.post()[0],400)

    # GET geçmiş ve belgeler özel token/Host ister; keyfi dosya yolu okunamaz.
    def test_private_get_and_allowlist(self):
        def get(path, headers=None):
            request=Request(self.url+path,headers=headers or {})
            try:
                response=urlopen(request)
            except HTTPError as error:
                response=error
            try:
                return response.code,response.read()
            finally:
                response.close()
        self.assertEqual(get('/history')[0],403)
        headers={'X-Session-Token':self.module.TOKEN}
        self.assertEqual(get('/history',headers)[0],200)
        self.assertEqual(get('/document/plan',headers)[0],200)
        for path in ['/document/../../AGENTS.md','/document/%2e%2e%2fAGENTS.md','/diagram/../server.py']:
            self.assertEqual(get(path,headers)[0],404)
        self.assertEqual(get('/',{'Host':'attacker.invalid'})[0],403)
        request=Request(self.url+'/submit',data=json.dumps(self.data).encode(),headers={'Origin':'https://attacker.invalid','X-Session-Token':self.module.TOKEN})
        with self.assertRaises(HTTPError) as error:
            urlopen(request)
        self.assertEqual(error.exception.code,403)
        error.exception.close()

    # Eski ham kayıtlar ve ack'ler byte düzeyinde aynı kalır; sürüm eşlemesi korunur.
    def test_legacy_history_without_mutation(self):
        identifier=str(uuid.uuid4())
        payload={'version':'2026-11-14-v1','submitId':identifier,'answers':[{'option':None,'text':'bu ne demek?'},{'option':'1','text':''},{'option':'3','text':'<script>test</script>'}]}
        path=Path(self.temp.name)/(identifier+'.response.json')
        path.write_text(json.dumps(payload,ensure_ascii=False))
        before=path.read_bytes()
        self.module.atomic_json(Path(self.temp.name)/(identifier+'.ack.json'),{'method':'manager-read'})
        records=self.module.history()
        self.assertEqual(path.read_bytes(),before)
        self.assertEqual(records[0]['delivery'],'read')
        self.assertEqual([a['questionId'] for a in records[0]['answers']],['production-deploy','worker-authority','worktree-policy'])
        self.assertEqual(records[0]['answers'][2]['snapshot']['options'][2]['id'],'3')
        self.assertEqual(records[0]['answers'][2]['text'],'<script>test</script>')

if __name__ == '__main__':
    unittest.main()
