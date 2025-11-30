import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, User } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleProfile } from './interfaces/google-profile.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  private transporter: Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    let emailPass = this.configService.get<string>('EMAIL_PASSWORD');
    if (!emailPass) {
      emailPass = this.configService.get<string>('EMAIL_PASS');
    }

    this.transporter = nodemailer.createTransport(
      this.configService.get<string>('EMAIL_SERVICE')
        ? {
            service: this.configService.get<string>('EMAIL_SERVICE'),
            auth: {
              user: this.configService.get<string>('EMAIL_USER'),
              pass: emailPass,
            },
          }
        : {
            host: this.configService.get<string>('EMAIL_HOST'),
            port: this.configService.get<number>('EMAIL_PORT'),
            secure: false,
            auth: {
              user: this.configService.get<string>('EMAIL_USER'),
              pass: this.configService.get<string>('EMAIL_PASSWORD'),
            },
          },
    );
  }

  /**
   * Xác thực người dùng (Local)
   */
  async validateUser(loginIdentifier: string, pass: string): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByLoginIdentifier(loginIdentifier);

    if (!user) {
      return null;
    }

    if ((user.authProvider as AuthProvider) !== AuthProvider.LOCAL) {
      throw new BadRequestException(
        `Tài khoản này được đăng ký bằng ${user.authProvider}. Vui lòng đăng nhập bằng ${user.authProvider}.`,
      );
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException('Vui lòng xác thực email của bạn trước khi đăng nhập.');
    }

    // user là Document, có sẵn comparePassword
    const isPasswordMatch = await user.comparePassword(pass);

    if (!isPasswordMatch) {
      return null;
    }

    const userObject = user.toObject() as User;
    delete userObject.password;
    return userObject as unknown as AuthenticatedUser;
  }

  /**
   * Tạo JWT Token
   */
  login(user: AuthenticatedUser) {
    const payload = {
      username: user.username,
      sub: user._id.toString(), // Chuyển _id sang string cho payload
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /**
   * Đăng ký
   */
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const existingUserByEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email đã tồn tại');
    }
    const existingUserByUsername = await this.usersService.findByUsername(registerDto.username);
    if (existingUserByUsername) {
      throw new ConflictException('Username đã tồn tại');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await this.usersService.create(registerDto, otp, otpExpires);
    await this._sendVerificationEmail(registerDto.email, otp);

    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
    };
  }

  /**
   * Gửi email (Private)
   */
  private async _sendVerificationEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: `"My Chat App" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Mã xác thực tài khoản Chat App của bạn',
      html: `
        <p>Cảm ơn bạn đã đăng ký.</p>
        <p>Mã OTP của bạn là: <b>${otp}</b></p>
        <p>Mã này sẽ hết hạn sau 10 phút.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Không thể gửi email:', error);
      throw new BadRequestException('Không thể gửi email xác thực. Vui lòng thử lại.');
    }
  }

  /**
   * Gửi lại OTP
   */
  async resendOtp(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email đã được xác thực từ trước.');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationOtp = otp;
    user.verificationOtpExpires = otpExpires;
    await user.save();

    await this._sendVerificationEmail(email, otp);

    return { message: 'Mã OTP mới đã được gửi đến email của bạn.' };
  }

  /**
   * Xác thực OTP
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const { email, otp } = verifyEmailDto;

    const user = await this.usersService.findByEmailForVerification(email);

    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email đã được xác thực từ trước.');
    }

    if (!user.verificationOtp || !user.verificationOtpExpires) {
      throw new BadRequestException('Yêu cầu xác thực không hợp lệ hoặc đã hết hạn.');
    }

    if (user.verificationOtp !== otp) {
      throw new BadRequestException('Mã OTP không đúng.');
    }

    if (new Date() > user.verificationOtpExpires) {
      throw new BadRequestException('Mã OTP đã hết hạn.');
    }

    user.isEmailVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;

    await user.save();

    return { message: 'Xác thực email thành công. Bạn có thể đăng nhập.' };
  }

  /**
   * Google OAuth
   */
  async validateOAuthUser(profile: GoogleProfile): Promise<AuthenticatedUser> {
    let user = await this.usersService.findByGoogleId(profile.googleId);

    if (user) {
      return user.toObject() as unknown as AuthenticatedUser;
    }

    user = await this.usersService.findByEmail(profile.email);

    if (user) {
      if ((user.authProvider as AuthProvider) !== AuthProvider.LOCAL) {
        throw new BadRequestException(`Email này đã được đăng ký bằng ${user.authProvider}.`);
      }

      const userId = (user._id as Types.ObjectId).toString();
      const updatedUser = await this.usersService.linkGoogleAccount(userId, profile);
      return updatedUser.toObject() as unknown as AuthenticatedUser;
    }

    const newUser = await this.usersService.createFromGoogleProfile(profile);
    return newUser.toObject() as unknown as AuthenticatedUser;
  }
}
