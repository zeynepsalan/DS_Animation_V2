// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { execFileSync } = require('node:child_process');
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { mkdtempSync, rmSync } = require('node:fs');
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { tmpdir } = require('node:os');
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { join } = require('node:path');
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { verifyDoubly } = require('./verify-doubly.cjs');
// Circular export da aynı gerçek Java/C derleyicileriyle doğrulanır.
const { verifyCircular } = require('./verify-circular.cjs');
// temp hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const temp = mkdtempSync(join(tmpdir(), 'ds-lab-'));
try {
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync(process.execPath, ['scripts/export-examples.cjs'], { stdio: 'inherit' });
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync(
    'javac',
    [
      '-d',
      temp,
      'examples/java/Node.java',
      'examples/java/DNode.java',
      'examples/java/SinglyLinkedlist.java',
      'examples/java/Demo.java',
    ],
    { stdio: 'inherit' },
  );
  // Bağımsız indirilebilir DNode Java/C kaynaklarının derlenebilirliğini kontrol et.
  execFileSync('javac', ['-d', join(temp, 'dnode'), 'public/examples/DNode.java'], {
    stdio: 'inherit',
  });
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync(
    'clang',
    [
      '-std=c11',
      '-Wall',
      '-Wextra',
      '-Werror',
      '-c',
      'examples/c/DNode.c',
      '-o',
      join(temp, 'dnode.o'),
    ],
    { stdio: 'inherit' },
  );
  // İndirilebilir Doubly kaynakları Java/C derleyicileriyle doğrulanır.
  execFileSync('javac', ['-d', join(temp, 'doubly'), 'public/examples/DoublyLinkedlist.java'], {
    stdio: 'inherit',
  });
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync(
    'clang',
    [
      '-std=c11',
      '-Wall',
      '-Wextra',
      '-Werror',
      '-c',
      'examples/c/doubly_linkedlist.c',
      '-o',
      join(temp, 'doubly.o'),
    ],
    { stdio: 'inherit' },
  );
  // Bütün Doubly method’lar aynı sözleşmeyle gerçek Java ve C üzerinde çalıştırılır.
  verifyDoubly(temp);
  // Halka bir turda tail.next başlangıcına dönmeli; clear bütün Node belleğini serbest bırakmalı.
  verifyCircular(temp);
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync('java', ['-ea', '-cp', temp, 'Demo'], { stdio: 'inherit' });
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync('javac', ['-d', join(temp, 'download'), 'public/examples/SinglyLinkedlist.java'], {
    stdio: 'inherit',
  });
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync(
    'clang',
    [
      '-std=c11',
      '-Wall',
      '-Wextra',
      '-Werror',
      '-fsanitize=address,undefined',
      'examples/c/demo.c',
      '-o',
      join(temp, 'demo'),
    ],
    { stdio: 'inherit' },
  );
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync(join(temp, 'demo'), [], { stdio: 'inherit' });
} finally {
  // Yalnız bu aracın ürettiği geçici çıktıyı temizler; kaynak dosyalar korunur.
  rmSync(temp, { recursive: true, force: true });
}
