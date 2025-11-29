import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';

interface SMSSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    authToken: string;
    userId: string;
}

export const SMSSetupModal: React.FC<SMSSetupModalProps> = ({
    isOpen,
    onClose,
    authToken,
    userId,
}) => {
    const [qrData, setQrData] = useState('');

    useEffect(() => {
        if (authToken && userId) {
            const data = JSON.stringify({
                token: authToken,
                userId: userId,
                timestamp: Date.now(),
            });
            setQrData(data);
        }
    }, [authToken, userId]);

    if (!isOpen) return null;

    const apkDownloadUrl = '/downloads/finance-sms-companion.apk'; // Update with actual URL

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card-ultra-glass max-w-2xl w-full p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gradient-green mb-2">
                        Setup SMS Auto-Sync
                    </h2>
                    <p className="text-slate-600">
                        Install our companion app to automatically import transactions from SMS
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Instructions */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">Setup Steps:</h3>

                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Download App</p>
                                    <p className="text-sm text-slate-600">
                                        Download the companion app APK
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Install & Open</p>
                                    <p className="text-sm text-slate-600">
                                        Install the APK and open the app
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Scan QR Code</p>
                                    <p className="text-sm text-slate-600">
                                        Scan the QR code on the right to link your account
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">
                                    4
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Grant Permissions</p>
                                    <p className="text-sm text-slate-600">
                                        Allow SMS access when prompted
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">
                                    ✓
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Done!</p>
                                    <p className="text-sm text-slate-600">
                                        SMS will auto-sync in the background
                                    </p>
                                </div>
                            </div>
                        </div>

                        <a
                            href={apkDownloadUrl}
                            download
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
                        >
                            <Download className="w-5 h-5" />
                            Download Companion App
                        </a>
                    </div>

                    {/* Right: QR Code */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            {qrData ? (
                                <QRCode value={qrData} size={200} />
                            ) : (
                                <div className="w-[200px] h-[200px] bg-slate-100 animate-pulse rounded" />
                            )}
                        </div>
                        <p className="text-sm text-slate-600 mt-4 text-center">
                            Scan this QR code with the companion app
                        </p>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> The companion app runs in the background and only forwards
                        bank transaction SMS. Your privacy is protected - no other messages are accessed.
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-slate-600 hover:text-slate-900"
                    >
                        Skip for Now
                    </button>
                    <button
                        onClick={onClose}
                        className="btn-primary"
                    >
                        I've Set It Up
                    </button>
                </div>
            </div>
        </div>
    );
};
