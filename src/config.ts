import { Injectable } from '@nestjs/common';

@Injectable()
export class Config {
  enabled: boolean;
}
