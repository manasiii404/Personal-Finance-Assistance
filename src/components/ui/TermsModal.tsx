import React from "react";
import { X } from "lucide-react";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card-premium w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gradient">Terms & Conditions</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-4 text-dark-700">
                    <section>
                        <h3 className="text-lg font-bold text-dark-900 mb-2">1. Privacy & Data Protection</h3>
                        <p className="text-sm leading-relaxed">
                            Your privacy is important to us. We collect and store your personal information (name, email, phone number)
                            solely for the purpose of providing you with our financial management services.
                        </p>
                        <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <p className="text-sm font-semibold text-blue-900">
                                📞 Phone Number Privacy: Your phone number will NOT be used for marketing, sold to third parties,
                                or shared with anyone. It is stored securely and used only for account recovery and security purposes.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-dark-900 mb-2">2. Data Security</h3>
                        <p className="text-sm leading-relaxed">
                            We implement industry-standard security measures to protect your data. All passwords are encrypted,
                            and your financial information is stored securely in our database.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-dark-900 mb-2">3. User Responsibilities</h3>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Keep your account credentials secure</li>
                            <li>Provide accurate financial information</li>
                            <li>Use the service in compliance with applicable laws</li>
                            <li>Do not share your account with others</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-dark-900 mb-2">4. Service Usage</h3>
                        <p className="text-sm leading-relaxed">
                            This service is provided for personal financial management. You agree to use it responsibly
                            and not for any illegal or unauthorized purposes.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-dark-900 mb-2">5. Data Retention</h3>
                        <p className="text-sm leading-relaxed">
                            You can delete your account at any time from the Settings page. Upon deletion, all your data
                            will be permanently removed from our systems.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-dark-900 mb-2">6. Updates to Terms</h3>
                        <p className="text-sm leading-relaxed">
                            We may update these terms from time to time. Continued use of the service constitutes
                            acceptance of any changes.
                        </p>
                    </section>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="btn-secondary px-6 py-3"
                    >
                        Close
                    </button>
                    <button
                        onClick={onAccept}
                        className="btn-primary px-6 py-3"
                    >
                        Accept Terms
                    </button>
                </div>
            </div>
        </div>
    );
};
