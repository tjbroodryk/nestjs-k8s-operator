export interface KubernetesResourceWatcher<T> {
  added(object: T): void;

  modified(object: T): void;

  deleted(object: T): void;
}
