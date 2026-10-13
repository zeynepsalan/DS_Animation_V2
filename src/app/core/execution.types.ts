import type { Node } from './node';

export type Operation =
  | 'isEmpty'
  | 'size'
  | 'clear'
  | 'addFirst'
  | 'insertAt'
  | 'addLast'
  | 'removeAt'
  | 'removeFirst'
  | 'removeLast'
  | 'indexOf'
  | 'get'
  | 'getFirst'
  | 'getLast'
  | 'set'
  | 'contains'
  | 'lastIndexOf'
  | 'remove'
  | 'traversal';
export type Language = 'java' | 'c' | 'pseudo';
export type Selection = Operation | 'node';
export interface NodeSnapshot<T> {
  id: string;
  data: T;
  next: string | null;
}
export interface ListSnapshot<T> {
  head: string | null;
  nodes: NodeSnapshot<T>[];
  size: number;
}
export type Variables = Record<string, string | number | boolean | null>;
export type References<T> = Record<string, Node<T> | null>;
export interface ExecutionStep<T> {
  key: string;
  explanation: string;
  variables: Variables;
  references: Record<string, string | null>;
  snapshot: ListSnapshot<T>;
  result?: string;
  error?: boolean;
}
export type StepObserver<T> = (step: ExecutionStep<T>) => void;
export interface Parameters {
  value?: string;
  index?: number;
}
export interface Trace<T> {
  operation: Operation;
  baseline: ListSnapshot<T>;
  steps: ExecutionStep<T>[];
  returnValue: unknown;
  error?: string;
}
