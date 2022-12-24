import { Test, TestingModule } from '@nestjs/testing';
import { KubernetesOperator } from '../operator/operator';
import { ShutdownService } from './shutdown.service';

describe('ShutdownService', () => {
  let service: ShutdownService;
  const operatorMock = {
    stop: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShutdownService,
        {
          provide: KubernetesOperator,
          useValue: operatorMock,
        },
      ],
    }).compile();

    service = module.get<ShutdownService>(ShutdownService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should stop operator on shutdown', () => {
    service.onModuleDestroy();
    expect(operatorMock.stop).toHaveBeenCalledTimes(1);
  });
});
