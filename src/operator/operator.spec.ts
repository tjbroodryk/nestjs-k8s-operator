import Operator, { ResourceEventType } from '@dot-i/k8s-operator';
import { Test, TestingModule } from '@nestjs/testing';
import { Config } from '../config';
import { KubernetesOperator } from './operator';

const startMock = jest.fn();
const stopMock = jest.fn();

jest.mock('@dot-i/k8s-operator', () => ({
  ResourceEventType: {
    Added: 'ADDED',
    Modified: 'MODIFIED',
    Deleted: 'DELETED',
  },
  default: class {
    callbacks = [];

    watchResource(_: string, _1: string, _2: string, callback: Function) {
      this.callbacks.push(callback);
    }

    async init() {}

    async start() {
      await this.init();
      startMock();
    }

    stop() {
      stopMock();
    }
  },
}));

describe('operator', () => {
  describe('the start method', () => {
    describe('when enabled', () => {
      let operator: KubernetesOperator;
      const watcherMock = {
        added: jest.fn(),
        modified: jest.fn(),
        deleted: jest.fn(),
      };

      beforeAll(async () => {
        startMock.mockClear();

        operator = await createService({
          enabled: true,
        });
        operator.addWatcher({} as any, watcherMock as any);

        await operator.start();
      });

      it('should start the operator', () => {
        expect(startMock).toHaveBeenCalled();
      });

      describe('given added event', () => {
        beforeAll(() => {
          (operator as any).callbacks.forEach((fn) => {
            fn({
              type: ResourceEventType.Added,
              object: {
                foo: 'bar',
              },
            });
          });
        });

        it('should run each registered watcher', () => {
          expect(watcherMock.added).toHaveBeenCalledWith({
            foo: 'bar',
          });
        });
      });

      describe('given modified event', () => {
        beforeAll(() => {
          (operator as any).callbacks.forEach((fn) => {
            fn({
              type: ResourceEventType.Modified,
              object: {
                foo: 'bar',
              },
            });
          });
        });

        it('should run each registered watcher', () => {
          expect(watcherMock.modified).toHaveBeenCalledWith({
            foo: 'bar',
          });
        });
      });

      describe('given deleted event', () => {
        beforeAll(() => {
          (operator as any).callbacks.forEach((fn) => {
            fn({
              type: ResourceEventType.Deleted,
              object: {
                foo: 'bar',
              },
            });
          });
        });

        it('should run each registered watcher', () => {
          expect(watcherMock.deleted).toHaveBeenCalledWith({
            foo: 'bar',
          });
        });
      });
    });
    describe('when not enabled', () => {
      beforeAll(async () => {
        startMock.mockClear();
        const operator = await createService({
          enabled: false,
        });
        await operator.start();
      });

      it('should not start the operator', () => {
        expect(startMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('the stop method', () => {
    describe('when enabled', () => {
      beforeAll(async () => {
        stopMock.mockClear();
        const operator = await createService({
          enabled: true,
        });
        operator.stop();
      });

      it('should stop the operator', () => {
        expect(stopMock).toHaveBeenCalled();
      });
    });

    describe('when not enabled', () => {
      beforeAll(async () => {
        stopMock.mockClear();
        const operator = await createService({
          enabled: false,
        });
        operator.stop();
      });

      it('should do nothing', () => {
        expect(stopMock).not.toHaveBeenCalled();
      });
    });
  });
});

async function createService(configMock): Promise<KubernetesOperator> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      KubernetesOperator,
      {
        provide: Config,
        useValue: configMock,
      },
    ],
  }).compile();

  return module.get<KubernetesOperator>(KubernetesOperator);
}
