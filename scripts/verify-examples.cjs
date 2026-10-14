const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const temp = mkdtempSync(join(tmpdir(), 'ds-lab-'));
try {
  execFileSync(process.execPath, ['scripts/export-examples.cjs'], { stdio: 'inherit' });
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
  execFileSync('java', ['-ea', '-cp', temp, 'Demo'], { stdio: 'inherit' });
  execFileSync('javac', ['-d', join(temp, 'download'), 'public/examples/SinglyLinkedlist.java'], {
    stdio: 'inherit',
  });
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
  execFileSync(join(temp, 'demo'), [], { stdio: 'inherit' });
} finally {
  rmSync(temp, { recursive: true, force: true });
}
