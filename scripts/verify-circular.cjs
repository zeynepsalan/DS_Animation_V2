// Gerçek Java/C export'ları bağımsız array davranışıyla karşılaştırılır.
const { execFileSync } = require('node:child_process');
// Üretilen test dosyaları yalnız geçici dizine yazılır.
const { readFileSync, writeFileSync } = require('node:fs');
// Derleyici çıktıları verilen geçici dizinde toplanır.
const { join, resolve } = require('node:path');
// Oracle herhangi bir liste sınıfını çalıştırmaz; yalnız standart array kullanır.
const { oracle } = require('./verify-doubly.cjs');

// Boş/tek/çok Node ve bütün index sınırları iki gerçek dil üzerinde denenir.
function verifyCircular(temp) {
  // Export edilen gerçek API eksik veya fazla method içermemelidir.
  const source = readFileSync('public/examples/CircularLinkedlist.java', 'utf8');
  // Yalnız public liste method'ları test kapsamına alınır.
  const methods = [...source.matchAll(/public (void|boolean|int|T|List<T>) (\w+)\(/g)];
  // Model tail tabanlı olmalıdır; head veya DNode alanı eklenmemelidir.
  if (methods.length !== 18 || /Node<T> head|DNode/.test(source))
    throw new Error('18 method ve yalnız tail tabanlı Circular API bekleniyordu.');
  // Her senaryo Java'da ayrı method olarak derlenir.
  const javaCases = [];
  // C'de aynı senaryolar sanitizer ile çalıştırılır.
  const cCases = [];
  // Değerler kod değil güvenli string literal olarak yazılır.
  const q = JSON.stringify;
  // Bütün method'lar üç temel liste durumuyla karşılaştırılır.
  for (const [, type, name] of methods)
    for (const initial of [[], ['A'], ['A', 'B', 'A', 'İğde']]) {
      // Index alan method'lar sınırın iki yanından test edilir.
      const indexed = ['get', 'set', 'removeAt', 'insertAt'].includes(name);
      // Veri alan işlemler bulunan ve bulunamayan değerlerle test edilir.
      const valued = [
        'set',
        'insertAt',
        'addFirst',
        'addLast',
        'indexOf',
        'lastIndexOf',
        'contains',
        'remove',
      ].includes(name);
      // Tekrarlanan sınırlar gereksiz senaryo üretmez.
      const indices = indexed
        ? [...new Set([-1, 0, 1, initial.length - 1, initial.length, initial.length + 1])]
        : [0];
      // Her index ve veri kombinasyonu bağımsız başlangıçtan çalışır.
      for (const index of indices)
        for (const value of valued ? ['A', 'yok'] : ['']) {
          // Sonuç ve veri sırası bağımsız oracle'dan gelir.
          const { values, result } = oracle(initial, name, index, value);
          // UI imzasıyla aynı argüman sırası kullanılır.
          const args = [...(indexed ? [String(index)] : []), ...(valued ? [q(value)] : [])].join(
            ', ',
          );
          // Senaryo numarası derleme ve assertion mesajlarını okunur tutar.
          const id = javaCases.length;
          // Java beklenen dönüş değeri gerçek data tipiyle yazılır.
          const expected = Array.isArray(result)
            ? `java.util.List.of(${result.map(q).join(', ')})`
            : result == null
              ? 'null'
              : typeof result === 'string'
                ? q(result)
                : String(result);
          // Void method Object değerine atanamaz; dönüş assertion'ı ayrı hazırlanır.
          const javaResult =
            type === 'void'
              ? `list.${name}(${args});\nObject actual = null;`
              : `Object actual = list.${name}(${args});`;
          // Sıra, Node sayısı, tail ve tam bir turda başlangıca dönüş birlikte doğrulanır.
          javaCases.push(`static void test${id}() {
CircularLinkedlist<String> list = new CircularLinkedlist<>();
${initial.map((value) => `list.addLast(${q(value)});`).join('\n')}
${javaResult}
assert java.util.Objects.equals(actual, ${expected}) : "${name}/${id}";
String[] expected = {${values.map(q).join(', ')}};
assert list.size() == expected.length;
assert (list.tail == null) == (expected.length == 0);
if (list.tail != null) {
  Node<String> first = list.tail.next;
  Node<String> node = first;
  for (int i = 0; i < expected.length; i++) {
    assert node != null;
    assert java.util.Objects.equals(node.data, expected[i]);
    assert i == expected.length - 1 ? node == list.tail : node != list.tail;
    node = node.next;
  }
  assert node == first;
}
list.clear();
assert list.tail == null && list.size() == 0;
list.clear();
}`);
          // C çağrısı gerçek listenin adresini ilk argüman olarak alır.
          const cCall = `cll_${name}(&list${args ? ', ' + args : ''})`;
          // C Traversal stdout'a yazar; dönüşü void'dir.
          let cResult = cCall + ';';
          // Data dönüşleri string veya NULL olarak karşılaştırılır.
          if (type === 'T')
            cResult = `const char *actual = ${cCall};\n${result === null ? 'assert(actual == NULL);' : `assert(actual != NULL && strcmp(actual, ${q(result)}) == 0);`}`;
          // Sayısal ve mantıksal dönüşler doğrudan assertion ile kontrol edilir.
          else if (type === 'int' || type === 'boolean') cResult = `assert(${cCall} == ${result});`;
          // Tail.next bir turda aynı nesneye dönmelidir; null bekleyen döngü kullanılmaz.
          cCases.push(`static void test${id}(void) {
CircularLinkedlist list = {0};
${initial.map((value) => `cll_addLast(&list, ${q(value)});`).join('\n')}
${cResult}
const char *expected[] = {${values.length ? values.map(q).join(', ') : 'NULL'}};
assert(cll_size(&list) == ${values.length});
assert((list.tail == NULL) == (${values.length} == 0));
if (list.tail != NULL) {
  Node *first = list.tail->next;
  Node *node = first;
  for (int i = 0; i < ${values.length}; i++) {
    assert(node != NULL);
    assert(strcmp(node->data, expected[i]) == 0);
    assert(i == ${values.length} - 1 ? node == list.tail : node != list.tail);
    node = node->next;
  }
  assert(node == first);
}
cll_clear(&list);
assert(list.tail == NULL && cll_size(&list) == 0);
cll_clear(&list);
}`);
        }
    }
  // Java test programı ayrı namespace/output dizininde derlenir.
  const javaPath = join(temp, 'CircularDemo.java');
  // Her method main'den tek kez çağrılır.
  writeFileSync(
    javaPath,
    `public class CircularDemo {\n${javaCases.join('\n')}\npublic static void main(String[] args) {\n${javaCases.map((_, i) => `test${i}();`).join('\n')}\n}\n}\n`,
  );
  // İndirilen tek dosyanın gerçekten kendi başına derlenmesi zorunludur.
  execFileSync(
    'javac',
    ['-d', join(temp, 'circular'), 'public/examples/CircularLinkedlist.java', javaPath],
    { stdio: 'inherit' },
  );
  // Timeout hatalı halka dolaşmasını doğrulama sürecinin takılmasına dönüştürmez.
  execFileSync('java', ['-ea', '-cp', join(temp, 'circular'), 'CircularDemo'], {
    timeout: 15000,
    stdio: 'inherit',
  });
  // C test programı aynı gerçek export'u include eder.
  const cPath = join(temp, 'circular_demo.c');
  // Senaryolar bağımsız fonksiyonlarda tutulur.
  writeFileSync(
    cPath,
    `#include <assert.h>\n#include "circular_linkedlist.c"\n${cCases.join('\n')}\nint main(void) {\n${cCases.map((_, i) => `test${i}();`).join('\n')}\nreturn 0;\n}\n`,
  );
  // ASan/UBSan hatalı free, use-after-free ve bellek erişimlerini yakalar.
  execFileSync(
    'clang',
    [
      '-std=c11',
      '-Wall',
      '-Wextra',
      '-Werror',
      '-fsanitize=address,undefined',
      '-I',
      resolve('examples/c'),
      cPath,
      '-o',
      join(temp, 'circular_demo'),
    ],
    { stdio: 'inherit' },
  );
  // stdout sadece Traversal eğitim çıktısıdır; hata olursa süreç başarısız olur.
  execFileSync(join(temp, 'circular_demo'), [], { timeout: 15000 });
  // Rapor gerçek senaryo sayısı ve test edilen invariantı açıklar.
  console.log(
    `Circular Java/C: ${javaCases.length} davranış senaryosu ve tail.next halka invariantı geçti.`,
  );
}
// Ana örnek doğrulayıcı bu kontrolü mevcut testlere ekler.
module.exports = { verifyCircular };
