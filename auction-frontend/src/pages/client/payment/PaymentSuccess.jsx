import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { executePayPalPayment } from '../../../services/payment-api';
import '../../../assets/styles/client/PaymentResult.css';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [executing, setExecuting] = useState(false);
    const [executed, setExecuted] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const paymentId = searchParams.get('token');
    const payerId = searchParams.get('PayerID');

    const handleConfirmPayment = async () => {
        if (!paymentId || !payerId) return;
        setExecuting(true);
        setError(null);
        try {
            await executePayPalPayment({ paymentId, payerId });
            setExecuted(true);
        } catch (err) {
            setError('Failed to confirm payment. Please try again.');
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                <h1>🎉 Payment Successful!</h1>
                <p>Your PayPal payment was successful. Please confirm below to finalize.</p>

                {executed ? (
                    <>
                        <p className="status-message success">✅ Payment confirmed!</p>
                        <button onClick={() => navigate('/profile?tab=my-auctions')}>Back to My Auctions</button>
                    </>
                ) : (
                    <>
                        {error && <p className="status-message error">{error}</p>}
                        <button onClick={handleConfirmPayment} disabled={executing}>
                            {executing ? 'Confirming...' : 'Confirm Payment'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
