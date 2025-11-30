import { User } from '../../users/schemas/user.schema';
import { Types } from 'mongoose';

// Đây là kiểu POJO của user (từ .toObject())
export type AuthenticatedUser = Omit<User, 'password'> & { _id: Types.ObjectId; id: string };
