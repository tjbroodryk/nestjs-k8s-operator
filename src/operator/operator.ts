import Operator, { ResourceEventType } from '@dot-i/k8s-operator';
import { Injectable, Logger } from '@nestjs/common';
import { Config } from '../config';
import { KubernetesResourceWatcher } from '../resource-watcher.interface';

interface WatcherConfig {
  org: string;

  kind: string;

  version: string;
}

interface Watcher {
  config: WatcherConfig;
  handler: KubernetesResourceWatcher<unknown>;
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

  constructor(private readonly config: Config) {
    super(new K8sLogger());
  }

  private readonly watchers: Watcher[] = [];

  public addWatcher(
    config: WatcherConfig,
    handler: KubernetesResourceWatcher<unknown>,
  ): void {
    this.watchers.push({
      config,
      handler,
    });
  }

  public async start(): Promise<void> {
    if (!this.config.enabled) {
      this._logger.debug(`Kubernetes operator not enabled - not starting`);
      return;
    }

    return super.start();
  }

  public stop(): void {
    if (!this.config.enabled) {
      return;
    }

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
            const object = e.object;
            switch (e.type) {
              case ResourceEventType.Added:
                this._logger.debug(
                  `Resource added: ${object.apiVersion}.${object.kind}`,
                );
                watcher.handler.added(object);
                break;
              case ResourceEventType.Modified:
                this._logger.debug(
                  `Resource modified: ${object.apiVersion}.${object.kind}`,
                );
                watcher.handler.modified(object);
                break;
              case ResourceEventType.Deleted:
                this._logger.debug(
                  `Resource deleted: ${object.apiVersion}.${object.kind}`,
                );
                watcher.handler.deleted(object);
                break;
            }
          },
        );
      }),
    );
  }
}
