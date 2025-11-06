// TypeORM database configuration

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Subscription } from '../entities/Subscription';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cloud_convert',
};

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [User, Subscription],
  synchronize: false, // Don't auto-sync in production
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});

// Initialize database connection
let isInitialized = false;

export async function initializeDatabase(): Promise<DataSource> {
  if (!isInitialized) {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log('✅ Database connected');
  }
  return AppDataSource;
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  if (isInitialized && AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    isInitialized = false;
    console.log('Database connection closed');
  }
}
