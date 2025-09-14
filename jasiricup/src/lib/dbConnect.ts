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
const options = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  serverSelectionTimeoutMS: 5000, // How long to wait for server selection
  socketTimeoutMS: 45000, // How long to wait for socket operations
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true, // Retry writes on network errors
  w: 'majority', // Write concern - wait for majority of replica set
  journal: true, // Wait for journal confirmation
  // Connection pool options
  minPoolSize: 1, // Minimum connections to maintain
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  // Monitoring options
  heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
};

// Global mongoose instance to prevent multiple connections
declare global {
  var mongoose: any;
}

let cached = global.mongoose;

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
  // Return existing connection if available
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (!cached.promise) {
    console.log('Establishing new MongoDB connection...');
    
    // Set up connection event listeners for monitoring
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    // Create new connection promise
    cached.promise = connectWithRetry().then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    console.error('Failed to establish MongoDB connection:', error.message);
    
    // Don't expose internal error details in production
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
      // Ping the database
      await mongoose.connection.db.admin().ping();
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