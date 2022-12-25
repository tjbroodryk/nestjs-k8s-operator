<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS K8s Operator Module</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

Typesafe, contract-driven kubernetes operator module for a NestJS application.

Use [https://github.com/colinhacks/zod](zod) object defintions to create typesafe resource watchers, with automatic validation of crds.

### Installation

```bash
npm i nestjs-k8s-operator
```

## Example

1. Register in `app.module`

```typescript
@Module({
  imports: [
    KubernetesOperatorModule.forRootAsync(KubernetesOperatorModule, {
      useFactory: () => {
        return {
          enabled: true,
        };
      },
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
```

2. Create your crd schema contract

```typescript
const contract = CustomResourceContract.createForOrg('exampleOrg')
  .kind('yourResource')
  .version('v1', {
    spec: z.object({
      test: z.string(),
      bla: z.string(),
    }),
    metadata: z.object({
      name: z.string(),
    }),
  })
  .build();
```

3. Register your resource watcher

```typescript
import * as z from 'zod';
import { Injectable } from '@nestjs/common';
import {
  CustomResourceContract,
  KubernetesOperator,
  CustomResource,
  KubernetesResourceWatcher,
} from 'nestjs-k8s-operator';

@Injectable()
@KubernetesResourceWatcher(contract, 'foo')
export class ExampleWatcher {
  async added(crd: CustomResource<typeof contract.foo>) {}

  async modified(crd: CustomResource<typeof contract.foo>) {}

  async deleted(crd: CustomResource<typeof contract.foo>) {}
}
```

4. Profit
