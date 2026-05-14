import crypto from 'crypto';

export function generateUnsubscribeToken(email: string): string {
  const secret = process.env.ADMIN_SECRET_TOKEN;
  
  if (!secret) {
    throw new Error('ADMIN_SECRET_TOKEN is not defined in environment variables');
  }

  // Generate a SHA-256 HMAC hash of the email using your secret key
  return crypto.createHmac('sha256', secret).update(email.toLowerCase()).digest('hex');
}