import { SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { KUBERNETES_RESOURCE } from '../constants';
import { Constructor } from 'type-fest';
import { BaseResource, Registry } from '../utils/contract';
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

export type WatcherMeta<
  R extends Registry,
  ResourceKey extends keyof R & string,
  Version extends keyof R[ResourceKey] & string,
> = {
  contract: Registry[ResourceKey][Version];
  name: ResourceKey;
};

export function KubernetesResourceWatcher<
  Resource extends BaseResource,
  R extends Registry<Resource>,
  ResourceKey extends keyof R & string,
  Version extends keyof R[ResourceKey] & string,
>(contract: R, resource: ResourceKey, version: Version) {
  return (target: Constructor<Watcher<R[ResourceKey][Version]>>) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, {
      contract: contract[resource][version],
      name: resource,
    })(target);
    SetMetadata(KUBERNETES_RESOURCE, {
      contract: contract[resource][version],
      name: resource,
    })(target);
  };
}
