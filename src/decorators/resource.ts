import { SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { KUBERNETES_RESOURCE } from '../constants';
import { Constructor } from 'type-fest';
import { BaseResource } from '../utils/contract';
import { z } from 'zod';

export type CustomResource<T extends BaseResource> = {
  spec: z.output<T['spec']>;
  metadata: z.output<T['metadata']>;
};

export type Watcher<T extends BaseResource> = {
  //todo contract up
  added(resource: CustomResource<T>): Promise<void>;
  modified(resource: CustomResource<T>): Promise<void>;

  deleted(resource: CustomResource<T>): Promise<void>;
};

type Registry = Record<string, BaseResource>;

export type WatcherMeta<
  R extends Registry,
  ResourceKey extends keyof R & string,
> = {
  contract: Registry[ResourceKey];
  name: ResourceKey;
};

export function KubernetesResourceWatcher<
  R extends Registry,
  ResourceKey extends keyof R & string,
>(contract: R, resource: ResourceKey) {
  return (target: Constructor<Watcher<Registry[ResourceKey]>>) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, {
      contract: contract[resource],
      name: resource,
    })(target);
    SetMetadata(KUBERNETES_RESOURCE, {
      contract: contract[resource],
      name: resource,
    })(target);
  };
}
