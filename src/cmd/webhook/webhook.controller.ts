import { Controller, HttpStatus, Post, Body, Res } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('payment')
  @ApiOperation({ summary: 'Receive payment webhook from Flutterwave' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment webhook received and processed successfully',
  })
  async handlePaymentWebhook(
    @Body() webhookData: any,
    @Res() res: Response,
  ): Promise<void> {
    await this.webhookService.processPaymentWebhook(webhookData);
    res
      .status(HttpStatus.OK)
      .json({ message: 'Webhook processed successfully' });
  }
}
