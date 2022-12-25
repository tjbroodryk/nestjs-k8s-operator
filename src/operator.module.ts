import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { KubernetesOperator } from './operator/operator';
import { KUBERNETES_RESOURCE } from './constants';
import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { OnModuleDestroy } from '@nestjs/common';
import { BaseResource } from './utils/contract';
import { Watcher, WatcherMeta } from './decorators/resource';

export type ModuleOptions = {
  enabled: boolean;
};
export const MODULE_OPTIONS = 'KubernetesOperatorModule_Options';

@Module({
  imports: [DiscoveryModule],
  providers: [KubernetesOperator],
})
export class KubernetesOperatorModule
  extends createConfigurableDynamicRootModule<
    KubernetesOperatorModule,
    ModuleOptions
  >(MODULE_OPTIONS)
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(KubernetesOperatorModule.name);

  constructor(
    private readonly discover: DiscoveryService,
    private readonly operator: KubernetesOperator,
    @Inject(MODULE_OPTIONS) private readonly config: ModuleOptions,
  ) {
    super();
  }

  async onModuleDestroy() {
    if (!this.config.enabled) {
      return;
    }

    return this.operator.stop();
  }

  public async onModuleInit() {
    if (!this.config.enabled) {
      this.logger.debug(`Kubernetes operator not enabled - not starting`);
      return;
    }

    const providers = await this.discover.providersWithMetaAtKey<
      WatcherMeta<any, any, any>
    >(KUBERNETES_RESOURCE);

    providers.forEach((provider) => {
      const instance = provider.discoveredClass
        .instance as Watcher<BaseResource>;

      this.logger.log(
        `Mapped kubernetes resource watcher {${provider.meta.name}}`,
      );

      this.operator.addWatcher(provider.meta.contract, instance);
    });

    await this.operator.start();
  }
}
