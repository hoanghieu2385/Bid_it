
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../assets/styles/client/PaymentResult.css';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                <h1>❌ Payment Cancelled</h1>
                <p>You have cancelled the payment or closed the PayPal window.</p>
                <button onClick={() => navigate('/profile?tab=my-auctions')}>Back to My Auctions</button>
            </div>
        </div>
    );
};

export default PaymentCancel;