#!/usr/bin/env python3
"""Kanonik UML Mermaid bloklarını yerel, çevrimdışı SVG görsellerine dönüştürür."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

# Render aracı ürün bağımlılıklarına eklenmez; mevcut CLI yolu açık verilir.
def render(cli):
    base = Path(__file__).resolve().parent
    source = base.parent.parent / 'docs/UML.md'
    raw = source.read_bytes()
    text = raw.decode('utf-8')
    output = base / 'static'
    output.mkdir(exist_ok=True)
    manifest = []
    # Her blok son başlığıyla eşleşir; mevcut ve öneri başlıkları kaynakta korunur.
    for index, match in enumerate(re.finditer(r'```mermaid\s*\n(.*?)```', text, re.S), 1):
        headings = re.findall(r'^## (.+)$', text[:match.start()], re.M)
        title = headings[-1] if headings else f'UML {index}'
        name = f'uml-{index}.svg'
        with tempfile.TemporaryDirectory(prefix='questionnaire-uml-') as temp:
            input_path = Path(temp) / 'diagram.mmd'
            config_path = Path(temp) / 'config.json'
            input_path.write_text(match.group(1), encoding='utf-8')
            config_path.write_text(json.dumps({'securityLevel':'strict','theme':'neutral','fontFamily':'Arial, sans-serif','htmlLabels':False}), encoding='utf-8')
            subprocess.run([cli, '-i', str(input_path), '-o', str(output / name), '-c', str(config_path), '-b', 'white'], check=True, timeout=60)
        manifest.append({'file':name, 'title':title, 'source':'docs/UML.md', 'sourceHash':hashlib.sha256(raw).hexdigest(), 'generator':'@mermaid-js/mermaid-cli@12.2.0'})
    # Manifest ancak tüm bloklar başarıyla üretildikten sonra güncellenir.
    (output / 'diagrams.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(f'{len(manifest)} SVG üretildi; canonical source SHA-256 doğrulaması etkin.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--mmdc', required=True)
    render(parser.parse_args().mmdc)
