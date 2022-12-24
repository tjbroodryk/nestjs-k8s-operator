import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { KUBERNETES_RESOURCE } from '../constants';
import { HandlerService } from '../discovery/discovery.service';
import { KubernetesOperator } from '../operator/operator';

@Injectable()
export class ExplorerService implements OnModuleInit {
  private readonly logger = new Logger(ExplorerService.name);
  constructor(
    private readonly discoveryService: HandlerService,
    private readonly reflector: Reflector,
    private readonly operator: KubernetesOperator,
  ) {}

  async onModuleInit() {
    await this.explore();
  }

  private async explore(): Promise<void> {
    const providers: InstanceWrapper[] = this.discoveryService.getHandlers();

    providers.forEach((provider) => {
      const { instance } = provider;

      this.checkMethodExists(instance, 'added', 'deleted', 'modified');

      this.logger.log(`Mapped kubernetes resource watcher {${provider.name}}`);

      const config = this.getHandlerMetadata(provider.metatype);

      this.operator.addWatcher(config, instance);
    });

    await this.operator.start();
  }

  private getHandlerMetadata(target: Type<any> | Function): any {
    return this.reflector.get(KUBERNETES_RESOURCE, target);
  }

  private checkMethodExists(instance: unknown, ...methodNames: string[]) {
    methodNames.forEach((methodName) => {
      if (typeof instance[methodName] !== 'function') {
        throw new Error(
          `Invalid kubernetes resource watcher. Watcher instance must have a .${methodName} method`,
        );
      }
    });
  }
}
