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
  <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto;">
      
      <h1 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">${title}</h1>
      
      <div style="color: #374151; line-height: 1.6; font-size: 16px;">
        ${contentHtml}
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: left;">
        <div style="margin-bottom: 10px;">
          <img src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png" alt="JasiriCup" style="height: 25px; opacity: 0.7;" />
        </div>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          &copy; ${new Date().getFullYear()} JasiriCup. Empowering girls, one cup at a time.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}