import {
  Body,
  Controller,
  HttpStatus,
  Get,
  Post,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  CurrentUser,
  ErrorResponseDto,
  HttpSuccess,
  JwtAuthGuard,
  ResponseMessage,
} from 'src/lib';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { FundWalletResponseDto } from './dto/res/fund-wallet.dto.res';
import { TransferFundsResponseDto } from './dto/res/transfer-funds.dto.res';
import { WithdrawResponseDto } from './dto/res/withdraw.dto.res';
import { BalanceResponseDto } from './dto/res/balance.dto.res';
import { BankListResponseDto } from './dto/res/bank-list.dto.res';

@Controller({
  path: 'wallet',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('fund')
  @ApiOperation({ summary: 'Initiate wallet funding' })
  @ApiBody({ type: FundWalletDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.WALLET.FUND_INITIATED,
    type: FundWalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: `${ResponseMessage.DYNAMIC.NOT_FOUND('User')} or ${ResponseMessage.WALLET.AMOUNT_MUST_BE_GREATER_THAN_ZERO}`,
    type: ErrorResponseDto,
  })
  fundWallet(
    @CurrentUser('id') userId: number,
    @Body() fundWalletDto: FundWalletDto,
  ): Promise<HttpSuccess<FundWalletResponseDto>> {
    return this.walletService.fundWallet(userId, fundWalletDto);
  }

  @Patch('transfer')
  @ApiOperation({ summary: 'Transfer funds to another user' })
  @ApiBody({ type: TransferFundsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.DYNAMIC.SUCCESS('Transfer'),
    type: TransferFundsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: `${ResponseMessage.WALLET.INSUFFICIENT_BALANCE} or ${ResponseMessage.WALLET.INVALID_TRANSFER}`,
    type: ErrorResponseDto,
  })
  transferFunds(
    @CurrentUser('id') fromUserId: number,
    @Body() transferFundsDto: TransferFundsDto,
  ): Promise<HttpSuccess<void>> {
    return this.walletService.transferFunds(fromUserId, transferFundsDto);
  }

  @Patch('withdraw')
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiBody({ type: WithdrawDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.DYNAMIC.SUCCESS('Withdraw'),
    type: WithdrawResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: `${ResponseMessage.WALLET.INSUFFICIENT_BALANCE} or ${ResponseMessage.WALLET.AMOUNT_MUST_BE_GREATER_THAN_ZERO}`,
    type: ErrorResponseDto,
  })
  withdraw(
    @CurrentUser('id') userId: number,
    @Body() withdrawDto: WithdrawDto,
  ): Promise<HttpSuccess<void>> {
    return this.walletService.withdraw(userId, withdrawDto);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.DYNAMIC.SUCCESS('Balance retrieved'),
    type: BalanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: ResponseMessage.DYNAMIC.NOT_FOUND('Wallet'),
    type: ErrorResponseDto,
  })
  getBalance(
    @CurrentUser('id') userId: number,
  ): Promise<HttpSuccess<BalanceResponseDto>> {
    return this.walletService.getBalance(userId);
  }

  @Get('banks')
  @ApiOperation({ summary: 'Get list of supported banks' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: ResponseMessage.DYNAMIC.SUCCESS('Banks retrieved'),
    type: BankListResponseDto,
  })
  getSupportedBanks(): Promise<HttpSuccess<BankListResponseDto>> {
    return this.walletService.getSupportedBanks();
  }
}
