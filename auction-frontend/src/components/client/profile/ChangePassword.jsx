// src/components/client/profile/ChangePassword.jsx
import React, { useState } from 'react';
import { changePassword, getCurrentUser } from '../../../services/user-api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useToastMessage from '../../../hooks/useToastMessage';
import '../../../assets/styles/client/profile/change-password.css';

const ChangePassword = () => {
	const { showSuccess, showError } = useToastMessage();

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
	const [errors, setErrors] = useState({});

	const validate = () => {
		const newErrors = {};
		if (!form.currentPassword) newErrors.currentPassword = 'Current password is required.';
		if (form.newPassword.length < 6) newErrors.newPassword = 'New password must be at least 6 characters.';
		if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));

		const newErrors = { ...errors };

		if (name === 'newPassword') {
			if (value.length < 6) {
				newErrors.newPassword = 'New password must be at least 6 characters.';
			} else {
				delete newErrors.newPassword;
			}

			if (form.confirmPassword && value !== form.confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match.';
			} else {
				delete newErrors.confirmPassword;
			}
		}

		if (name === 'confirmPassword') {
			if (value !== form.newPassword) {
				newErrors.confirmPassword = 'Passwords do not match.';
			} else {
				delete newErrors.confirmPassword;
			}
		}

		setErrors(newErrors);
	};

	const toggleVisibility = (field) => {
		setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		try {
			setLoading(true);
			const user = await getCurrentUser();
			await changePassword(user.email, form.currentPassword, form.newPassword);
			showSuccess('Password changed successfully!');
			setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
		} catch {
			showError('Failed to change password. Please check your current password.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="change-password-container">
			<h5 className="change-password-title text-primary fw-bold">Change Your Password</h5>

			{['currentPassword', 'newPassword', 'confirmPassword'].map((field) => {
				const labelMap = {
					currentPassword: 'Current Password',
					newPassword: 'New Password',
					confirmPassword: 'Confirm New Password',
				};
				const showKey = field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm';

				return (
					<div className="form-group" key={field}>
						<label className="form-label">{labelMap[field]}</label>
						<div className="password-input-wrapper">
							<input
								type={showPassword[showKey] ? 'text' : 'password'}
								className={`form-control custom-input ${errors[field] ? 'is-invalid' : ''}`}
								name={field}
								value={form[field]}
								onChange={handleChange}
								placeholder={`Enter ${labelMap[field].toLowerCase()}`}
							/>
							<span className="toggle-password-icon" onClick={() => toggleVisibility(showKey)}>
								{showPassword[showKey] ? <FaEyeSlash /> : <FaEye />}
							</span>
						</div>
						{errors[field] && <div className="text-danger mt-1 small">{errors[field]}</div>}
					</div>
				);
			})}

			<button className="btn-submit-password" onClick={handleSubmit} disabled={loading}>
				{loading ? 'Updating...' : 'Update'}
			</button>
		</div>
	);
};

export default ChangePassword;