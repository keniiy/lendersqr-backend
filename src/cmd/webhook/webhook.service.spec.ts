import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { WalletRepository } from 'src/lib';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: WalletRepository, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('mockSecretHash'),
          },
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
