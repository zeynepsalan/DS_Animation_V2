import { SinglyLinkedlist } from './singly-linkedlist';
import type { ExecutionStep, ListSnapshot, Operation, Parameters, Trace } from './execution.types';

/**
 * Gerçek liste üzerinde önce bütün algoritma çalıştırılır; her değişim kaydedilir.
 * Player bu immutable kayıtları sırayla gösterir. Prev/Reset için algoritmayı tersine çalıştırmayız.
 */
export class TraceEngine {
  execute(baseline: ListSnapshot<string>, operation: Operation, params: Parameters): Trace<string> {
    const steps: ExecutionStep<string>[] = [
      {
        key: 'start',
        explanation: 'İşlem başlangıcı. Parametreleri ve mevcut listeyi incele.',
        snapshot: baseline,
        references: {},
        variables: {
          ...(params.value !== undefined ? { value: params.value } : {}),
          ...(params.index !== undefined ? { index: params.index } : {}),
        },
      },
    ];
    const list = SinglyLinkedlist.fromSnapshot(baseline, (step) => {
      steps.push({ ...step, variables: { ...steps[0].variables, ...step.variables } });
    });
    let returnValue: unknown;
    const value = params.value ?? '';
    const index = params.index ?? NaN;
    switch (operation) {
      case 'isEmpty':
        returnValue = list.isEmpty();
        break;
      case 'size':
        returnValue = list.size();
        break;
      case 'clear':
        returnValue = list.clear();
        break;
      case 'addFirst':
        returnValue = list.addFirst(value);
        break;
      case 'insertAt':
        returnValue = list.insertAt(index, value);
        break;
      case 'addLast':
        returnValue = list.addLast(value);
        break;
      case 'removeAt':
        returnValue = list.removeAt(index);
        break;
      case 'removeFirst':
        returnValue = list.removeFirst();
        break;
      case 'removeLast':
        returnValue = list.removeLast();
        break;
      case 'get':
        returnValue = list.get(index);
        break;
      case 'getFirst':
        returnValue = list.getFirst();
        break;
      case 'getLast':
        returnValue = list.getLast();
        break;
      case 'set':
        returnValue = list.set(index, value);
        break;
      case 'indexOf':
        returnValue = list.indexOf(value);
        break;
      case 'lastIndexOf':
        returnValue = list.lastIndexOf(value);
        break;
      case 'contains':
        returnValue = list.contains(value);
        break;
      case 'remove':
        returnValue = list.remove(value);
        break;
      case 'traversal':
        returnValue = list.traversal();
        break;
    }
    const last = steps[steps.length - 1];
    last.result = returnValue === undefined ? 'void' : JSON.stringify(returnValue);
    return {
      operation,
      baseline,
      steps,
      returnValue,
      ...(last.error ? { error: last.explanation } : {}),
    };
  }
}
