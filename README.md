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

### Installation

```bash
npm i nestjs-k8s-operator
```

## Example

1. Register in `app.module`

```typescript
@Module({
  imports: [
    GithubModule.create({
      config: (config: Env) => {
        return {
          token: config.token,
        };
      },
      inject: [ENV_TOKEN],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
```

2. Inject HttpClientService into your constructor

```typescript
import {
  GithubWebhook,
  EventType,
  GithubWebhookEvent,
  GithubWebhookHandler,
} from '@stockopedia/nestjs-k8s-operator';

@GithubWebhook(EventType.PullRequestOpened)
export class PullRequestHook {
  constructor(/*some dependencies*/) {}

  handle(event: GithubWebhookEvent<'pull_request.opened'>): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
```

3. Profit
