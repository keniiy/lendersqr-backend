import {
  Controller,
  HttpStatus,
  Post,
  Body,
  Res,
  Headers,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from 'src/lib';

@Controller({
  path: 'webhook',
  version: '1',
})
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('listen')
  @ApiOperation({ summary: 'Receive payment webhook from Flutterwave' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.DYNAMIC.SUCCESS('Webhook processed'),
  })
  async handlePaymentWebhook(
    @Body() webhookData: any,
    @Headers('verif-hash') signature: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.webhookService.processPaymentWebhook(webhookData, signature);
    res
      .status(HttpStatus.OK)
      .json({ message: ResponseMessage.DYNAMIC.SUCCESS('Webhook processed') });
  }
}
