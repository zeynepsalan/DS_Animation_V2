#!/usr/bin/env python3
"""Yerel sunucuyu terminal/worker ömründen bağımsız başlatır; çalışan süreci kapatmaz."""
import os
from pathlib import Path
import socket
import subprocess
import sys
import uuid

# Hedef sohbet ve CLI her oturumda ortamdan açıkça alınır.
def main():
    base = Path(__file__).resolve().parent
    thread = os.environ.get('QUESTIONNAIRE_THREAD_ID', '')
    cli = os.environ.get('QUESTIONNAIRE_CODEX', '')
    if not thread or str(uuid.UUID(thread)) != thread or not Path(cli).is_absolute() or not os.access(cli, os.X_OK):
        raise SystemExit('Geçerli QUESTIONNAIRE_THREAD_ID ve mutlak, çalıştırılabilir QUESTIONNAIRE_CODEX gerekli.')
    port = int(os.environ.get('QUESTIONNAIRE_PORT', '0'))
    # Kullanımdaki portun başka bir sürecini öldürmek yerine açık hata verir.
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', port))
        selected_port = probe.getsockname()[1]
    runtime = Path(os.environ.get('QUESTIONNAIRE_RUNTIME', base / 'runtime')).resolve()
    runtime.mkdir(parents=True, exist_ok=True, mode=0o700)
    env = dict(os.environ, QUESTIONNAIRE_PORT=str(selected_port), QUESTIONNAIRE_RUNTIME=str(runtime))
    with (runtime / 'server.log').open('ab') as log:
        process = subprocess.Popen([sys.executable, str(base / 'server.py')], env=env, stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True)
    (runtime / 'server.pid').write_text(str(process.pid))
    print(f'http://127.0.0.1:{selected_port}/ · PID {process.pid}')

if __name__ == '__main__':
    main()
