import { ResourceEvent, ResourceEventType } from '@dot-i/k8s-operator';
import { Test, TestingModule } from '@nestjs/testing';
import { Config } from '../config';
import { KubernetesOperator } from './operator';
import * as z from 'zod';

const startMock = jest.fn();
const stopMock = jest.fn();

interface MockOperator {
  runCallbacks(
    e: Pick<ResourceEvent, 'object' | 'type'> & {
      object: { spec: Record<string, unknown> };
    },
  ): Promise<void>;
}

jest.mock('@dot-i/k8s-operator', () => ({
  ResourceEventType: {
    Added: 'ADDED',
    Modified: 'MODIFIED',
    Deleted: 'DELETED',
  },
  default: class implements MockOperator {
    callbacks: any[] = [];

    watchResource(_: string, _1: string, _2: string, callback: Function) {
      this.callbacks.push(callback);
    }

    async init() {}

    async start() {
      await this.init();
      startMock();
    }

    async runCallbacks(
      e: Pick<ResourceEvent, 'object' | 'type'> & {
        object: { spec: Record<string, unknown> };
      },
    ) {
      for (const callback of this.callbacks) {
        await callback(e);
      }
    }

    stop() {
      stopMock();
    }
  },
}));

describe('operator', () => {
  describe('the start method', () => {
    let operator: KubernetesOperator & MockOperator;
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
      operator.addWatcher(
        {
          kind: 'foo',
          org: 'test',
          version: 'v1',
          metadata: z.object({
            name: z.string(),
          }),
          spec: z.object({
            foo: z.string(),
          }),
        },
        watcherMock as any,
      );

      await operator.start();
    });

    it('should start the operator', () => {
      expect(startMock).toHaveBeenCalled();
    });

    describe('given added event', () => {
      describe('given valid resource', () => {
        beforeAll(async () => {
          await operator.runCallbacks({
            type: ResourceEventType.Added,
            object: {
              spec: {
                foo: 'bar',
              },
              metadata: {
                name: 'test',
              },
            },
          });
        });

        it('should run each registered watcher', () => {
          expect(watcherMock.added).toHaveBeenCalledWith({
            spec: {
              foo: 'bar',
            },
            metadata: {
              name: 'test',
            },
          });
        });
      });

      describe('given invalid resource', () => {
        it('should throw', () => {
          expect(
            async () =>
              await operator.runCallbacks({
                type: ResourceEventType.Added,
                object: {
                  spec: {},
                  metadata: {
                    name: 'test',
                  },
                },
              }),
          ).rejects.toThrow();
        });
      });
    });

    describe('given modified event', () => {
      describe('given valid resource', () => {
        beforeAll(async () => {
          await operator.runCallbacks({
            type: ResourceEventType.Modified,
            object: {
              spec: {
                foo: 'bar',
              },
              metadata: {
                name: 'test',
              },
            },
          });
        });

        it('should run each registered watcher', () => {
          expect(watcherMock.modified).toHaveBeenCalledWith({
            spec: {
              foo: 'bar',
            },
            metadata: {
              name: 'test',
            },
          });
        });
      });

      describe('given invalid resource', () => {
        it('should throw', () => {
          expect(
            async () =>
              await operator.runCallbacks({
                type: ResourceEventType.Modified,
                object: {
                  spec: {
                    foo: 'bla',
                  },
                  metadata: {},
                },
              }),
          ).rejects.toThrow();
        });
      });
    });

    describe('given deleted event', () => {
      describe('given valid resource', () => {
        beforeAll(async () => {
          await operator.runCallbacks({
            type: ResourceEventType.Deleted,
            object: {
              spec: {
                foo: 'bar',
              },
              metadata: {
                name: 'test',
              },
            },
          });
        });

        it('should run each registered watcher', () => {
          expect(watcherMock.deleted).toHaveBeenCalledWith({
            spec: {
              foo: 'bar',
            },
            metadata: {
              name: 'test',
            },
          });
        });
      });

      describe('given invalid resource', () => {
        it('should throw', () => {
          expect(
            async () =>
              await operator.runCallbacks({
                type: ResourceEventType.Deleted,
                object: {
                  spec: {
                    foo: 'bla',
                  },
                  metadata: {},
                },
              }),
          ).rejects.toThrow();
        });
      });
    });
  });

  describe('the stop method', () => {
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
});

async function createService(
  configMock,
): Promise<KubernetesOperator & MockOperator> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      KubernetesOperator,
      {
        provide: Config,
        useValue: configMock,
      },
    ],
  }).compile();

  return module.get<KubernetesOperator & MockOperator>(KubernetesOperator);
}
