import { KubernetesOperatorModule } from './operator.module';
import { Test } from '@nestjs/testing';
import { KubernetesOperator } from './operator/operator';
import * as z from 'zod';
import { Injectable } from '@nestjs/common';
import {
  CustomResource,
  KubernetesResourceWatcher,
} from './decorators/resource';
import { CustomResourceContract } from './utils/contract';

const specType = z.object({
  test: z.string(),
  bla: z.string(),
});

const contract = CustomResourceContract.createForOrg('cotera')
  .kind('foo', {
    version: 'v1',
    spec: specType,
    metadata: z.object({}),
  })
  .build();

@Injectable()
@KubernetesResourceWatcher(contract, 'foo')
export class TestWatcher {
  async added(crd: CustomResource<typeof contract.foo>) {}

  async modified(crd: CustomResource<typeof contract.foo>) {}

  async deleted(crd: CustomResource<typeof contract.foo>) {}
}

describe(KubernetesOperatorModule.name, () => {
  describe('when enabled', () => {
    let mocks: {
      start: jest.Mock;
      stop: jest.Mock;
      addWatcher: jest.Mock;
    };
    let operatorModule: KubernetesOperatorModule;

    beforeEach(async () => {
      const { operatorModule: m, ...rest } = await createModule();
      mocks = rest;
      operatorModule = m;
    });

    it('should start operator on app start', () => {
      expect(mocks.start).toHaveBeenCalledTimes(1);
    });

    it('should stop operator on shutdown', async () => {
      await operatorModule.onModuleDestroy();
      expect(mocks.stop).toHaveBeenCalledTimes(1);
    });

    it('should register resource watchers', () => {
      expect(mocks.addWatcher).toHaveBeenCalledWith(
        contract.foo,
        expect.any(TestWatcher),
      );
    });
  });

  describe('when not enabled', () => {
    let mocks: {
      start: jest.Mock;
      stop: jest.Mock;
      addWatcher: jest.Mock;
    };
    let operatorModule: KubernetesOperatorModule;

    beforeEach(async () => {
      const { operatorModule: m, ...rest } = await createModule(false);
      mocks = rest;
      operatorModule = m;
    });

    it('should not start operator', () => {
      expect(mocks.start).not.toHaveBeenCalled();
    });

    it('should not stop operator', async () => {
      await operatorModule.onModuleDestroy();
      expect(mocks.stop).not.toHaveBeenCalled();
    });
  });
});

async function createModule(enabled: boolean = true) {
  const addWatcher = jest.fn();
  const start = jest.fn(() => Promise.resolve());
  const stop = jest.fn(() => Promise.resolve());

  const module = await Test.createTestingModule({
    imports: [
      KubernetesOperatorModule.forRootAsync(KubernetesOperatorModule, {
        useFactory: () => {
          return {
            enabled,
          };
        },
      }),
    ],
    providers: [TestWatcher],
  })
    .overrideProvider(KubernetesOperator)
    .useValue({
      addWatcher,
      start,
      stop,
    })
    .compile();

  const app = module.createNestApplication();
  const operatorModule = app.get(KubernetesOperatorModule);
  await operatorModule.onModuleInit();

  return {
    start,
    addWatcher,
    stop,
    operatorModule,
  };
}
