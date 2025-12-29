/**
 * Notification Routes
 * API endpoints for managing notifications
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { notificationService } from '../services/notificationService';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/notifications/status
 * Get notification service status
 */
router.get('/status', async (req: Request, res: Response) => {
    try {
        res.json({
            success: true,
            email: {
                enabled: notificationService.isEmailEnabled(),
                provider: 'SMTP'
            },
            sms: {
                enabled: notificationService.isSMSEnabled(),
                provider: 'Twilio'
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/notifications/test-email
 * Send test email
 */
router.post('/test-email', async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { email } = req.body;

        const targetEmail = email || user.email;

        if (!targetEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        const sent = await notificationService.sendEmail({
            to: targetEmail,
            subject: '✅ Test Email from Finance Companion',
            html: `
                <h1>Test Email Successful!</h1>
                <p>Hi ${user.name},</p>
                <p>Your email notifications are working perfectly! 🎉</p>
                <p>You'll receive alerts for:</p>
                <ul>
                    <li>New transactions</li>
                    <li>Budget warnings</li>
                    <li>Goal milestones</li>
                    <li>Weekly reports</li>
                </ul>
                <p>Best regards,<br>Finance Companion Team</p>
            `,
            text: 'Test email successful! Your email notifications are working.'
        });

        if (sent) {
            res.json({
                success: true,
                message: 'Test email sent successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email. Check SMTP configuration.'
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/notifications/test-sms
 * Send test SMS
 */
router.post('/test-sms', async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { phone } = req.body;

        const targetPhone = phone || user.phone;

        if (!targetPhone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const sent = await notificationService.sendSMS({
            to: targetPhone,
            message: `Hi ${user.name}! This is a test SMS from Finance Companion. Your SMS notifications are working! 🎉`
        });

        if (sent) {
            res.json({
                success: true,
                message: 'Test SMS sent successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test SMS. Check Twilio configuration.'
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/notifications/transaction-alert
 * Send transaction alert (for testing)
 */
router.post('/transaction-alert', async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { transaction, sendEmail, sendSMS } = req.body;

        const results = {
            email: false,
            sms: false
        };

        if (sendEmail && user.email) {
            results.email = await notificationService.sendTransactionAlertEmail(
                user.email,
                user.name,
                transaction
            );
        }

        if (sendSMS && user.phone) {
            results.sms = await notificationService.sendTransactionAlertSMS(
                user.phone,
                transaction
            );
        }

        res.json({
            success: true,
            results
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/notifications/budget-alert
 * Send budget alert (for testing)
 */
router.post('/budget-alert', async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { budget, sendEmail, sendSMS } = req.body;

        const results = {
            email: false,
            sms: false
        };

        if (sendEmail && user.email) {
            results.email = await notificationService.sendBudgetAlertEmail(
                user.email,
                user.name,
                budget
            );
        }

        if (sendSMS && user.phone) {
            results.sms = await notificationService.sendBudgetAlertSMS(
                user.phone,
                budget
            );
        }

        res.json({
            success: true,
            results
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
