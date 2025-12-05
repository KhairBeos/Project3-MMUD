import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthProvider, User } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { GoogleProfile } from '../auth/interfaces/google-profile.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Admin-style create (no OTP) - keep original create(...) for registration flow
  async createUser(createDto: Partial<User>): Promise<User> {
    const newUser = new this.userModel({
      ...createDto,
      authProvider: AuthProvider.LOCAL,
    });
    return newUser.save();
  }

  // Hàm tạo user mới (dùng cho đăng ký)
  async create(registerDto: RegisterDto, otp: string, otpExpires: Date): Promise<User> {
    const newUser = new this.userModel({
      ...registerDto,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
      isEmailVerified: false,
      authProvider: AuthProvider.LOCAL,
      googleId: undefined, // Ensure googleId is not set for local auth
    });
    return newUser.save();
  }

  // Hàm tìm user bằng email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  // Hàm tìm user dùng cho xác thực email (bao gồm các trường OTP bị `select: false`)
  async findByEmailForVerification(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+verificationOtp +verificationOtpExpires')
      .exec();
  }

  // Hàm tìm user dùng cho đặt lại mật khẩu (bao gồm các trường reset password bị `select: false`)
  async findByEmailForPasswordReset(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+resetPasswordToken +resetPasswordTokenExpires')
      .exec();
  }

  // Hàm tìm user bằng username
  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  // Hàm tìm user bằng ID (dùng cho JwtStrategy)
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  // Hàm tìm user cho LocalStrategy (bao gồm cả password)
  async findByLoginIdentifier(identifier: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
      })
      .select('+password') // Yêu cầu trả về cả mật khẩu
      .exec();
  }

  // Return all users (used by controller)
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Helper used by controller naming
  async findOneByEmail(email: string): Promise<User | null> {
    return this.findByEmail(email);
  }

  /**
   * Tìm user bằng Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  /**
   * Liên kết tài khoản local với Google
   */
  async linkGoogleAccount(userId: string, profile: GoogleProfile): Promise<User> {
    const user = await this.findById(userId); // Dùng lại hàm findById
    if (!user) {
      throw new Error('Không tìm thấy user để liên kết');
    }

    user.googleId = profile.googleId;
    user.authProvider = AuthProvider.GOOGLE;
    // Chỉ cập nhật avatar nếu user chưa có avatar
    user.avatarUrl = user.avatarUrl || profile.avatarUrl;
    user.isEmailVerified = true; // Email từ Google đã được xác thực

    return user.save();
  }

  /**
   * Tạo user mới hoàn toàn từ Google Profile
   */
  async createFromGoogleProfile(profile: GoogleProfile): Promise<User> {
    // Tái sử dụng logic tạo username duy nhất
    let username = profile.email.split('@')[0];
    let userByUsername = await this.findByUsername(username); // Dùng hàm có sẵn
    let counter = 1;

    while (userByUsername) {
      username = `${profile.email.split('@')[0]}${counter}`;
      userByUsername = await this.findByUsername(username);
      counter++;
    }

    const newUser = new this.userModel({
      googleId: profile.googleId,
      email: profile.email,
      username: username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      authProvider: AuthProvider.GOOGLE,
      isEmailVerified: true,
      // Không cần password, không cần OTP
    });

    return newUser.save();
  }

  // Generic update/remove operations to match controller
  async update(id: string, dto: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  /**
   * Cập nhật trạng thái người dùng
   */
  async updateUserStatus(userId: string, isOnline: boolean, lastSeen?: Date): Promise<User | null> {
    const updateData: Record<string, unknown> = {
      isOnline: isOnline,
    };

    if (!isOnline && lastSeen) {
      updateData.lastSeen = lastSeen;
    }

    return this.userModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).exec();
  }

  /**
   * Thêm một ID phòng chat vào danh sách 'chats' của user
   */
  async addChatToUser(userId: string, roomId: Types.ObjectId): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, { $push: { chats: roomId } }, { new: true });
  }
}
