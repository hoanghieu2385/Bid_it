// src/components/client/profile/ChangePassword.jsx
import React, { useState } from 'react';
import { changePassword, getCurrentUser } from '../../../services/user-api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../../assets/styles/client/profile/change-password.css';

const ChangePassword = () => {
	const [form, setForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const toggleVisibility = (field) => {
		setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const handleSubmit = async () => {
		const { currentPassword, newPassword, confirmPassword } = form;
		if (!currentPassword || !newPassword || !confirmPassword) {
			alert('Please fill in all fields.');
			return;
		}
		if (newPassword !== confirmPassword) {
			alert('Passwords do not match');
			return;
		}
		try {
			setLoading(true);
			const user = await getCurrentUser();
			await changePassword(user.email, currentPassword, newPassword);
			alert('Password changed successfully');
			setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
		} catch {
			alert('Failed to change password');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="change-password-container">
			<h5 className="change-password-title">Change Your Password</h5>

			{['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
				<div className="form-group" key={field}>
					<label className="form-label">
						{field === 'currentPassword' && 'Current Password'}
						{field === 'newPassword' && 'New Password'}
						{field === 'confirmPassword' && 'Confirm New Password'}
					</label>
					<div className="password-input-wrapper">
						<input
							type={
								showPassword[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm']
									? 'text'
									: 'password'
							}
							className="form-control custom-input"
							name={field}
							value={form[field]}
							onChange={handleChange}
							placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
						/>
						<span
							className="toggle-password-icon"
							onClick={() =>
								toggleVisibility(field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm')
							}
						>
							{showPassword[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] ? (
								<FaEyeSlash />
							) : (
								<FaEye />
							)}
						</span>
					</div>
				</div>
			))}

			<button className="btn-submit-password" onClick={handleSubmit} disabled={loading}>
				{loading ? 'Updating...' : 'Update Password'}
			</button>
		</div>
	);
};

export default ChangePassword;
