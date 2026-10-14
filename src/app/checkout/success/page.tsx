'use client';
import Link from 'next/link';

export default function SuccessPage() {
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Received!</h1>
                <p className="text-gray-600 mb-6 font-medium">
                    Thank you for your order. We are verifying your UTR number.
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
                    <p className="text-sm text-blue-800 font-semibold mb-1">What happens next?</p>
                    <ul className="text-xs text-blue-700 space-y-2 mt-2">
                        <li>1. Our accounts team will verify the UPI transaction.</li>
                        <li>2. You will receive an automated WhatsApp confirmation with your invoice.</li>
                        <li>3. Our dispatch team will process your material for shipment.</li>
                    </ul>
                </div>

                <Link
                    href="/"
                    className="block w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                    Return to Store
                </Link>
            </div>
        </main>
    );
}