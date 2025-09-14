// src/lib/env-validation.ts
interface RequiredEnvVars {
  DB_CONNECTION_STRING: string;
  ADMIN_SECRET_TOKEN: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  EMAIL_SERVER_HOST: string;
  EMAIL_SERVER_PORT: string;
  EMAIL_SERVER_USER: string;
  EMAIL_SERVER_PASSWORD: string;
  EMAIL_TO: string;
  NEXT_PUBLIC_BASE_URL: string;
}

export function validateEnvironmentVariables(): void {
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'DB_CONNECTION_STRING',
    'ADMIN_SECRET_TOKEN',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT',
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_TO',
    'NEXT_PUBLIC_BASE_URL'
  ];

  const missingVars: string[] = [];
  const weakVars: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (!value) {
      missingVars.push(varName);
    } else {
      // Check for weak values
      if (varName === 'ADMIN_SECRET_TOKEN') {
        if (value.length < 32) {
          weakVars.push(`${varName} should be at least 32 characters long`);
        }
        if (!/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]+$/.test(value)) {
          weakVars.push(`${varName} should contain a mix of letters, numbers, and special characters`);
        }
      }
      
      if (varName === 'DB_CONNECTION_STRING' && !value.startsWith('mongodb')) {
        weakVars.push(`${varName} should be a valid MongoDB connection string`);
      }
      
      if (varName === 'EMAIL_SERVER_PORT' && isNaN(parseInt(value))) {
        weakVars.push(`${varName} should be a valid port number`);
      }
      
      if (varName === 'NEXT_PUBLIC_BASE_URL' && !value.startsWith('http')) {
        weakVars.push(`${varName} should be a valid URL starting with http:// or https://`);
      }
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (weakVars.length > 0) {
    console.warn('⚠️  Weak environment variable configurations:');
    weakVars.forEach(warning => console.warn(`  - ${warning}`));
  }

  // Check for production-specific requirements
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https://')) {
      console.warn('⚠️  NEXT_PUBLIC_BASE_URL should use HTTPS in production');
    }
    
    if (process.env.EMAIL_SERVER_SECURE !== 'true') {
      console.warn('⚠️  EMAIL_SERVER_SECURE should be true in production');
    }
  }

  console.log('✅ All required environment variables are present');
}

// Call this at application startup
export function initializeEnvironment(): void {
  try {
    validateEnvironmentVariables();
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}