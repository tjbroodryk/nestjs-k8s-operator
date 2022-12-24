import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { KubernetesOperator } from '../operator/operator';

@Injectable()
export class ShutdownService implements OnModuleDestroy {
  constructor(private readonly operator: KubernetesOperator) {}

  onModuleDestroy() {
    this.operator.stop();
  }
}
