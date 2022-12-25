import { CustomResourceContract } from './contract';
import * as z from 'zod';

describe(CustomResourceContract.name, () => {
  describe('given multiple versions', () => {
    it('should nest them under the "kind"', () => {
      const obj = CustomResourceContract.createForOrg('test')
        .kind('foo')
        .version('v1', {
          spec: z.object({
            foo: z.string(),
          }),
          metadata: z.object({}),
        })
        .kind('foo')
        .version('v2', {
          spec: z.object({
            bla: z.string(),
          }),
          metadata: z.object({}),
        })
        .build();

      expect(obj.foo.v1.spec._def.shape().foo).toBeDefined();
      //@ts-expect-error
      expect(obj.foo.v1.spec._def.shape().bla).toBeUndefined();

      expect(obj.foo.v2.spec._def.shape().bla).toBeDefined();

      //@ts-expect-error
      expect(obj.foo.v2.spec._def.shape().foo).toBeUndefined();
    });
  });
});
