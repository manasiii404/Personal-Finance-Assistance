/**
 * Notification Service
 * Handles Email (SMTP) and SMS (Twilio) notifications
 */

import nodemailer from 'nodemailer';
import twilio from 'twilio';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

interface SMSOptions {
    to: string;
    message: string;
}

class NotificationService {
    private emailTransporter: nodemailer.Transporter | null = null;
    private twilioClient: twilio.Twilio | null = null;
    private emailEnabled: boolean = false;
    private smsEnabled: boolean = false;

    constructor() {
        this.initializeEmail();
        this.initializeTwilio();
    }

    /**
     * Initialize Email (SMTP)
     */
    private initializeEmail() {
        try {
            const smtpHost = process.env.SMTP_HOST;
            const smtpPort = process.env.SMTP_PORT;
            const smtpUser = process.env.SMTP_USER;
            const smtpPass = process.env.SMTP_PASS;
            const smtpFrom = process.env.SMTP_FROM || smtpUser;

            if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
                console.log('⚠️ SMTP credentials not configured. Email notifications disabled.');
                return;
            }

            this.emailTransporter = nodemailer.createTransport({
                host: smtpHost,
                port: parseInt(smtpPort),
                secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            this.emailEnabled = true;
            console.log('✅ Email service initialized successfully');
            console.log(`   SMTP Host: ${smtpHost}`);
            console.log(`   SMTP Port: ${smtpPort}`);
            console.log(`   From: ${smtpFrom}`);
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error);
        }
    }

    /**
     * Initialize Twilio SMS
     */
    private initializeTwilio() {
        try {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const fromNumber = process.env.TWILIO_PHONE_NUMBER;

            if (!accountSid || !authToken || !fromNumber) {
                console.log('⚠️ Twilio credentials not configured. SMS notifications disabled.');
                return;
            }

            this.twilioClient = twilio(accountSid, authToken);
            this.smsEnabled = true;
            console.log('✅ Twilio SMS service initialized successfully');
            console.log(`   From Number: ${fromNumber}`);
        } catch (error) {
            console.error('❌ Failed to initialize Twilio service:', error);
        }
    }

    /**
     * Send Email
     */
    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.emailEnabled || !this.emailTransporter) {
            console.log('⚠️ Email service not available');
            return false;
        }

        try {
            const info = await this.emailTransporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: options.to,
                subject: options.subject,
                text: options.text || '',
                html: options.html,
            });

            console.log(`✅ Email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            return false;
        }
    }

    /**
     * Send SMS
     */
    async sendSMS(options: SMSOptions): Promise<boolean> {
        if (!this.smsEnabled || !this.twilioClient) {
            console.log('⚠️ SMS service not available');
            return false;
        }

        try {
            const message = await this.twilioClient.messages.create({
                body: options.message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: options.to,
            });

            console.log(`✅ SMS sent: ${message.sid}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send SMS:', error);
            return false;
        }
    }

    /**
     * Send Transaction Alert (Email)
     */
    async sendTransactionAlertEmail(
        email: string,
        userName: string,
        transaction: {
            type: string;
            amount: number;
            category: string;
            description: string;
            date: string;
        }
    ): Promise<boolean> {
        const subject = `💰 New ${transaction.type} Transaction - ₹${transaction.amount.toLocaleString('en-IN')}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .transaction { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .amount { font-size: 32px; font-weight: bold; color: ${transaction.type === 'expense' ? '#ef4444' : '#22c55e'}; }
                    .detail { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px; }
                    .label { font-weight: bold; color: #666; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💰 Transaction Alert</h1>
                        <p>Hi ${userName}!</p>
                    </div>
                    <div class="content">
                        <div class="transaction">
                            <div class="amount">${transaction.type === 'expense' ? '-' : '+'} ₹${transaction.amount.toLocaleString('en-IN')}</div>
                            <div class="detail">
                                <span class="label">Type:</span> ${transaction.type.toUpperCase()}
                            </div>
                            <div class="detail">
                                <span class="label">Category:</span> ${transaction.category}
                            </div>
                            <div class="detail">
                                <span class="label">Description:</span> ${transaction.description}
                            </div>
                            <div class="detail">
                                <span class="label">Date:</span> ${new Date(transaction.date).toLocaleString('en-IN')}
                            </div>
                        </div>
                        <p style="text-align: center; margin-top: 20px;">
                            <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View in App</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>Finance Companion - Your Personal Finance Assistant</p>
                        <p>You're receiving this because you enabled transaction alerts.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
New ${transaction.type.toUpperCase()} Transaction

Amount: ${transaction.type === 'expense' ? '-' : '+'}₹${transaction.amount.toLocaleString('en-IN')}
Category: ${transaction.category}
Description: ${transaction.description}
Date: ${new Date(transaction.date).toLocaleString('en-IN')}

View your transactions in the Finance Companion app.
        `;

        return this.sendEmail({ to: email, subject, html, text });
    }

    /**
     * Send Transaction Alert (SMS)
     */
    async sendTransactionAlertSMS(
        phone: string,
        transaction: {
            type: string;
            amount: number;
            category: string;
        }
    ): Promise<boolean> {
        const message = `Finance Companion: ${transaction.type === 'expense' ? '-' : '+'}₹${transaction.amount.toLocaleString('en-IN')} ${transaction.type} in ${transaction.category}`;

        return this.sendSMS({ to: phone, message });
    }

    /**
     * Send Budget Alert (Email)
     */
    async sendBudgetAlertEmail(
        email: string,
        userName: string,
        budget: {
            category: string;
            limit: number;
            spent: number;
            percentage: number;
        }
    ): Promise<boolean> {
        const subject = `⚠️ Budget Alert: ${budget.category} at ${budget.percentage}%`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .alert { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #f59e0b; }
                    .progress-bar { background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden; margin: 15px 0; }
                    .progress-fill { background: linear-gradient(90deg, #f59e0b 0%, #dc2626 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Budget Alert</h1>
                        <p>Hi ${userName}!</p>
                    </div>
                    <div class="content">
                        <div class="alert">
                            <h2>${budget.category}</h2>
                            <p>You've spent <strong>₹${budget.spent.toLocaleString('en-IN')}</strong> of your <strong>₹${budget.limit.toLocaleString('en-IN')}</strong> budget.</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${budget.percentage}%">
                                    ${budget.percentage}%
                                </div>
                            </div>
                            <p style="color: #dc2626; font-weight: bold;">You're approaching your budget limit!</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * Send Budget Alert (SMS)
     */
    async sendBudgetAlertSMS(
        phone: string,
        budget: {
            category: string;
            percentage: number;
        }
    ): Promise<boolean> {
        const message = `Finance Companion: Budget Alert! ${budget.category} is at ${budget.percentage}% of limit.`;

        return this.sendSMS({ to: phone, message });
    }

    /**
     * Send Weekly Report (Email)
     */
    async sendWeeklyReportEmail(
        email: string,
        userName: string,
        report: {
            totalIncome: number;
            totalExpense: number;
            topCategories: Array<{ category: string; amount: number }>;
        }
    ): Promise<boolean> {
        const subject = `📊 Your Weekly Financial Report`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .summary { display: flex; justify-content: space-around; margin: 20px 0; }
                    .stat { background: white; padding: 20px; border-radius: 8px; text-align: center; flex: 1; margin: 0 10px; }
                    .stat-value { font-size: 28px; font-weight: bold; }
                    .income { color: #22c55e; }
                    .expense { color: #ef4444; }
                    .category-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; display: flex; justify-content: space-between; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Weekly Report</h1>
                        <p>Hi ${userName}!</p>
                    </div>
                    <div class="content">
                        <div class="summary">
                            <div class="stat">
                                <div class="stat-value income">+₹${report.totalIncome.toLocaleString('en-IN')}</div>
                                <div>Income</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value expense">-₹${report.totalExpense.toLocaleString('en-IN')}</div>
                                <div>Expenses</div>
                            </div>
                        </div>
                        <h3>Top Spending Categories:</h3>
                        ${report.topCategories.map(cat => `
                            <div class="category-item">
                                <span>${cat.category}</span>
                                <strong>₹${cat.amount.toLocaleString('en-IN')}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({ to: email, subject, html });
    }

    /**
     * Check if services are enabled
     */
    isEmailEnabled(): boolean {
        return this.emailEnabled;
    }

    isSMSEnabled(): boolean {
        return this.smsEnabled;
    }
}

export const notificationService = new NotificationService();
