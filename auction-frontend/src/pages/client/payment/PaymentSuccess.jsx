import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Processing payment...");

    useEffect(() => {
        const payerId = params.get("PayerID");
        const paymentId = params.get("token"); // Đây là orderId từ PayPal

        const executePayment = async () => {
            try {
                const response = await fetch("/api/payment/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ payerId, paymentId }),
                });

                const data = await response.json();

                if (data.status === "COMPLETED") {
                    setStatus("🎉 Payment successful!");
                    setTimeout(() => navigate("/my-auctions"), 3000); // Chuyển hướng sau 3 giây
                } else {
                    setStatus("⚠️ Payment failed: " + data.message);
                }
            } catch (err) {
                console.error("Execution error", err);
                setStatus("❌ Error executing payment");
            }
        };

        if (payerId && paymentId) {
            executePayment();
        } else {
            setStatus("Missing payment information.");
        }
    }, []);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>{status}</h2>
        </div>
    );
};

export default PaymentSuccess;
