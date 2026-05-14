// src/lib/dbConnect.ts
import mongoose from 'mongoose';

// Connection configuration
const MONGODB_URI = process.env.DB_CONNECTION_STRING;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

if (!MONGODB_URI) {
  throw new Error('Please define the DB_CONNECTION_STRING environment variable inside .env.local');
}

// Validate MongoDB URI format
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  throw new Error('Invalid MongoDB connection string format');
}

// Connection options for security and performance
const options: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority', 
  journal: true,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000,
};

// 1. FIXED: Create a strict interface for the global cache instead of 'any'
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global mongoose instance to prevent multiple connections
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose as MongooseCache;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connection retry logic
async function connectWithRetry(retries = MAX_RETRIES): Promise<typeof mongoose> {
  try {
    return await mongoose.connect(MONGODB_URI!, options);
  } catch (error) {
    console.error(`MongoDB connection attempt failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);
    
    if (retries > 1) {
      console.log(`Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries - 1);
    }
    throw error;
  }
}

const connectDB = async () => {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Establishing new MongoDB connection...');
    
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    cached.promise = connectWithRetry().then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: unknown) {
    // 2. FIXED: Catch block now safely handles 'unknown' types
    cached.promise = null;
    
    if (error instanceof Error) {
      console.error('Failed to establish MongoDB connection:', error.message);
    } else {
      console.error('Failed to establish MongoDB connection:', String(error));
    }
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database connection failed');
    }
    throw error;
  }
};

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Safely check if db is available before pinging
      await mongoose.connection.db?.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

export default connectDB;