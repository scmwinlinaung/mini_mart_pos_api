import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env.config';
import { User, Role } from '../models';
import { TokenPair, JwtPayload } from '../types';
import logger from '../utils/logger.util';

class AuthService {
  private readonly SALT_ROUNDS = 12;

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Compare password
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT tokens
  generateTokens(userId: number, username: string, roleName: string): TokenPair {
    const payload: JwtPayload = {
      userId,
      username,
      role: roleName,
    };

    const accessOptions: SignOptions = { expiresIn: env.jwt.accessExpiry as any };
    const accessToken = jwt.sign(payload, env.jwt.accessSecret, accessOptions);

    const refreshOptions: SignOptions = { expiresIn: env.jwt.refreshExpiry as any };
    const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, refreshOptions);

    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
    } catch (error) {
      logger.error('Access token verification failed:', error);
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Login user
  async login(username: string, password: string): Promise<{ user: any; tokens: TokenPair }> {
    try {
      // Find user with role
      const user = await User.findOne({
        where: { username, isActive: true },
        include: [{ model: Role, as: 'role' }],
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Check if user has a role
      if (!user.role) {
        throw new Error('User has no assigned role');
      }

      // Generate tokens
      const tokens = this.generateTokens(user.userId, user.username, user.role.roleName);

      // Remove sensitive data
      const userResponse = {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role.roleName,
        roleId: user.roleId,
      };

      logger.info(`User logged in: ${username}`);
      return { user: userResponse, tokens };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = this.verifyRefreshToken(refreshToken);

      // Find user to ensure they still exist and are active
      const user = await User.findOne({
        where: { userId: payload.userId, isActive: true },
        include: [{ model: Role, as: 'role' }],
      });

      if (!user || !user.role) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      return this.generateTokens(user.userId, user.username, user.role.roleName);
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: number): Promise<any> {
    try {
      const user = await User.findOne({
        where: { userId, isActive: true },
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role?.roleName,
        roleId: user.roleId,
      };
    } catch (error) {
      logger.error('Get user by ID failed:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findOne({ where: { userId } });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isValidPassword = await this.comparePassword(oldPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid current password');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await user.update({ passwordHash: hashedPassword });

      logger.info(`Password changed for user: ${user.username}`);
    } catch (error) {
      logger.error('Change password failed:', error);
      throw error;
    }
  }
}

export default new AuthService();
