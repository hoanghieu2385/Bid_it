// src/components/client/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import {
	getCurrentUser,
	updateUserProfile,
	changePassword,
} from '../../services/user-api';

const UserProfile = () => {
	const [user, setUser] = useState(null);
	const [editMode, setEditMode] = useState(false);

	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		phoneNumber: '',
		address: '',
	});

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const userData = await getCurrentUser();
				setUser(userData);
				setForm({
					firstName: userData.firstName || '',
					lastName: userData.lastName || '',
					phoneNumber: userData.phoneNumber || '',
					address: userData.address || '',
				});
			} catch (error) {
				console.error('Failed to load profile:', error);
			}
		};

		fetchProfile();
	}, []);

	const handleProfileChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handlePasswordChange = (e) => {
		setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
	};

	const handleProfileSave = async () => {
		try {
			await updateUserProfile(user.id, form);
			alert('Profile updated successfully');
			setEditMode(false);
		} catch (error) {
			console.error('Update failed:', error);
			alert('Failed to update profile');
		}
	};

	const handlePasswordSave = async () => {
		const { currentPassword, newPassword, confirmPassword } = passwordForm;

		if (newPassword !== confirmPassword) {
			alert('New passwords do not match');
			return;
		}

		try {
			await changePassword(user.email, currentPassword, newPassword);
			alert('Password updated successfully');
			setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
		} catch (error) {
			console.error('Password change failed:', error);
			alert('Failed to update password');
		}
	};

	if (!user) return <div>Loading...</div>;

	return (
		<div className="container py-4">
			<h2>My Profile</h2>

			{/* Personal Info Section */}
			<div className="card p-3 mb-4">
				<h5>Personal Information</h5>
				<div className="row">
					<div className="col-md-6">
						<label>First Name</label>
						<input
							type="text"
							className="form-control"
							name="firstName"
							value={form.firstName}
							onChange={handleProfileChange}
							disabled={!editMode}
						/>
					</div>
					<div className="col-md-6">
						<label>Last Name</label>
						<input
							type="text"
							className="form-control"
							name="lastName"
							value={form.lastName}
							onChange={handleProfileChange}
							disabled={!editMode}
						/>
					</div>
					<div className="col-md-6 mt-3">
						<label>Phone Number</label>
						<input
							type="text"
							className="form-control"
							name="phoneNumber"
							value={form.phoneNumber}
							onChange={handleProfileChange}
							disabled={!editMode}
						/>
					</div>
					<div className="col-md-6 mt-3">
						<label>Address</label>
						<input
							type="text"
							className="form-control"
							name="address"
							value={form.address}
							onChange={handleProfileChange}
							disabled={!editMode}
						/>
					</div>
				</div>

				<div className="mt-3">
					{editMode ? (
						<>
							<button className="btn btn-primary me-2" onClick={handleProfileSave}>
								Save
							</button>
							<button className="btn btn-secondary" onClick={() => setEditMode(false)}>
								Cancel
							</button>
						</>
					) : (
						<button className="btn btn-outline-primary" onClick={() => setEditMode(true)}>
							Edit
						</button>
					)}
				</div>
			</div>

			{/* Password Section */}
			<div className="card p-3">
				<h5>Change Password</h5>
				<div className="row">
					<div className="col-md-4">
						<label>Current Password</label>
						<input
							type="password"
							className="form-control"
							name="currentPassword"
							value={passwordForm.currentPassword}
							onChange={handlePasswordChange}
						/>
					</div>
					<div className="col-md-4">
						<label>New Password</label>
						<input
							type="password"
							className="form-control"
							name="newPassword"
							value={passwordForm.newPassword}
							onChange={handlePasswordChange}
						/>
					</div>
					<div className="col-md-4">
						<label>Confirm New Password</label>
						<input
							type="password"
							className="form-control"
							name="confirmPassword"
							value={passwordForm.confirmPassword}
							onChange={handlePasswordChange}
						/>
					</div>
				</div>

				<div className="mt-3">
					<button className="btn btn-warning" onClick={handlePasswordSave}>
						Change Password
					</button>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;