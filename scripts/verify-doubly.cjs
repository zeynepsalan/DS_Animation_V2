// Ekrandan üretilen Java/C kodunu bağımsız array sözleşmesiyle çalıştırarak doğrular.
const { execFileSync } = require('node:child_process');
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { readFileSync, writeFileSync } = require('node:fs');
// Çalışma aracının ihtiyaç duyduğu dosya veya komut modülünü yükler; uygulamanın tarayıcı paketine eklenmez.
const { join, resolve } = require('node:path');

// Bağımsız array modeliyle beklenen sonuç ve final listeyi hesaplar; gerçek liste sınıfını kullanmaz.
function oracle(source, operation, index, value) {
  // values hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const values = [...source];
  // valid hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const valid = index >= 0 && index < values.length;
  // result hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  let result;
  // Seçilen fonksiyon adına göre yalnız ilgili algoritma çalıştırılır; aynı isimler iki yapı için ayrı kayıtlanır.
  switch (operation) {
    case 'isEmpty':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = !values.length;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'size':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.length;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'clear':
      // Bu atamayla values.length güncellenir; sonraki satır yeni değeri kullanır.
      values.length = 0;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'addFirst':
      // values.unshift çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
      values.unshift(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'addLast':
      // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
      values.push(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'insertAt':
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (index >= 0 && index <= values.length) values.splice(index, 0, value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeAt':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = valid ? values.splice(index, 1)[0] : null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeFirst':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.shift() ?? null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'removeLast':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.pop() ?? null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'get':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = valid ? values[index] : null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'getFirst':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values[0] ?? null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'getLast':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.at(-1) ?? null;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'set':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = valid ? values[index] : null;
      // Geçersiz parametreyi mutasyondan önce durdurur; başlangıç listesi korunur.
      if (valid) values[index] = value;
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'indexOf':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.indexOf(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'lastIndexOf':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.lastIndexOf(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'contains':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = values.includes(value);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    case 'remove': {
      // Dolaşmanın şu an hangi index’te olduğunu tutan sayaç bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const i = values.indexOf(value);
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = i >= 0;
      // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
      if (i >= 0) values.splice(i, 1);
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    }
    case 'traversal':
      // Bu atamayla result güncellenir; sonraki satır yeni değeri kullanır.
      result = [...values];
      // Bu döngüyü veya switch kolunu sonlandırır; gereksiz işlem sürdürülmez.
      break;
    default:
      // Doğrulama sözleşmesi bozulduğunda testi açıkça başarısız yapar; beklenen UI hataları bu yoldan atılmaz.
      throw new Error('Sözleşmesi olmayan method: ' + operation);
  }
  // Hesaplanan sonucu çağıran koda verir; çağıran bu değeri bir sonraki işlemde kullanabilir.
  return { values, result };
}
// Üretilen Java/C kodlarını gerçek derleyiciler ve sanitizer ile davranış senaryolarında çalıştırır.
function verifyDoubly(temp) {
  // Method adları gerçek indirilebilir Java kaynağından alınır; eksik export fark edilir.
  const source = readFileSync('public/examples/DoublyLinkedlist.java', 'utf8');
  // İndirilebilir sınıfa konulacak method kaynaklarını bir araya getirir.
  const methods = [...source.matchAll(/public (void|boolean|int|T|List<T>) (\w+)\(/g)];
  // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
  if (methods.length !== 18) throw new Error('18 Doubly method bekleniyordu.');
  // Gerçek Java koduna karşı çalıştırılacak bağımsız davranış senaryolarını biriktirir.
  const javaCases = [];
  // Gerçek C koduna karşı çalıştırılacak bağımsız davranış senaryolarını biriktirir.
  const cCases = [];
  // Metni Java/C test kaynağına güvenli bir string literal olarak yazar.
  const q = JSON.stringify;
  // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
  for (const [, type, name] of methods)
    // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
    for (const initial of [[], ['A'], ['A', 'B', 'A', 'C']]) {
      // indexed hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
      const indexed = ['get', 'set', 'removeAt', 'insertAt'].includes(name);
      // valued hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
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
      // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
      for (const index of indexed
        ? [...new Set([-1, 0, 1, initial.length - 1, initial.length, initial.length + 1])]
        : [0]) {
        // Koleksiyonun elemanlarını sırayla işler; her turda ilgili nesne, kayıt veya test senaryosu ele alınır.
        for (const value of valued ? ['A', 'yok'] : ['']) {
          // { values, result } hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const { values, result } = oracle(initial, name, index, value);
          // args hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const args = [...(indexed ? [String(index)] : []), ...(valued ? [q(value)] : [])].join(
            ', ',
          );
          // javaCall hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const javaCall = `list.${name}(${args})`;
          // expectedJava hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const expectedJava = Array.isArray(result)
            ? `java.util.List.of(${result.map(q).join(', ')})`
            : result === undefined || result === null
              ? 'null'
              : typeof result === 'string'
                ? q(result)
                : String(result);
          // javaResult hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const javaResult =
            type === 'void'
              ? `${javaCall};\nObject actual = null;`
              : `Object actual = ${javaCall};`;
          // Adımlar arasında aynı nesneyi izleten görsel kimlik bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const id = javaCases.length;
          // İki yönlü komşuluk ve uçlar her senaryonun final durumunda doğrulanır.
          javaCases.push(`static void test${id}() {
DoublyLinkedlist<String> list = new DoublyLinkedlist<>();
${initial.map((value) => `list.addLast(${q(value)});`).join('\n')}
${javaResult}
assert java.util.Objects.equals(actual, ${expectedJava}) : "${name} result/${id}";
String[] expected = {${values.map(q).join(', ')}};
assert list.size() == expected.length;
int i = 0;
DNode<String> previous = null;
for (DNode<String> node = list.head; node != null; node = node.next) {
assert node.prev == previous;
assert java.util.Objects.equals(node.data, expected[i++]);
previous = node;
}
assert i == expected.length;
assert previous == list.tail;
i = expected.length - 1;
DNode<String> following = null;
for (DNode<String> node = list.tail; node != null; node = node.prev) {
assert node.next == following;
assert java.util.Objects.equals(node.data, expected[i--]);
following = node;
}
assert i == -1;
assert following == list.head;
list.clear();
}`);
          // cCall hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          const cCall = `dll_${name}(&list${args ? ', ' + args : ''})`;
          // cResult hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
          let cResult;
          // Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır.
          if (type === 'void' || name === 'traversal') cResult = cCall + ';';
          else /* Koşula göre bu işlem koluna girer; diğer durumda sıradaki güvenli yol çalışır. */ if (
            type === 'T'
          )
            // Bu atamayla cResult güncellenir; sonraki satır yeni değeri kullanır.
            cResult = `const char *actual = ${cCall};\n${result === null ? 'assert(actual == NULL);' : 'assert(actual != NULL);\nassert(strcmp(actual, ' + q(result) + ') == 0);'}`;
          else
            // Bu atamayla cResult güncellenir; sonraki satır yeni değeri kullanır.
            cResult = `${type === 'boolean' ? 'bool' : 'int'} actual = ${cCall};\nassert(actual == ${result});`;
          // Bu turdaki sonucu koleksiyona ekler; kayıt veya çıktı sırası korunur.
          cCases.push(`static void test${id}(void) {
DoublyLinkedlist list = {0};
${initial.map((value) => `dll_addLast(&list, ${q(value)});`).join('\n')}
${cResult}
const char *expected[] = {${values.length ? values.map(q).join(', ') : 'NULL'}};
assert(dll_size(&list) == ${values.length});
int i = 0;
DNode *previous = NULL;
for (DNode *node = list.head; node != NULL; node = node->next) {
assert(node->prev == previous);
assert(strcmp(node->data, expected[i++]) == 0);
previous = node;
}
assert(i == ${values.length});
assert(previous == list.tail);
i = ${values.length} - 1;
DNode *following = NULL;
for (DNode *node = list.tail; node != NULL; node = node->prev) {
assert(node->next == following);
assert(strcmp(node->data, expected[i--]) == 0);
following = node;
}
assert(i == -1);
assert(following == list.head);
dll_clear(&list);
}`);
        }
      }
    }
  // Her case ayrı method’da tutulur; Java main bytecode boyutu sınırına ulaşılmaz.
  const javaPath = join(temp, 'DoublyDemo.java');
  // Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
  writeFileSync(
    javaPath,
    `public class DoublyDemo {\n${javaCases.join('\n')}\npublic static void main(String[] args) {\n${javaCases.map((_, i) => `test${i}();`).join('\n')}\n}\n}\n`,
  );
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync('javac', [
    '-d',
    join(temp, 'doubly'),
    'public/examples/DoublyLinkedlist.java',
    javaPath,
  ]);
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync('java', ['-ea', '-cp', join(temp, 'doubly'), 'DoublyDemo']);
  // cPath hesabında kullanılan ara değer bu kapsamda saklanır; sonraki satırlar aynı değeri kullanır.
  const cPath = join(temp, 'doubly_demo.c');
  // Üretilen kod veya doğrulama dosyasını diske yazar; ekran kaynağıyla indirilen kaynak aynı kalır.
  writeFileSync(
    cPath,
    `#include <assert.h>\n#include "doubly_linkedlist.c"\n${cCases.join('\n')}\nint main(void) {\n${cCases.map((_, i) => `test${i}();`).join('\n')}\nreturn 0;\n}\n`,
  );
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync('clang', [
    '-std=c11',
    '-Wall',
    '-Wextra',
    '-Werror',
    '-fsanitize=address,undefined',
    '-I',
    resolve('examples/c'),
    cPath,
    '-o',
    join(temp, 'doubly_demo'),
  ]);
  // Doğrulama komutunu bitmesini bekleyerek çalıştırır; başarısız derleme veya test bu akışı durdurur.
  execFileSync(join(temp, 'doubly_demo'));
  // console.log çağrısını bu sırada çalıştırır; gerekli veri önceki satırlarda hazırlanmıştır.
  console.log(
    `Doubly Java/C: ${javaCases.length} davranış senaryosu ve iki yönlü invariant geçti.`,
  );
}
// Bu atamayla module.exports güncellenir; sonraki satır yeni değeri kullanır.
// Diğer liste testleri aynı bağımsız array oracle'ını kullanabilir.
module.exports = { verifyDoubly, oracle };
