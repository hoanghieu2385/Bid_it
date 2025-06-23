import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>❌ Payment was cancelled.</h2>
            <p>You can return to the auction detail to try again.</p>
            <button onClick={() => navigate(-1)} style={{ marginTop: "1rem" }}>
                Go Back
            </button>
        </div>
    );
};

export default PaymentCancel;
