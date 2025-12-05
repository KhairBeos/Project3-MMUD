import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Enum để theo dõi phương thức xác thực
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User extends Document {
  // --- Thông tin Xác thực & Cơ bản ---

  @Prop({
    required: [true, 'Email là bắt buộc'],
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Email không hợp lệ'],
    trim: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    required: [true, 'Username là bắt buộc'],
    unique: true,
    trim: true,
  })
  username!: string;

  @Prop({
    required: false,
    select: false,
  })
  password?: string;

  @Prop({ trim: true })
  displayName!: string;

  @Prop({ default: null })
  avatarUrl?: string;

  @Prop({ maxlength: 150 })
  bio?: string;

  // --- Trường Quản lý Xác thực (Provider & Google ID) ---

  @Prop({
    type: String,
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider!: string;

  @Prop({
    type: String,
    unique: true,
    sparse: true,
    select: false,
    default: null,
  })
  googleId?: string;

  // --- Trường Xác thực Email (cho đăng ký 'local' bằng OTP) ---

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop({
    type: String,
    select: false,
    default: null,
  })
  verificationOtp?: string;

  @Prop({
    type: Date,
    select: false,
    default: null,
  })
  verificationOtpExpires?: Date;

  @Prop({
    type: String,
    select: false,
    default: null,
  })
  resetPasswordToken?: string;

  @Prop({
    type: Date,
    select: false,
    default: null,
  })
  resetPasswordTokenExpires?: Date;

  // --- Trạng thái (Presence) ---

  @Prop({ default: false })
  isOnline!: boolean;

  @Prop({ default: () => new Date() })
  lastSeen!: Date;

  // --- Quản lý Mối quan hệ (Bạn bè) ---

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  contacts!: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  pendingRequests!: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  sentRequests!: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  blockedUsers!: MongooseSchema.Types.ObjectId[];

  // --- Liên kết Trò chuyện ---

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Room' }],
    default: [],
  })
  chats!: MongooseSchema.Types.ObjectId[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  comparePassword(_candidatePassword: string): Promise<boolean> {
    return Promise.resolve(false);
  }
}

// Tạo Schema từ Class
export const UserSchema = SchemaFactory.createForClass(User);

// --- Virtuals (Trường ảo) ---
UserSchema.virtual('name').get(function () {
  return this.displayName || this.username;
});

// --- Middleware (Hooks) ---
UserSchema.pre<User>('save', async function (next) {
  // Chỉ hash mật khẩu nếu nó được thay đổi VÀ authProvider là 'local'
  if (
    !this.isModified('password') ||
    !this.password ||
    (this.authProvider as AuthProvider) !== AuthProvider.LOCAL
  ) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

// Phương thức để so sánh mật khẩu
UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  const user = this as User;

  if ((user.authProvider as AuthProvider) !== AuthProvider.LOCAL || !user.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidatePassword, user.password);
};
