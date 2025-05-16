// src/pages/common/ForgotPassword.jsx
import React, { useState } from 'react';
import { forgotPassword } from '../../services/user-api';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');
		setSuccess(false);

		try {
			const res = await forgotPassword(email);
			setMessage(res.message || 'Password reset link sent to your email.');
			setSuccess(true);
		} catch (err) {
			setMessage(err.response?.data?.message || 'Failed to send reset link.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="forgot-password-section vh-100">
			<div className="container h-100 d-flex justify-content-center align-items-center">
				<div className="card p-4 shadow-sm w-100" style={{ maxWidth: '400px' }}>
					<h4 className="mb-3 text-center">Forgot Password</h4>
					<form onSubmit={handleSubmit}>
						<div className="form-floating mb-3">
							<input
								type="email"
								className="form-control"
								id="forgotEmail"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							<label htmlFor="forgotEmail">Email address</label>
						</div>
						<button type="submit" className="btn btn-primary w-100" disabled={loading}>
							{loading ? (
								<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
							) : (
								'Send Reset Link'
							)}
						</button>
						{message && (
							<div className={`alert mt-3 ${success ? 'alert-success' : 'alert-danger'}`} role="alert">
								{message}
							</div>
						)}
						<div className="text-center mt-3">
							<button type="button" className="btn btn-link p-0" onClick={() => navigate('/login')}>
								Back to Login
							</button>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
}

export default ForgotPassword;
