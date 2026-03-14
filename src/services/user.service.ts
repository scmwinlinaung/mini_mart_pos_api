import { Op } from 'sequelize';
import { User, Role } from '../models';
import { PaginatedResult } from '../types';
import authService from '../services/auth.service';
import env from '../config/env.config';
import logger from '../utils/logger.util';

interface UserCreateInput {
  username: string;
  password: string;
  fullName: string;
  roleId: number;
  isActive?: boolean;
}

interface UserUpdateInput {
  username?: string;
  password?: string;
  fullName?: string;
  roleId?: number;
  isActive?: boolean;
}

class UserService {
  async getAllUsers(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    search?: string,
    isActive?: boolean,
    roleId?: number,
  ): Promise<PaginatedResult<User>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { fullName: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (roleId) {
        where.roleId = roleId;
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['passwordHash'] },
        order: [['createdAt', 'DESC']],
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('Get all users service error:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const user = await User.findOne({
        where: { userId: id },
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user by ID service error:', error);
      throw error;
    }
  }

  async createUser(data: UserCreateInput): Promise<User> {
    try {
      // Check if username already exists
      const existingUser = await User.findOne({
        where: { username: data.username },
      });

      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash password
      // const hashedPassword = await authService.hashPassword(data.password);

      const user = await User.create({
        username: data.username,
        passwordHash: data.password,
        fullName: data.fullName,
        roleId: data.roleId,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      logger.info(`User created: ${user.userId}`);
      return await this.getUserById(user.userId);
    } catch (error) {
      logger.error('Create user service error:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: UserUpdateInput): Promise<User> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new Error('User not found');
      }

      const updateData: any = {};

      if (data.username) {
        // Check if username is taken by another user
        const existingUser = await User.findOne({
          where: {
            username: data.username,
            userId: { [Op.ne]: id },
          },
        });

        if (existingUser) {
          throw new Error('Username already exists');
        }

        updateData.username = data.username;
      }

      if (data.fullName) updateData.fullName = data.fullName;
      if (data.roleId) updateData.roleId = data.roleId;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      if (data.password) {
        updateData.passwordHash = data.password;
      }

      await user.update(updateData);

      logger.info(`User updated: ${id}`);
      return await this.getUserById(id);
    } catch (error) {
      logger.error('Update user service error:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new Error('User not found');
      }

      await user.update({ isActive: false });

      logger.info(`User deleted: ${id}`);
    } catch (error) {
      logger.error('Delete user service error:', error);
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const roles = await Role.findAll({
        where: { isActive: true },
        order: [['roleId', 'ASC']],
      });

      return roles;
    } catch (error) {
      logger.error('Get roles service error:', error);
      throw error;
    }
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await authService.changePassword(userId, oldPassword, newPassword);
    } catch (error) {
      logger.error('Change password service error:', error);
      throw error;
    }
  }
}

export default new UserService();
