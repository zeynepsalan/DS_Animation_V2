#!/usr/bin/env python3
"""Belge göçü kanıtını ve etkin yerel Markdown bağlantılarını denetler."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

# Komut her dizinden çalıştırılsa da proje kökü sabit kalır.
root = Path(__file__).resolve().parent.parent
base = root / 'ORCHESTRATION/evidence/2026-11-14-documentation-migration'
manifest = json.loads((base / 'manifest.json').read_text())
coverage = json.loads((base / 'coverage.json').read_text())
errors = []
evolution = json.loads((root / 'ORCHESTRATION/evidence/2026-11-16-project-planning/document-evolution.json').read_text())
evolution_used = set()
sha = lambda data: hashlib.sha256(data).hexdigest()

# Snapshot hem manifest hem baseline Git blobu ile eşleşmelidir.
for item in manifest['files']:
    data = (root / item['snapshot']).read_bytes()
    blob = subprocess.check_output(['git', 'show', manifest['baseline_commit'] + ':' + item['source']], cwd=root)
    if len(data) != item['size'] or sha(data) != item['sha256'] or data != blob:
        errors.append('Snapshot uyuşmazlığı: ' + item['source'])
    actual_blob = subprocess.check_output(['git', 'hash-object', '--stdin'], input=data, cwd=root).decode().strip()
    if actual_blob != item['git_blob']:
        errors.append('Blob uyuşmazlığı: ' + item['source'])

# Boş olmayan her kaynak satırı tam bir blokta kapsanır; hash ve hedefler doğrulanır.
for item in manifest['files']:
    lines = (root / item['snapshot']).read_text().splitlines(keepends=True)
    seen = set()
    for row in (x for x in coverage if x['source'] == item['source']):
        indices = set(range(row['start'], row['end'] + 1))
        if seen & indices:
            errors.append('Çakışan blok: ' + item['source'])
        seen |= indices
        if sha(''.join(lines[row['start'] - 1:row['end']]).encode()) != row['block_sha256']:
            errors.append('Blok hash uyuşmazlığı: ' + item['source'])
        if not row['targets'] or any(not (root / p).is_file() for p in row['targets']):
            errors.append('Eksik hedef: ' + item['source'])
        # Değişmeden korunan blokların etkin hedefte gerçekten bulunduğunu doğrula.
        if row['handling'] == 'unchanged':
            original = ''.join(lines[row['start'] - 1:row['end']]).strip()
            if not any(original in (root / target).read_text() for target in row['targets']):
                # Yalnız açıkça kaydedilmiş blok, doğrulanmış baseline ve var olan ardıl ile evrilebilir.
                key = (row['start'], row['end'], row['block_sha256'])
                listed = [(b['start'], b['end'], b['block_sha256']) for b in evolution['blocks']]
                valid = (
                    item['source'] == evolution['source']
                    and item['snapshot'] == evolution['preserved_in']
                    and evolution['successor'] in row['targets']
                    and bool(evolution['date']) and bool(evolution['reason'])
                    and (root / evolution['task']).is_file()
                    and (root / evolution['successor']).is_file()
                    and bool((root / evolution['successor']).read_text().strip())
                    and key in listed and listed.count(key) == 1
                    and original in (root / evolution['preserved_in']).read_text()
                )
                if valid:
                    evolution_used.add(key)
                else:
                    errors.append('Değişmeden korunan blok bulunamadı: ' + item['source'])
    if seen != {i for i, line in enumerate(lines, 1) if line.strip()}:
        errors.append('Eksik veya fazla kaynak satırı: ' + item['source'])

# Evrim kayıtları yalnız eksik etkin blokları karşılamalı, kullanılmayan kayıt kalmamalı.
listed_keys = [(b['start'], b['end'], b['block_sha256']) for b in evolution['blocks']]
if len(listed_keys) != len(set(listed_keys)) or set(listed_keys) != evolution_used:
    errors.append('Evrim kaydı kapsamı uyuşmuyor')

# Karar dosyası ID'leri tekil; açık DEC referansları tanımlı olmalıdır.
files = list((root / 'DECISIONS').glob('*/*.md'))
ids = [re.match(r'(DEC-\d{4})-', p.name).group(1) for p in files]
if len(ids) != len(set(ids)):
    errors.append('Tekrarlanan karar ID')
for path in files:
    for ref in re.findall(r'DEC-\d{4}', path.read_text()):
        if ref not in ids:
            errors.append(f'Bilinmeyen ID {ref}: {path.relative_to(root)}')

# Her kayıt temel durum, kapsam, kaynak ve uygulama ayrımını taşır.
for path in files:
    content = path.read_text()
    for term in ('Durum:', 'Kapsam:', 'Kaynak', 'Uygulama'):
        if term not in content:
            errors.append(f'Eksik metadata {term}: {path.relative_to(root)}')

# Bilinen kısmi supersession ilişkileri iki yönde de görünmelidir.
by_id = {re.match(r'(DEC-\d{4})-', p.name).group(1): p for p in files}
expected_edges = {('DEC-0002', 'DEC-0005'), ('DEC-0007', 'DEC-0008'), ('DEC-0008', 'DEC-0010'), ('DEC-0010', 'DEC-0011'), ('DEC-0017', 'DEC-0018')}
edges = []
for old, path in by_id.items():
    for line in path.read_text().splitlines():
        if line.startswith('İlgili sonraki kayıt:'):
            edges.extend((old, new) for new in re.findall(r'DEC-\d{4}', line))
if not expected_edges.issubset(set(edges)):
    errors.append('Beklenen supersession ilişkisi eksik')
for old, new in edges:
    if new not in by_id:
        errors.append(f'Bilinmeyen supersession hedefi: {new}')
        continue
    if new not in by_id[old].read_text() or old not in by_id[new].read_text():
        errors.append(f'Eksik supersession bağlantısı: {old} / {new}')

# Dar kapsamlı ilişki grafiğinde döngü karar geçmişini belirsizleştirir.
def visit(node, active, done):
    if node in active:
        errors.append('Supersession döngüsü: ' + node)
        return
    if node in done:
        return
    active.add(node)
    for old, new in edges:
        if old == node:
            visit(new, active, done)
    active.remove(node)
    done.add(node)

done = set()
for node in by_id:
    visit(node, set(), done)

# Arşiv, ham kaynak bağlarını korur; şablonlarda örnek yer tutucular etkin değildir.
for path in root.rglob('*.md'):
    rel = path.relative_to(root)
    if any(x in rel.parts for x in ('.git', 'node_modules', 'snapshot')) or 'templates' in rel.parts:
        continue
    for link in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)', path.read_text()):
        target = link.split('#', 1)[0]
        if not target or '://' in target or target.startswith(('mailto:', '<')):
            continue
        resolved = path.parent / target
        if not resolved.exists():
            errors.append(f'Kırık bağlantı {rel}: {link}')
        elif '#' in link and resolved.is_file() and resolved.suffix == '.md':
            anchor = link.split('#', 1)[1]
            content = resolved.read_text()
            headings = [re.sub(r'[^\w -]', '', h.lower()).strip().replace(' ', '-') for h in re.findall(r'^#{1,6} (.+)$', content, re.M)]
            explicit = re.findall(r'<a id=["\']([^"\']+)["\']', content)
            if anchor not in headings and anchor not in explicit:
                errors.append(f'Kırık anchor {rel}: {link}')
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'Doğrulandı: {len(manifest["files"])} snapshot, {len(coverage)} blok, {len(ids)} karar ID; etkin yerel dosya bağlantıları.')
