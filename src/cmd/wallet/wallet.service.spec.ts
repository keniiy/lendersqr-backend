import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import {
  UserRepository,
  WalletRepository,
  FlutterWaveService,
  ResponseMessage,
} from 'src/lib';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferFundsDto } from './dto/transfer-funds.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { HttpStatus, NotFoundException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let userRepository: UserRepository;
  let walletRepository: WalletRepository;
  let flutterWaveService: FlutterWaveService;

  const mockUserId = 1;
  const mockUser = {
    id: mockUserId,
    name: 'John Doe',
    email: 'user@example.com',
    password: 'password',
    session_token: 'session_token',
    session_expires_at: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    is_active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: WalletRepository,
          useValue: {
            getBalance: jest.fn(),
            transferFunds: jest.fn(),
            withdraw: jest.fn(),
          },
        },
        {
          provide: FlutterWaveService,
          useValue: {
            initiatePayment: jest.fn(),
            getBankList: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    userRepository = module.get<UserRepository>(UserRepository);
    walletRepository = module.get<WalletRepository>(WalletRepository);
    flutterWaveService = module.get<FlutterWaveService>(FlutterWaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fundWallet', () => {
    it('should initiate wallet funding and return payment link', async () => {
      const fundWalletDto: FundWalletDto = { amount: 1000 };
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(flutterWaveService, 'initiatePayment')
        .mockResolvedValue('https://payment-link');

      const result = await service.fundWallet(mockUserId, fundWalletDto);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.WALLET.FUND_INITIATED);
      expect(result.data).toHaveProperty('paymentLink', 'https://payment-link');
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
      const fundWalletDto: FundWalletDto = { amount: 1000 };

      await expect(
        service.fundWallet(mockUserId, fundWalletDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('transferFunds', () => {
    const transferFundsDto: TransferFundsDto = { identifier: '2', amount: 500 };

    it('should transfer funds successfully', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);
      jest
        .spyOn(walletRepository, 'transferFunds')
        .mockResolvedValue(undefined);

      const result = await service.transferFunds(mockUserId, transferFundsDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(ResponseMessage.DYNAMIC.SUCCESS('Transfer'));
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const withdrawDto: WithdrawDto = {
        amount: 300,
        accountNumber: '1234567890',
        bankCode: 'XYZ',
      };
      jest.spyOn(walletRepository, 'withdraw').mockResolvedValue(undefined);

      const result = await service.withdraw(mockUserId, withdrawDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(
        ResponseMessage.DYNAMIC.SUCCESS('Withdrawal'),
      );
    });
  });

  describe('getBalance', () => {
    it('should retrieve wallet balance successfully', async () => {
      jest.spyOn(walletRepository, 'getBalance').mockResolvedValue(5000);

      const result = await service.getBalance(mockUserId);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(
        ResponseMessage.DYNAMIC.SUCCESS('Balance retrieved'),
      );
      expect(result.data).toHaveProperty('balance', 5000);
    });
  });

  describe('getSupportedBanks', () => {
    it('should retrieve supported banks list successfully', async () => {
      const mockBanks = [{ code: 'XYZ', name: 'Bank XYZ' }];
      jest
        .spyOn(flutterWaveService, 'getBankList')
        .mockResolvedValue(mockBanks);

      const result = await service.getSupportedBanks();
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(
        ResponseMessage.DYNAMIC.SUCCESS('Banks retrieved'),
      );
    });
  });

  describe('resolveUser', () => {
    it('should resolve user by email', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service['resolveUser']('user@example.com');
      expect(result.id).toBe(1);
    });

    it('should resolve user by ID', async () => {
      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      const result = await service['resolveUser'](mockUserId);
      expect(result.id).toBe(mockUserId);
    });
  });
});
