import * as bcrypt from 'bcrypt';

export class HashUtil {
  private static readonly saltRounds = 10;

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Password comparison failed');
    }
  }

  /**
   * Generate a hash from string
   */
  static async hash(data: string, rounds?: number): Promise<string> {
    try {
      const saltRounds = rounds || this.saltRounds;
      const salt = await bcrypt.genSalt(saltRounds);
      return await bcrypt.hash(data, salt);
    } catch (error) {
      throw new Error('Hashing failed');
    }
  }

  /**
   * Compare data with hash
   */
  static async compare(data: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(data, hash);
    } catch (error) {
      throw new Error('Comparison failed');
    }
  }
}
