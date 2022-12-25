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

  add<K extends string, V extends R>(
    key: StringLiteral<K>,
    value: V,
  ): TypeBuilder<R, T & { [k in K]: V }> {
    const nextPart = {
      [key]: value,
    };
    return new TypeBuilder({ ...this.jsonObject, ...nextPart });
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
  protected constructor(private readonly org: string, jsonObject: T) {
    super(jsonObject);
  }

  static createForOrg<Resource extends BaseResource>(
    org: string,
  ): CustomResourceContract<Resource, {}> {
    return new CustomResourceContract(org, {});
  }

  kind<K extends string, V extends Resource>(
    kind: StringLiteral<K>,
    value: Pick<V, 'spec' | 'version' | 'metadata'>,
  ): CustomResourceContract<V, T & { [k in K]: V }> {
    const nextPart = {
      [kind]: {
        kind,
        org: this.org,
        ...value,
      },
    } as unknown as Record<K, V>;
    return new CustomResourceContract(this.org, {
      ...this.jsonObject,
      ...nextPart,
    });
  }
}
