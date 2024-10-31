import {
  Injectable,
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  WalletRepository,
  HttpSuccess,
  ResponseMessage,
  FlutterWaveService,
  UserRepository,
} from 'src/lib';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly flutterWaveService: FlutterWaveService,
  ) {}

  /**
   * Initiates funding of the user's wallet via Flutterwave.
   * @param userId - ID of the user
   * @param fundWalletDto - DTO containing the amount to fund
   * @returns A success response containing the payment link
   */
  async fundWallet(
    userId: number,
    fundWalletDto: FundWalletDto,
  ): Promise<HttpSuccess<any>> {
    const { amount } = fundWalletDto;
    const user = await this.userRepository.findById(userId);

    if (!user)
      throw new NotFoundException(ResponseMessage.DYNAMIC.NOT_FOUND('User'));

    const paymentLink = await this.flutterWaveService.initiatePayment(
      amount,
      userId,
      user.email,
    );

    return new HttpSuccess(
      ResponseMessage.WALLET.FUND_INITIATED,
      { paymentLink },
      HttpStatus.OK,
    );
  }

  /**
   * Transfers funds from the user's wallet to another user's wallet.
   * @param fromUserId - ID of the sender
   * @param transferFundsDto - DTO containing recipient and amount
   * @returns Success response if transfer is successful
   */
  async transferFunds(
    fromUserId: number,
    transferFundsDto: TransferFundsDto,
  ): Promise<HttpSuccess<void>> {
    const { identifier, amount } = transferFundsDto;

    const toInfo = await this.resolveUser(identifier);

    const toUserId = toInfo.id;

    if (!toUserId)
      throw new BadRequestException(
        ResponseMessage.DYNAMIC.NOT_FOUND('User Wallet'),
      );

    const walletExists = await this.userRepository.findById(toUserId);

    if (!walletExists)
      throw new BadRequestException(
        ResponseMessage.DYNAMIC.NOT_FOUND('User Wallet'),
      );

    await this.walletRepository.transferFunds(fromUserId, toUserId, amount);

    return new HttpSuccess(
      ResponseMessage.DYNAMIC.SUCCESS('Transfer'),
      null,
      HttpStatus.OK,
    );
  }

  /**
   * Withdraws funds from the user's wallet and initiates a payout.
   * @param userId - ID of the user
   * @param withdrawDto - DTO containing withdrawal amount and bank details
   * @returns Success response if withdrawal and payout are successful
   */
  async withdraw(
    userId: number,
    withdrawDto: WithdrawDto,
  ): Promise<HttpSuccess<void>> {
    const { amount, accountNumber, bankCode } = withdrawDto;

    await this.walletRepository.withdraw(
      userId,
      amount,
      accountNumber,
      bankCode,
    );

    return new HttpSuccess(
      ResponseMessage.DYNAMIC.SUCCESS('Withdrawal'),
      null,
      HttpStatus.OK,
    );
  }

  /**
   * Retrieves the current balance of the user's wallet.
   * @param userId - ID of the user
   * @returns Success response with the current wallet balance
   */
  async getBalance(userId: number): Promise<HttpSuccess<any>> {
    const balance = await this.walletRepository.getBalance(userId);

    return new HttpSuccess(
      ResponseMessage.DYNAMIC.SUCCESS('Balance retrieved'),
      { balance },
      HttpStatus.OK,
    );
  }

  /**
   * Retrieves a list of supported banks for fund transfer.
   * @returns Success response with the list of banks
   */
  async getSupportedBanks(): Promise<HttpSuccess<any>> {
    const banks = await this.flutterWaveService.getBankList();

    return new HttpSuccess(
      ResponseMessage.DYNAMIC.SUCCESS('Banks retrieved'),
      { banks },
      HttpStatus.OK,
    );
  }

  /**
   * Resolves a user by ID or email.
   * @param identifier - User ID or email address.
   * @returns The user object with the resolved ID.
   */
  private async resolveUser(
    identifier: number | string,
  ): Promise<{ id: number }> {
    const user = await this.userRepository.findByEmail(identifier as string);

    if (!user) return { id: Number(identifier) };

    return { id: user.id };
  }
}
