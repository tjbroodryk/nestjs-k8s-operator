import { SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { KUBERNETES_RESOURCE } from '../constants';
import { Constructor } from 'type-fest';

export type ResourceIdentifier = {
  org: string;

  kind: string;

  version: string;
};

type Watcher = {
  //todo contract up
  onChange: () => {};
};

export function KubernetesResourceWatcher(resource: ResourceIdentifier) {
  return (target: Constructor<Watcher>) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, resource)(target);
    SetMetadata(KUBERNETES_RESOURCE, resource)(target);
  };
}
