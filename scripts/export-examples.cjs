// Ekrandaki örneklerle indirilebilir kaynakların farklılaşmasını önleyen export script'i.
const { execFileSync } = require('node:child_process');
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { mkdirSync, writeFileSync, readFileSync, rmSync } = require('node:fs');
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { resolve } = require('node:path');
// Kod örneği export işleminde kullanılacak geçici derleme dizinini seçer.
const scratch = resolve('.examples-build');
// Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
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
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { codeFor } = require(resolve(scratch, 'education/code-documents.js'));
// Circular export alt çağrıları tekrar method tanımı olarak çoğaltmaz.
const { circularCode, circularId } = require(resolve(scratch, 'education/circular-code.js'));
// Kaynak olarak export edilecek method isimlerinin sırasını tutar.
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
// İndirilebilir sınıfa konulacak method kaynaklarını bir araya getirir.
const methods = (lang) =>
  operations
    .map((op) =>
      codeFor(op, lang)
        .map((l) => l.text)
        .join('\n'),
    )
    .join('\n\n');
// Üretilecek dosyalar için hedef dizinin var olmasını sağlar.
mkdirSync('examples/java', { recursive: true });
// Üretilecek dosyalar için hedef dizinin var olmasını sağlar.
mkdirSync('examples/c', { recursive: true });
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync(
  'examples/java/Node.java',
  codeFor('node', 'java')
    .map((l) => l.text)
    .join('\n') + '\n',
);
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
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
// Üretilecek dosyalar için hedef dizinin var olmasını sağlar.
mkdirSync('public/examples', { recursive: true });
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync(
  'public/examples/SinglyLinkedlist.java',
  readFileSync('examples/java/Node.java', 'utf8').replace('public class Node', 'class Node') +
    '\n' +
    readFileSync('examples/java/SinglyLinkedlist.java', 'utf8').replace(
      'import java.util.Objects;\nimport java.util.List;\nimport java.util.ArrayList;\n',
      '',
    ),
);
// javaFile hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
const javaFile = readFileSync('public/examples/SinglyLinkedlist.java', 'utf8');
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync(
  'public/examples/SinglyLinkedlist.java',
  'import java.util.Objects;\nimport java.util.List;\nimport java.util.ArrayList;\n' + javaFile,
);
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync(
  'public/examples/singly_linkedlist.c',
  readFileSync('examples/c/singly_linkedlist.c'),
);
// Yalnız bu aracın ürettiği geçici çıktıyı temizler; kaynak dosyalar korunur.
rmSync(scratch, { recursive: true, force: true });
// console.log çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
console.log('Java ve C kaynakları examples/ içine güncellendi.');

// Bağımsız DNode örnekleri de doğrudan ekrandaki aynı satırlardan üretilir.
for (const [language, extension, directory] of [
  ['java', 'java', 'java'],
  ['c', 'c', 'c'],
  ['pseudo', 'pseudo', ''],
]) {
  // Üretilecek kod metnini veya okun başlangıç portunu saklar.
  const source =
    codeFor('dnode', language)
      .map((line) => line.text)
      .join('\n') + '\n';
  // Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
  writeFileSync(`examples/${directory ? directory + '/' : ''}DNode.${extension}`, source);
  // Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
  writeFileSync(`public/examples/DNode.${extension}`, source);
}

// İlk Doubly method grubu aynı satır kaynağından derlenebilir sınıflara dönüştürülür.
const doublyOperations = operations.map(
  (operation) => 'doubly' + operation[0].toUpperCase() + operation.slice(1),
);
// Doubly method’ların üç dildeki satırlarını export için birleştirir.
const doublyMethods = (language) =>
  doublyOperations
    .map((operation) =>
      codeFor(operation, language)
        .map((line) => line.text)
        .join('\n'),
    )
    .join('\n\n');
// Ekran satırlarını head/tail alanları olan derlenebilir Java sınıfına sarar.
const doublyJava = `import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
public class DoublyLinkedlist<T> {
  DNode<T> head;
  DNode<T> tail;
  private int size;
${doublyMethods('java')}
}
`;
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync('examples/java/DoublyLinkedlist.java', doublyJava);
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync(
  'public/examples/DoublyLinkedlist.java',
  'import java.util.Objects;\nimport java.util.List;\nimport java.util.ArrayList;\n' +
    readFileSync('examples/java/DNode.java', 'utf8').replace('public class DNode', 'class DNode') +
    '\n' +
    doublyJava.replace(
      'import java.util.Objects;\nimport java.util.List;\nimport java.util.ArrayList;\n',
      '',
    ),
);
// Ekran satırlarını gerekli C include ve liste struct’ıyla birleştirir.
const doublyC =
  '#include <stdbool.h>\n#include <stdio.h>\n#include <string.h>\n' +
  readFileSync('examples/c/DNode.c', 'utf8') +
  '\ntypedef struct { DNode *head; DNode *tail; int size; } DoublyLinkedlist;\n' +
  doublyMethods('c') +
  '\n';
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync('examples/c/doubly_linkedlist.c', doublyC);
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync('public/examples/doubly_linkedlist.c', doublyC);
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync('examples/DoublyLinkedlist.pseudo', doublyMethods('pseudo') + '\n');
// Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
writeFileSync('public/examples/DoublyLinkedlist.pseudo', doublyMethods('pseudo') + '\n');

// Circular yalnız tail tutar; Node sınıfı bağımsız olarak yeniden kullanılır.
const circularMethods = language => operations.map(operation => circularCode(circularId(operation), language, false).map(line => line.text).join('\n')).join('\n\n');
// Java'da bütün method'lar aynı sınıfta olduklarından ileri çağrılar doğrudan desteklenir.
const circularJava = `import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
public class CircularLinkedlist<T> {
  Node<T> tail;
  private int size;
${circularMethods('java')}
}
`;
// Proje içindeki kaynak bağımsız Node.java ile derlenir.
writeFileSync('examples/java/CircularLinkedlist.java', circularJava);
// İndirilebilir tek dosya kendi Node tanımını da içerir.
writeFileSync('public/examples/CircularLinkedlist.java', circularJava.replace('public class CircularLinkedlist', readFileSync('examples/java/Node.java', 'utf8').replace('public class Node', 'class Node') + '\npublic class CircularLinkedlist'));
// C'de method çağrıları önce prototiplerle bildirilir; sıra değiştirmek gerekmez.
const circularPrototypes = operations.map(operation => circularCode(circularId(operation), 'c', false)[0].text.replace(/ \{$/, ';')).join('\n');
// C yalnız Node belleğini yönetir; metinler borrowed const char* olarak kalır.
const circularC = '#include <stdbool.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n' + codeFor('node', 'c').map(line => line.text).join('\n') + '\n' + 'typedef struct { Node *tail; int size; } CircularLinkedlist;\n' + circularPrototypes + '\n' + circularMethods('c') + '\n';
// Üç dil aynı satır kaynağından export edilir.
writeFileSync('examples/c/circular_linkedlist.c', circularC);
// İndirilen C kodu gerçek export edilen kaynakla aynıdır.
writeFileSync('public/examples/circular_linkedlist.c', circularC);
// Pseudocode da çalıştırılan method sırasını gösterir.
writeFileSync('examples/CircularLinkedlist.pseudo', circularMethods('pseudo') + '\n');
// İndirilebilir Pseudocode sürümü aynı metni kullanır.
writeFileSync('public/examples/CircularLinkedlist.pseudo', circularMethods('pseudo') + '\n');
