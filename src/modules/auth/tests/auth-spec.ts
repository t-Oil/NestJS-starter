import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '@modules/auth/services/auth.service';
import { UserRepository } from '@repositories/user.repository';
import { OauthRepository } from '@repositories/oauth.repository';
import { LoginRequest } from '@modules/auth/requests/login.request';
import { UserEntity } from '@entities/user.entity';
import { IGenerateToken } from '@modules/auth/interfaces/generate-token.interface';
import { OauthEntity } from '@entities/oauth.entity';
import { AuthException } from '@exceptions/app/auth.exception';

describe('AuthService - login', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let oauthRepository: OauthRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => key),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOneWithActive: jest.fn(),
          },
        },
        {
          provide: OauthRepository,
          useValue: {
            store: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    oauthRepository = module.get<OauthRepository>(OauthRepository);
    jwtService = module.get<JwtService>(JwtService);

    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
  });

  it('should login successfully (happy path)', async () => {
    const payload: LoginRequest = { username: 'test@example.com', password: 'password' };
    const mockUser: UserEntity = { id: 1, password: 'hashedPassword' } as UserEntity;
    const mockToken: IGenerateToken = { accessToken: 'access', refreshToken: 'refresh' };

    jest.spyOn(userRepository, 'findOneWithActive').mockResolvedValue(mockUser);
    jest.spyOn(oauthRepository, 'store').mockResolvedValue({ token: 'token', refreshToken: 'refresh' } as OauthEntity);
    jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access').mockReturnValueOnce('refresh');

    const result = await authService.login(payload);

    expect(result).toEqual(mockToken);
    expect(userRepository.findOneWithActive).toHaveBeenCalledWith({
      where: { email: payload.username },
    });
    expect(oauthRepository.store).toHaveBeenCalledWith(mockUser.id);
  });

  it('should throw Unauthorized error if user is not found', async () => {
    const payload: LoginRequest = { username: 'invalid@example.com', password: 'password' };

    jest.spyOn(userRepository, 'findOneWithActive').mockResolvedValue(null);

    await expect(authService.login(payload)).rejects.toThrow(AuthException.Unauthorized());
    expect(userRepository.findOneWithActive).toHaveBeenCalledWith({
      where: { email: payload.username },
    });
  });

  it('should throw Unauthorized error if password does not match', async () => {
    const payload: LoginRequest = { username: 'test@example.com', password: 'wrongPassword' };
    const mockUser: UserEntity = { id: 1, password: 'hashedPassword' } as UserEntity;

    jest.spyOn(userRepository, 'findOneWithActive').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(authService.login(payload)).rejects.toThrow(AuthException.Unauthorized());
    expect(userRepository.findOneWithActive).toHaveBeenCalledWith({
      where: { email: payload.username },
    });
  });

  it('should log an error and throw Unauthorized error on exception', async () => {
    const payload: LoginRequest = { username: 'test@example.com', password: 'password' };

    jest.spyOn(userRepository, 'findOneWithActive').mockImplementation(() => {
      throw new Error('Unexpected Error');
    });

    await expect(authService.login(payload)).rejects.toThrow(AuthException.Unauthorized());
    expect(authService['logger'].error).toHaveBeenCalledWith(
      `${AuthService.name}[LOGIN]`,
      expect.objectContaining({
        errors: {
          username: payload.username,
          message: 'Unexpected Error',
        },
      }),
    );
  });

  it('should throw Unauthorized error if bcrypt fails', async () => {
    const payload: LoginRequest = { username: 'test@example.com', password: 'password' };
    const mockUser: UserEntity = { id: 1, password: 'hashedPassword' } as UserEntity;

    jest.spyOn(userRepository, 'findOneWithActive').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
      throw new Error('Bcrypt error');
    });

    await expect(authService.login(payload)).rejects.toThrow(AuthException.Unauthorized());
    expect(authService['logger'].error).toHaveBeenCalledWith(
      `${AuthService.name}[LOGIN]`,
      expect.objectContaining({
        errors: { username: payload.username, message: 'Bcrypt error' },
      }),
    );
  });
});
