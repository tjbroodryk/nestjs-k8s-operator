import { Injectable } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { KUBERNETES_RESOURCE } from '../constants';

@Injectable()
export class HandlerService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  getHandlers(): InstanceWrapper[] {
    return this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) => {
        if (!wrapper.metatype) {
          return false;
        }
        return this.reflector.get(KUBERNETES_RESOURCE, wrapper.metatype);
      });
  }
}
