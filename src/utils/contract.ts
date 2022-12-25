import * as z from 'zod';
import { StringLiteral } from './type-magic';

class TypeBuilder<R, T extends Record<string, R> = {}> {
  protected constructor(protected readonly jsonObject: T) {}

  static create<K>(): TypeBuilder<K> {
    return new TypeBuilder({});
  }

  build(): T {
    return this.jsonObject;
  }
}

const baseSpec = z.object({});

const baseMeta = z.object({});

export type BaseResource = {
  org: string;
  version: string;
  kind: string;
  spec: typeof baseSpec;
  metadata: typeof baseMeta;
};

export class CustomResourceContract<
  Resource extends BaseResource,
  T extends Record<string, Resource> = {},
> extends TypeBuilder<Resource, T> {
  constructor(private readonly org: string, jsonObject: T) {
    super(jsonObject);
  }

  static createForOrg<Resource extends BaseResource>(
    org: string,
  ): CustomResourceContract<Resource, {}> {
    return new CustomResourceContract(org, {});
  }

  kind<K extends string>(
    kind: StringLiteral<K>,
  ): VersionBuilder<Resource, K, T> {
    return new VersionBuilder(this.org, kind, this.jsonObject);
  }
}

class VersionBuilder<
  Resource extends BaseResource,
  Kind extends string,
  T extends Record<string, Resource> = {},
> {
  constructor(
    private readonly org: string,
    private readonly kind: Kind,
    private readonly jsonObject: T,
  ) {}

  version<V extends Resource>(
    version: string,
    value: Pick<V, 'spec' | 'metadata'>,
  ): CustomResourceContract<V, T & { [k in Kind]: V }> {
    const nextPart = {
      [this.kind]: {
        kind: this.kind,
        org: this.org,
        version,
        ...value,
      },
    } as unknown as Record<Kind, V>;
    return new CustomResourceContract(this.org, {
      ...this.jsonObject,
      ...nextPart,
    });
  }
}
