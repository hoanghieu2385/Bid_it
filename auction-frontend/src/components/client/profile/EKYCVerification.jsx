import React, { useState, useEffect } from 'react';
import { getCurrentUser, submitEkycRequest } from '../../../services/user-api';

const EKYCVerification = () => {
	const [citizenId, setCitizenId] = useState('');
	const [frontImage, setFrontImage] = useState(null);
	const [backImage, setBackImage] = useState(null);
	const [status, setStatus] = useState('');
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		getCurrentUser().then((user) => {
			setCitizenId(user.citizenId || '');
			setStatus(user.verifiedAccount ? 'Verified' : 'Unverified');
		});
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!citizenId || !frontImage || !backImage) {
			setMessage('Please fill all required fields');
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
		} catch {
			setMessage('Submission failed');
		} finally {
			setLoading(false);
		}
	};

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
						onChange={(e) => setCitizenId(e.target.value)}
						required
					/>
				</div>

				<div className="mb-3">
					<label className="form-label">Front of ID Card</label>
					<input
						type="file"
						className="form-control"
						onChange={(e) => setFrontImage(e.target.files[0])}
						required
					/>
				</div>

				<div className="mb-3">
					<label className="form-label">Back of ID Card</label>
					<input
						type="file"
						className="form-control"
						onChange={(e) => setBackImage(e.target.files[0])}
						required
					/>
				</div>

				{message && <div className="alert alert-info">{message}</div>}

				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? 'Submitting...' : 'Submit Verification'}
				</button>
			</form>
		</div>
	);
};

export default EKYCVerification;
