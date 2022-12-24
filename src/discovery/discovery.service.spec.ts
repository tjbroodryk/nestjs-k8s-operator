import { HandlerService } from './discovery.service';
import { DiscoveryModule, DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Test } from '@nestjs/testing';

describe('discovery service', () => {
  describe('the getHandlers method', () => {
    const reflectorGet = jest.fn((_, metatype) => metatype);
    const getProviders = jest.fn(() => [
      {
        metatype: undefined,
      },
      {
        metatype: 'some_other_thing',
      },
    ]);
    let handlers: InstanceWrapper[];

    beforeAll(async () => {
      const service = await getService(reflectorGet, getProviders);
      handlers = service.getHandlers();
    });

    it('should only return kubernetes resource watchers', () => {
      expect(handlers).toHaveLength(1);
    });
    it('should ignore instances with no metatype', () => {
      expect(handlers.some((x) => !x.metatype)).toBeFalsy();
    });
  });
});

async function getService(reflectorGet, getProviders): Promise<HandlerService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      HandlerService,
      {
        provide: Reflector,
        useValue: {
          get: reflectorGet,
        },
      },
      {
        provide: DiscoveryService,
        useValue: {
          getProviders,
        },
      },
    ],
  }).compile();

  return moduleRef.get<HandlerService>(HandlerService);
}
