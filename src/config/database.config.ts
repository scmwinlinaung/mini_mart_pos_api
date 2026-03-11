import { Sequelize } from 'sequelize';
import env from './env.config';

export const sequelize = new Sequelize({
  host: env.database.host,
  port: env.database.port,
  database: env.database.database,
  username: env.database.username,
  password: env.database.password,
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Sync all models (create tables if they don't exist)
    // In production, you might want to use { alter: true } or no sync at all
    await sequelize.sync({ alter: env.nodeEnv === 'development' });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

export default sequelize;
