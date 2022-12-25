import Operator, { ResourceEventType } from '@dot-i/k8s-operator';
import { KubernetesObject } from '@kubernetes/client-node';
import { Injectable, Logger } from '@nestjs/common';
import { Config } from '../config';
import { BaseResource } from 'src/utils/contract';
import { Watcher as Handler } from '../decorators/resource';

interface Watcher {
  config: BaseResource;
  handler: Handler<any>;
}

class K8sLogger extends Logger {
  info(message: any, context?: string) {
    if (context) {
      return super.log(message, context);
    }
    return super.log(message);
  }
}

@Injectable()
export class KubernetesOperator extends Operator {
  private readonly _logger = new Logger(KubernetesOperator.name);

  constructor() {
    super(new K8sLogger());
  }

  private readonly watchers: Watcher[] = [];

  public addWatcher(config: BaseResource, handler: Handler<any>): void {
    this.watchers.push({
      config,
      handler,
    });
  }

  public async start(): Promise<void> {
    return super.start();
  }

  public stop(): void {
    return super.stop();
  }

  protected async init() {
    await Promise.all(
      this.watchers.map((watcher) => {
        return this.watchResource(
          watcher.config.org,
          watcher.config.version,
          watcher.config.kind,
          async (e) => {
            const object = e.object as KubernetesObject & {
              spec: Record<string, any>;
            };

            const resource = {
              spec: watcher.config.spec.parse(object.spec),
              metadata: watcher.config.metadata.parse(object.metadata),
            };

            switch (e.type) {
              case ResourceEventType.Added:
                this._logger.debug(
                  `Resource added: ${object.apiVersion}.${object.kind}`,
                );
                await watcher.handler.added(resource);
                break;
              case ResourceEventType.Modified:
                this._logger.debug(
                  `Resource modified: ${object.apiVersion}.${object.kind}`,
                );
                await watcher.handler.modified(resource);
                break;
              case ResourceEventType.Deleted:
                this._logger.debug(
                  `Resource deleted: ${object.apiVersion}.${object.kind}`,
                );
                await watcher.handler.deleted(resource);
                break;
            }
          },
        );
      }),
    );
  }
}
