import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  Abstract,
  DynamicModule,
  Module,
  OnModuleInit,
  Type,
} from '@nestjs/common';
import { ShutdownService } from './shutdown/shutdown.service';
import { ExplorerService } from './explorer/explorer.service';
import { HandlerService } from './discovery/discovery.service';
import { KubernetesOperator } from './operator/operator';
import { Config } from './config';
import { KUBERNETES_RESOURCE } from './constants';
import { ResourceIdentifier } from './decorators/resource';

@Module({
  imports: [DiscoveryModule],
})
export class KubernetesOperatorModule implements OnModuleInit {
  constructor(private readonly discover: DiscoveryService) {}

  public async onModuleInit() {
    const providers =
      await this.discover.providersWithMetaAtKey<ResourceIdentifier>(
        KUBERNETES_RESOURCE,
      );
  }
}
