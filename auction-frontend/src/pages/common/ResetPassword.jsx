// src/pages/common/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { resetPassword } from '../../services/user-api';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ResetPassword() {
	const [searchParams] = useSearchParams();
	const [email, setEmail] = useState('');
	const [token, setToken] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState('');
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({});

	const navigate = useNavigate();

	useEffect(() => {
		const tokenParam = searchParams.get('token');
		const emailParam = searchParams.get('email');
		if (tokenParam && emailParam) {
			setToken(tokenParam);
			setEmail(emailParam);
		} else {
			setMessage('Invalid reset link');
		}
	}, []);

	const validateField = (name, value) => {
		let error = '';
		if (name === 'newPassword') {
			if (value.length < 6) error = 'Password must be at least 6 characters';
		}
		if (name === 'confirmPassword') {
			if (value !== newPassword) error = 'Passwords do not match';
		}
		setErrors((prev) => ({ ...prev, [name]: error }));
	};

	const handleNewPasswordChange = (e) => {
		const value = e.target.value;
		setNewPassword(value);
		validateField('newPassword', value);
		if (confirmPassword) validateField('confirmPassword', confirmPassword);
	};

	const handleConfirmPasswordChange = (e) => {
		const value = e.target.value;
		setConfirmPassword(value);
		validateField('confirmPassword', value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage('');
		setSuccess(false);

		if (Object.values(errors).some((err) => err)) return;

		try {
			setLoading(true);
			const res = await resetPassword(token, email, newPassword);
			setMessage(res.message || 'Password reset successful!');
			setSuccess(true);
			setTimeout(() => navigate('/login'), 3000);
		} catch (err) {
			setMessage(err.response?.data?.message || 'Reset failed.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="reset-password-section vh-100">
			<div className="container h-100 d-flex justify-content-center align-items-center">
				<div className="card p-4 shadow-sm w-100" style={{ maxWidth: '400px' }}>
					<h4 className="mb-3 text-center">Reset Your Password</h4>
					<form onSubmit={handleSubmit}>
						{/* New Password */}
						<div className="form-floating mb-3 position-relative">
							<input
								type={showNewPassword ? 'text' : 'password'}
								id="newPassword"
								className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
								placeholder="New Password"
								value={newPassword}
								onChange={handleNewPasswordChange}
								required
							/>
							<label htmlFor="newPassword">New Password</label>
							<span className="password-toggle-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
								<i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
							</span>
							{errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
						</div>

						{/* Confirm Password */}
						<div className="form-floating mb-3 position-relative">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								id="confirmPassword"
								className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
								placeholder="Confirm Password"
								value={confirmPassword}
								onChange={handleConfirmPasswordChange}
								required
							/>
							<label htmlFor="confirmPassword">Confirm Password</label>
							<span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
								<i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
							</span>
							{errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
						</div>

						<button type="submit" className="btn btn-primary w-100" disabled={loading}>
							{loading ? (
								<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
							) : (
								'Reset Password'
							)}
						</button>

						{message && (
							<div className={`alert mt-3 ${success ? 'alert-success' : 'alert-danger'}`} role="alert">
								{message}
							</div>
						)}
					</form>
				</div>
			</div>
		</section>
	);
}

export default ResetPassword;
