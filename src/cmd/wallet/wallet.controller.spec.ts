import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { HttpStatus } from '@nestjs/common';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            fundWallet: jest.fn(),
            transferFunds: jest.fn(),
            withdraw: jest.fn(),
            getBalance: jest.fn(),
            getSupportedBanks: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fundWallet', () => {
    it('should fund wallet and return payment link', async () => {
      const fundWalletDto: FundWalletDto = { amount: 1000 };
      const mockResult = {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Success',
        data: null,
      };

      jest.spyOn(service, 'fundWallet').mockResolvedValue(mockResult);

      const result = await controller.fundWallet(1, fundWalletDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('transferFunds', () => {
    it('should transfer funds and return success', async () => {
      const transferFundsDto: TransferFundsDto = {
        identifier: '2',
        amount: 500,
      };
      const mockResult = {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Transfer successful',
        data: null,
      };

      jest.spyOn(service, 'transferFunds').mockResolvedValue(mockResult);

      const result = await controller.transferFunds(1, transferFundsDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const withdrawDto: WithdrawDto = {
        amount: 300,
        accountNumber: '1234567890',
        bankCode: 'XYZ',
      };
      const mockResult = {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Withdrawal successful',
        data: null,
      };

      jest.spyOn(service, 'withdraw').mockResolvedValue(mockResult);

      const result = await controller.withdraw(1, withdrawDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getBalance', () => {
    it('should retrieve wallet balance', async () => {
      const mockResult = {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Balance retrieved',
        data: { balance: 5000 },
      };

      jest.spyOn(service, 'getBalance').mockResolvedValue(mockResult);

      const result = await controller.getBalance(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getSupportedBanks', () => {
    it('should retrieve supported banks list', async () => {
      const mockBanks = [{ code: 'XYZ', name: 'Bank XYZ' }];
      const mockResult = {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Banks retrieved',
        data: mockBanks,
      };

      jest.spyOn(service, 'getSupportedBanks').mockResolvedValue(mockResult);

      const result = await controller.getSupportedBanks();
      expect(result).toEqual(mockResult);
    });
  });
});
