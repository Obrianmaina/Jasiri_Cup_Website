import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File, Files } from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadResponse {
  url?: string;
  error?: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        const sanitizedName = part.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'upload';
        return `${Date.now()}-${sanitizedName}`;
      },
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file received' });
    }

    const filename = path.basename(file.filepath);
    const url = `/uploads/${filename}`;
    
    res.status(200).json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}