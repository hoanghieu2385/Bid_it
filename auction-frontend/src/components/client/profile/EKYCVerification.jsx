import React, { useState, useEffect } from 'react';
import { getCurrentUser, submitEkycRequest } from '../../../services/user-api';

const EKYCVerification = () => {
	const [citizenId, setCitizenId] = useState('');
	const [frontImage, setFrontImage] = useState(null);
	const [backImage, setBackImage] = useState(null);
	const [frontImagePreview, setFrontImagePreview] = useState(null);
	const [backImagePreview, setBackImagePreview] = useState(null);
	const [status, setStatus] = useState('');
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		getCurrentUser().then((user) => {
			setCitizenId(user.citizenId || '');
			setStatus(
				user.citizenIdStatus === 'APPROVED'
					? 'Verified'
					: user.citizenId
						? user.citizenIdStatus === 'PENDING'
							? 'Pending'
							: user.citizenIdStatus === 'DENIED'
								? 'Rejected'
								: 'Not Submitted'
						: 'Not Submitted'
			);
			setFrontImagePreview(user.citizenIdFrontImage || null);
			setBackImagePreview(user.citizenIdBackImage || null);
		});
	}, []);

	const isValidFile = (file) => {
		const validTypes = ['image/jpeg', 'image/png'];
		const maxSize = 5 * 1024 * 1024; // 5MB

		if (!validTypes.includes(file.type)) {
			alert('Only JPG and PNG files are allowed.');
			return false;
		}

		if (file.size > maxSize) {
			alert('File size must be less than 5MB.');
			return false;
		}

		return true;
	};

	const handleFrontImageChange = (e) => {
		const file = e.target.files[0];
		if (file && isValidFile(file)) {
			setFrontImage(file);
			setFrontImagePreview(URL.createObjectURL(file));
		} else {
			e.target.value = '';
		}
	};

	const handleBackImageChange = (e) => {
		const file = e.target.files[0];
		if (file && isValidFile(file)) {
			setBackImage(file);
			setBackImagePreview(URL.createObjectURL(file));
		} else {
			e.target.value = '';
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!citizenId || citizenId.length !== 12) {
			setMessage('Citizen ID must be exactly 12 digits.');
			return;
		}
		if (!frontImage || !backImage) {
			setMessage('Please upload both front and back images of your ID card.');
			return;
		}

		setLoading(true);
		const formData = new FormData();
		formData.append('citizenId', citizenId);
		formData.append('frontImage', frontImage);
		formData.append('backImage', backImage);

		try {
			await submitEkycRequest(formData);
			setMessage('eKYC submitted successfully. Please wait for verification.');
			setStatus('Pending');
		} catch {
			setMessage('Submission failed');
		} finally {
			setLoading(false);
		}
	};

	const isEditable = status === 'Not Submitted' || status === 'Rejected';

	return (
		<div className="card p-4">
			<h5 className="mb-3">eKYC Verification</h5>
			<p>Status: <strong>{status}</strong></p>

			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label className="form-label">Citizen ID</label>
					<input
						type="text"
						className="form-control"
						value={citizenId}
						onChange={(e) => {
							const value = e.target.value;
							// Chỉ cho phép nhập số
							if (/^\d*$/.test(value)) {
								setCitizenId(value);
							}
						}}
						disabled={!isEditable}
						placeholder="Enter 12-digit Citizen ID"
						maxLength={12}
						required
					/>
				</div>

				<div className="mb-3">
					<label className="form-label">Front of ID Card</label>
					{isEditable && (
						<input
							type="file"
							className="form-control"
							accept=".jpg,.jpeg,.png"
							onChange={handleFrontImageChange}
							required
						/>
					)}
					{frontImagePreview && (
						<div className="mt-2">
							<img src={frontImagePreview} alt="Front" width="200" className="border" />
						</div>
					)}
				</div>

				<div className="mb-3">
					<label className="form-label">Back of ID Card</label>
					{isEditable && (
						<input
							type="file"
							className="form-control"
							accept=".jpg,.jpeg,.png"
							onChange={handleBackImageChange}
							required
						/>
					)}
					{backImagePreview && (
						<div className="mt-2">
							<img src={backImagePreview} alt="Back" width="200" className="border" />
						</div>
					)}
				</div>

				{message && <div className="alert alert-info">{message}</div>}

				{isEditable && (
					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? 'Submitting...' : 'Submit Verification'}
					</button>
				)}
			</form>
		</div>
	);
};

export default EKYCVerification;