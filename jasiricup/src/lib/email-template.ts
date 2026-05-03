// src/lib/email-template.ts

export function generateBrandedEmail(title: string, contentHtml: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background-color: #7856BF; padding: 30px 20px; text-align: center;">
        <img src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png" alt="JasiriCup" style="height: 45px; margin-bottom: 15px;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">${title}</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: 30px 20px; color: #374151; line-height: 1.6; font-size: 16px;">
        ${contentHtml}
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          &copy; ${new Date().getFullYear()} JasiriCup. All rights reserved.<br><br>
          Empowering girls, one cup at a time.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}