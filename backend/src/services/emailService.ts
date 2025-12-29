import nodemailer from 'nodemailer';
import { config } from '@/config/env';
import logger from '@/utils/logger';

/**
 * Email Service for sending emails via SMTP
 */
export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
    });

    /**
     * Send password reset email with OTP
     */
    static async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
        try {
            const mailOptions = {
                from: `"DHAN-NIYANTRAK" <${config.smtp.user}>`,
                to: email,
                subject: 'Password Reset - DHAN-NIYANTRAK',
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
                border-radius: 10px;
                color: white;
              }
              .logo {
                font-size: 48px;
                text-align: center;
                margin-bottom: 20px;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 30px;
              }
              .otp-box {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              }
              .message {
                font-size: 16px;
                line-height: 1.8;
                margin: 20px 0;
              }
              .warning {
                background: rgba(255, 255, 255, 0.1);
                border-left: 4px solid #fbbf24;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                margin-top: 30px;
                opacity: 0.9;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">💰</div>
              <div class="title">DHAN-NIYANTRAK</div>
              
              <div class="message">
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the following One-Time Password (OTP) to reset your password:</p>
              </div>

              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP is valid for 10 minutes only</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>

              <div class="message">
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              </div>

              <div class="footer">
                <p>© ${new Date().getFullYear()} DHAN-NIYANTRAK</p>
                <p>Privacy-first Personal Finance Management</p>
              </div>
            </div>
          </body>
          </html>
        `,
                text: `
DHAN-NIYANTRAK - Password Reset

Hello,

We received a request to reset your password. Use the following One-Time Password (OTP) to reset your password:

OTP: ${otp}

IMPORTANT:
- This OTP is valid for 10 minutes only
- Do not share this code with anyone
- If you didn't request this, please ignore this email

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} DHAN-NIYANTRAK
Privacy-first Personal Finance Management
        `,
            };

            await this.transporter.sendMail(mailOptions);
            logger.info('Password reset email sent successfully', { email });
        } catch (error) {
            logger.error('Failed to send password reset email', { email, error });
            throw new Error('Failed to send password reset email');
        }
    }

    /**
     * Verify SMTP connection
     */
    static async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            logger.info('SMTP connection verified successfully');
            return true;
        } catch (error) {
            logger.error('SMTP connection verification failed', { error });
            return false;
        }
    }
}
