import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { HandlerService } from '../discovery/discovery.service';
import { KubernetesOperator } from '../operator/operator';
import { ExplorerService } from './explorer.service';

describe('ExplorerService', () => {
  describe('given valid watchers', () => {
    let service: ExplorerService;
    const handlers = [
      {
        instance: {
          added: () => {},
          modified: () => {},
          deleted: () => {},
        },
      },
      {
        instance: {
          added: () => {},
          modified: () => {},
          deleted: () => {},
        },
      },
    ];
    const handlerMock = {
      getHandlers: jest.fn(() => handlers),
    };
    const operatorMock = {
      addWatcher: jest.fn(),
      start: jest.fn(),
    };

    beforeAll(async () => {
      service = await createService(handlerMock, operatorMock);

      await service.onModuleInit();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should implement module init lifecycle', () => {
      expect(service.onModuleInit).toBeDefined();
    });

    it('should add all valid watchers to the operator', () => {
      expect(operatorMock.addWatcher).toHaveBeenCalledTimes(2);
    });

    it('should start the operator', () => {
      expect(operatorMock.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('given added method does not exist', () => {
    let service: ExplorerService;
    const handlers = [
      {
        instance: {
          modified: () => {},
          deleted: () => {},
        },
      },
    ];
    const handlerMock = {
      getHandlers: jest.fn(() => handlers),
    };
    const operatorMock = {
      addWatcher: jest.fn(),
      start: jest.fn(),
    };

    beforeAll(async () => {
      service = await createService(handlerMock, operatorMock);
    });

    it('should throw', () => {
      expect(() => service.onModuleInit()).rejects.toThrow();
    });
  });

  describe('given modified method does not exist', () => {
    let service: ExplorerService;
    const handlers = [
      {
        instance: {
          added: () => {},
          deleted: () => {},
        },
      },
    ];
    const handlerMock = {
      getHandlers: jest.fn(() => handlers),
    };
    const operatorMock = {
      addWatcher: jest.fn(),
      start: jest.fn(),
    };

    beforeAll(async () => {
      service = await createService(handlerMock, operatorMock);
    });

    it('should throw', () => {
      expect(() => service.onModuleInit()).rejects.toThrow();
    });
  });

  describe('given deleted method does not exist', () => {
    let service: ExplorerService;
    const handlers = [
      {
        instance: {
          added: () => {},
          modified: () => {},
        },
      },
    ];
    const handlerMock = {
      getHandlers: jest.fn(() => handlers),
    };
    const operatorMock = {
      addWatcher: jest.fn(),
      start: jest.fn(),
    };

    beforeAll(async () => {
      service = await createService(handlerMock, operatorMock);
    });

    it('should throw', () => {
      expect(() => service.onModuleInit()).rejects.toThrow();
    });
  });
});

async function createService(
  handlerMock,
  operatorMock,
): Promise<ExplorerService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ExplorerService,
      {
        provide: HandlerService,
        useValue: handlerMock,
      },
      {
        provide: Reflector,
        useValue: {
          get: jest.fn(),
        },
      },
      {
        provide: KubernetesOperator,
        useValue: operatorMock,
      },
    ],
  }).compile();

  return module.get<ExplorerService>(ExplorerService);
}
