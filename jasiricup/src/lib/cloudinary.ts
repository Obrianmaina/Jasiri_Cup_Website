// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = reader.result as string;
      
      cloudinary.uploader.upload(
        base64,
        {
          folder: 'jasiricup/blog',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url || '');
          }
        }
      );
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export default cloudinary;