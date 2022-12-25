import * as z from 'zod';
import { StringLiteral } from './type-magic';
import { Spread } from 'type-fest';

const baseSpec = z.object({});

const baseMeta = z.object({});

type BaseContract = {
  spec: typeof baseSpec;
  metadata: typeof baseMeta;
};

export type BaseResource = {
  org: string;
  kind: string;
  version: string;
} & BaseContract;

export type Registry<R extends BaseResource = BaseResource> = Record<
  string,
  Record<string, R>
>;

export class CustomResourceContract<T extends Registry = {}> {
  constructor(private readonly org: string, private readonly jsonObject: T) {}

  static createForOrg(org: string): CustomResourceContract<{}> {
    return new CustomResourceContract(org, {});
  }

  kind<K extends string>(kind: StringLiteral<K>): VersionBuilder<K, T> {
    return new VersionBuilder(this.org, kind, this.jsonObject);
  }

  build(): T {
    return this.jsonObject;
  }
}

class VersionBuilder<
  Kind extends string,
  T extends Record<Kind, Record<string, unknown>>,
> {
  constructor(
    private readonly org: string,
    private readonly kind: Kind,
    private readonly jsonObject: T,
  ) {}

  version<Version extends string, V extends BaseContract>(
    version: StringLiteral<Version>,
    value: V,
  ): CustomResourceContract<
    T & { [k in Kind]: { [v in Version]: V & BaseResource } }
  > {
    const nextPart = {
      [this.kind]: {
        ...this.jsonObject[this.kind],
        [version]: {
          kind: this.kind,
          org: this.org,
          version,
          ...value,
        } as unknown as V,
      },
    } as unknown as Record<
      Kind,
      Record<Version & keyof Kind, V & BaseResource>
    >;
    return new CustomResourceContract(this.org, {
      ...this.jsonObject,
      ...nextPart,
    });
  }
}
