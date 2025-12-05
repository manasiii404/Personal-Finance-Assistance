import twilio from 'twilio';
import config from '../config';

class TwilioNotificationService {
    private client: twilio.Twilio | null = null;

    constructor() {
        // Only initialize if Twilio credentials are provided
        if (config.twilio?.accountSid && config.twilio?.authToken && config.twilio?.phoneNumber) {
            this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
        } else {
            console.warn('Twilio credentials not configured. SMS notifications disabled.');
        }
    }

    /**
     * Send SMS to a phone number
     */
    async sendSMS(to: string, message: string): Promise<boolean> {
        if (!this.client) {
            console.warn('SMS notification service not initialized. Skipping SMS send.');
            return false;
        }

        if (!to) {
            console.warn('No phone number provided. Skipping SMS send.');
            return false;
        }

        try {
            // Format phone number to E.164 format
            const formattedPhone = this.formatPhoneNumber(to);

            const result = await this.client.messages.create({
                body: message,
                from: config.twilio.phoneNumber,
                to: formattedPhone,
            });

            console.log(`SMS sent successfully. SID: ${result.sid}`);
            return true;
        } catch (error: any) {
            console.error('Failed to send SMS:', error.message);
            return false;
        }
    }

    /**
     * Format phone number to E.164 format
     * Assumes Indian phone numbers if no country code provided
     */
    private formatPhoneNumber(phone: string): string {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // If it's a 10-digit number, assume it's Indian and add +91
        if (cleaned.length === 10) {
            return `+91${cleaned}`;
        }

        // If it already has country code, add + if missing
        if (!phone.startsWith('+')) {
            return `+${cleaned}`;
        }

        return phone;
    }

    /**
     * Send budget alert SMS (80% threshold)
     */
    async sendBudgetAlert(to: string, category: string, spent: number, limit: number, percentage: number): Promise<boolean> {
        const message = `Budget Alert: Your ${category} budget is ${percentage.toFixed(0)}% used (₹${spent.toFixed(2)} of ₹${limit.toFixed(2)}). Consider reviewing your spending.`;
        return this.sendSMS(to, message);
    }

    /**
     * Send budget exceeded SMS
     */
    async sendBudgetExceededAlert(to: string, category: string, spent: number, limit: number): Promise<boolean> {
        const overspent = spent - limit;
        const message = `Budget Exceeded: Your ${category} budget has been exceeded by ₹${overspent.toFixed(2)}! Total spent: ₹${spent.toFixed(2)} (Limit: ₹${limit.toFixed(2)})`;
        return this.sendSMS(to, message);
    }

    /**
     * Send goal milestone SMS (50%, 75%)
     */
    async sendGoalMilestone(to: string, goalTitle: string, current: number, target: number, percentage: number): Promise<boolean> {
        const message = `Goal Milestone: "${goalTitle}" is ${percentage.toFixed(0)}% complete! ₹${current.toFixed(2)} of ₹${target.toFixed(2)}. Keep going!`;
        return this.sendSMS(to, message);
    }

    /**
     * Send goal completed SMS (100%)
     */
    async sendGoalCompleted(to: string, goalTitle: string, amount: number): Promise<boolean> {
        const message = `Goal Achieved! 🎉 Congratulations! You've completed your goal "${goalTitle}" with ₹${amount.toFixed(2)}. Great job!`;
        return this.sendSMS(to, message);
    }
}

export default new TwilioNotificationService();
