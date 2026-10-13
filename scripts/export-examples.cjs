// Ekrandaki örneklerle indirilebilir kaynakların farklılaşmasını önleyen export script'i.
const { execFileSync } = require('node:child_process');
const { mkdirSync, writeFileSync, readFileSync, rmSync } = require('node:fs');
const { resolve } = require('node:path');
const scratch = resolve('.examples-build');
execFileSync(
  resolve('node_modules/.bin/tsc'),
  [
    '--ignoreConfig',
    'src/app/education/code-documents.ts',
    '--outDir',
    scratch,
    '--module',
    'commonjs',
    '--target',
    'ES2022',
    '--skipLibCheck',
  ],
  { stdio: 'inherit' },
);
const { codeFor } = require(resolve(scratch, 'education/code-documents.js'));
const operations = [
  'isEmpty',
  'size',
  'clear',
  'addFirst',
  'insertAt',
  'addLast',
  'removeAt',
  'removeFirst',
  'removeLast',
  'indexOf',
  'get',
  'getFirst',
  'getLast',
  'set',
  'contains',
  'lastIndexOf',
  'remove',
  'traversal',
];
const methods = (lang) =>
  operations
    .map((op) =>
      codeFor(op, lang)
        .map((l) => l.text)
        .join('\n'),
    )
    .join('\n\n');
mkdirSync('examples/java', { recursive: true });
mkdirSync('examples/c', { recursive: true });
writeFileSync(
  'examples/java/Node.java',
  codeFor('node', 'java')
    .map((l) => l.text)
    .join('\n') + '\n',
);
writeFileSync(
  'examples/java/SinglyLinkedlist.java',
  `import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
/** Eğitim implementasyonu: Node ayrı sınıftır; tail alanı tutulmaz. */
public class SinglyLinkedlist<T> {
  private Node<T> head;
  private int size;
${methods('java')}
}
`,
);
// C örneği data için ödünç alınmış const char* kullanır. Çağıran, metinlerin
// liste boyunca geçerli kalmasını sağlar. Liste yalnızca Node belleğini yönetir.
writeFileSync(
  'examples/c/singly_linkedlist.c',
  `#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${codeFor('node', 'c')
  .filter((l) => !l.text.startsWith('// C:'))
  .map((l) => l.text)
  .join('\n')}
typedef struct { Node *head; int size; } LinkedList;
static void freeChain(Node *current) {
  while (current) { Node *next = current->next; free(current); current = next; }
}
${methods('c')}
`,
);
mkdirSync('public/examples', { recursive: true });
writeFileSync(
  'public/examples/SinglyLinkedlist.java',
  readFileSync('examples/java/Node.java', 'utf8').replace('public class Node', 'class Node') +
    '\n' +
    readFileSync('examples/java/SinglyLinkedlist.java', 'utf8').replace(
      'import java.util.Objects;\nimport java.util.List;\nimport java.util.ArrayList;\n',
      '',
    ),
);
const javaFile = readFileSync('public/examples/SinglyLinkedlist.java', 'utf8');
writeFileSync(
  'public/examples/SinglyLinkedlist.java',
  'import java.util.Objects;\nimport java.util.List;\nimport java.util.ArrayList;\n' + javaFile,
);
writeFileSync(
  'public/examples/singly_linkedlist.c',
  readFileSync('examples/c/singly_linkedlist.c'),
);
rmSync(scratch, { recursive: true, force: true });
console.log('Java ve C kaynakları examples/ içine güncellendi.');
