// src/components/client/profile/ProfileInfo.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useToastMessage from '../../../hooks/useToastMessage';
import { getCurrentUser, updateUserProfile, sendPhoneOtp, verifyPhoneOtp } from '../../../services/user-api';

const ProfileInfo = () => {
	const { showSuccess, showError } = useToastMessage();

	const [user, setUser] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [provinces, setProvinces] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [wards, setWards] = useState([]);

	const [phoneVerification, setPhoneVerification] = useState({
		isVerifying: false,
		otpSent: false,
		otp: '',
		countdown: 0,
		isLoading: false,
	});

	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		phoneNumber: '',
		address: '',
	});

	const [location, setLocation] = useState({
		province: '',
		district: '',
		ward: '',
		detail: '',
	});

	const [errors, setErrors] = useState({
		province: false,
		district: false,
		ward: false,
		detail: false,
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userData = await getCurrentUser();
				setUser(userData);
				setForm({
					firstName: userData.firstName || '',
					lastName: userData.lastName || '',
					phoneNumber: userData.phoneNumber || '',
					address: userData.address || '',
				});
				await loadProvinces();
				if (userData.address) {
					parseAddress(userData.address);
				}
			} catch (error) {
				console.error('Failed to load profile:', error);
			}
		};

		const loadProvinces = async () => {
			const res = await axios.get('https://provinces.open-api.vn/api/?depth=1');
			setProvinces(res.data);
		};

		fetchData();
	}, []);

	useEffect(() => {
		let timer;
		if (phoneVerification.countdown > 0) {
			timer = setTimeout(() => {
				setPhoneVerification((prev) => ({
					...prev,
					countdown: prev.countdown - 1,
				}));
			}, 1000);
		}
		return () => clearTimeout(timer);
	}, [phoneVerification.countdown]);

	const parseAddress = async (address) => {
		const parts = address.split(',').map((p) => p.trim());
		if (parts.length < 4) return;

		const [detail, wardName, districtName, provinceName] = parts;

		const province = await axios.get('https://provinces.open-api.vn/api/?depth=1');
		const selectedProvince = province.data.find((p) => p.name === provinceName);
		if (!selectedProvince) return;

		const districtRes = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`);
		const selectedDistrict = districtRes.data.districts.find((d) => d.name === districtName);
		if (!selectedDistrict) return;

		const wardRes = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`);
		const selectedWard = wardRes.data.wards.find((w) => w.name === wardName);

		setLocation({
			detail,
			province: selectedProvince.code.toString(),
			district: selectedDistrict.code.toString(),
			ward: selectedWard?.code.toString() || '',
		});
		setDistricts(districtRes.data.districts);
		setWards(wardRes.data.wards);
	};

	const handleProvinceChange = async (e) => {
		const provinceCode = e.target.value;
		setLocation({ ...location, province: provinceCode, district: '', ward: '' });
		setErrors({ ...errors, province: false });

		const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
		setDistricts(res.data.districts || []);
		setWards([]);
	};

	const handleDistrictChange = async (e) => {
		const districtCode = e.target.value;
		setLocation({ ...location, district: districtCode, ward: '' });
		setErrors({ ...errors, district: false });

		const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
		setWards(res.data.wards || []);
	};

	const handleWardChange = (e) => {
		setLocation({ ...location, ward: e.target.value });
		setErrors({ ...errors, ward: false });
	};

	const handleDetailChange = (e) => {
		setLocation({ ...location, detail: e.target.value });
		setErrors({ ...errors, detail: false });
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSendPhoneOtp = async () => {
		if (!form.phoneNumber.trim()) {
			showError('Please enter a phone number first.');
			return;
		}
		const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
		if (!phoneRegex.test(form.phoneNumber)) {
			showError('Please enter a valid Vietnamese phone number.');
			return;
		}

		setPhoneVerification((prev) => ({ ...prev, isLoading: true }));

		try {
			await sendPhoneOtp(form.phoneNumber);
			setPhoneVerification((prev) => ({
				...prev,
				otpSent: true,
				isVerifying: true,
				countdown: 60,
				isLoading: false,
				otp: '',
			}));
			showSuccess('OTP has been sent to your phone number.');
		} catch (error) {
			console.error('Failed to send OTP:', error);
			showError('Failed to send OTP. Please try again.');
			setPhoneVerification((prev) => ({ ...prev, isLoading: false }));
		}
	};

	const handleVerifyPhoneOtp = async () => {
		if (!phoneVerification.otp.trim()) {
			showError('Please enter the OTP code.');
			return;
		}

		setPhoneVerification((prev) => ({ ...prev, isLoading: true }));

		try {
			await verifyPhoneOtp(form.phoneNumber, phoneVerification.otp);
			const updatedUser = await getCurrentUser();
			setUser(updatedUser);
			setPhoneVerification({
				isVerifying: false,
				otpSent: false,
				otp: '',
				countdown: 0,
				isLoading: false,
			});
			showSuccess('Phone number verified successfully!');
		} catch (error) {
			console.error('Failed to verify OTP:', error);
			showError('Invalid or expired OTP code.');
			setPhoneVerification((prev) => ({ ...prev, isLoading: false }));
		}
	};

	const handleCancelPhoneVerification = () => {
		setPhoneVerification({
			isVerifying: false,
			otpSent: false,
			otp: '',
			countdown: 0,
			isLoading: false,
		});
	};

	const handleSave = async () => {
		const provinceValid = !!location.province;
		const districtValid = !!location.district;
		const wardValid = !!location.ward;
		const detailValid = location.detail.trim() !== '';

		setErrors({
			province: !provinceValid,
			district: !districtValid,
			ward: !wardValid,
			detail: !detailValid,
		});

		if (!provinceValid || !districtValid || !wardValid || !detailValid) {
			showError('Please complete all address fields before saving.');
			return;
		}

		const selectedProvince = provinces.find((p) => p.code.toString() === location.province);
		const selectedDistrict = districts.find((d) => d.code.toString() === location.district);
		const selectedWard = wards.find((w) => w.code.toString() === location.ward);

		const fullAddress = `${location.detail}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;

		try {
			await updateUserProfile(user.id, {
				...form,
				address: fullAddress,
			});
			setForm({ ...form, address: fullAddress });
			showSuccess('Profile updated successfully!');
			setEditMode(false);
		} catch (error) {
			console.error('Update failed:', error);
			showError('Failed to update profile. Please try again later.');
		}
	};

	if (!user) return <div>Loading...</div>;

	return (
		<div className="profile-info-card p-5">
			<h3 className="mb-5 text-primary fw-bold">Personal Information</h3>
			<div className="row g-4">
				<div className="col-lg-6">
					<label className="form-label fs-6 fw-semibold">Email</label>
					<input type="email" className="form-control form-control-lg" value={user.email} disabled/>
				</div>

				<div className="col-lg-6">
					<label className="form-label fs-6 fw-semibold">First Name</label>
					<input
						type="text"
						className="form-control form-control-lg"
						name="firstName"
						value={form.firstName}
						onChange={handleChange}
						disabled={!editMode}
					/>
				</div>

				<div className="col-lg-6">
					<label className="form-label fs-6 fw-semibold">Last Name</label>
					<input
						type="text"
						className="form-control form-control-lg"
						name="lastName"
						value={form.lastName}
						onChange={handleChange}
						disabled={!editMode}
					/>
				</div>

				{/* Phone Number with Verification */}
				<div className="col-lg-6">
					<label className="form-label fs-6 fw-semibold">
						Phone Number
						{user.phoneVerified && (
							<span className="badge bg-success ms-2 px-3 py-2">
        <i className="fas fa-check-circle me-1"></i>Verified
      </span>
						)}
					</label>

					{editMode ? (
						<div className="row g-2">
							<div className="col-8">
								<input
									type="text"
									className="form-control form-control-lg"
									name="phoneNumber"
									value={form.phoneNumber}
									onChange={handleChange}
									placeholder="Enter your phone number"
								/>
							</div>
							<div className="col-4">
								{!user.phoneVerified && !phoneVerification.isVerifying && (
									<button
										className="btn btn-outline-primary btn-lg w-100"
										type="button"
										onClick={handleSendPhoneOtp}
										disabled={phoneVerification.isLoading || !form.phoneNumber.trim()}
									>
										{phoneVerification.isLoading ? (
											<>
												<span className="spinner-border spinner-border-sm me-2"
													  role="status"></span>
												Sending...
											</>
										) : (
											<>
												<i className="fas fa-shield-alt me-2"></i>
												Verify
											</>
										)}
									</button>
								)}
							</div>
						</div>
					) : (
						<input
							type="text"
							className="form-control form-control-lg"
							value={form.phoneNumber}
							disabled
						/>
					)}
				</div>


				{/* OTP Verification Section */}
				{phoneVerification.isVerifying && (
					<div className="col-12">
						<div className="card border-primary shadow-sm">
							<div className="card-body p-4">
								<h5 className="card-title text-primary mb-3">
									<i className="fas fa-mobile-alt me-3"></i>
									Phone Verification
								</h5>
								<p className="card-text text-muted mb-4 fs-6">
									We've sent a verification code to <strong
									className="text-dark">{form.phoneNumber}</strong>
								</p>

								<div className="row g-3 align-items-end">
									<div className="col-lg-4">
										<label className="form-label fs-6 fw-semibold">Enter OTP Code</label>
										<input
											type="text"
											className="form-control form-control-lg text-center fs-4 fw-bold"
											value={phoneVerification.otp}
											onChange={(e) => setPhoneVerification(prev => ({
												...prev,
												otp: e.target.value
											}))}
											placeholder="000000"
											maxLength="6"
											style={{letterSpacing: '0.5rem'}}
										/>
									</div>
									<div className="col-lg-8">
										<div className="d-flex gap-3 flex-wrap">
											<button
												className="btn btn-success btn-lg px-4"
												onClick={handleVerifyPhoneOtp}
												disabled={phoneVerification.isLoading || !phoneVerification.otp.trim()}
											>
												{phoneVerification.isLoading ? (
													<>
														<span className="spinner-border spinner-border-sm me-2"
															  role="status"></span>
														Verifying...
													</>
												) : (
													<>
														<i className="fas fa-check me-2"></i>
														Verify Code
													</>
												)}
											</button>

											<button
												className="btn btn-outline-primary btn-lg px-4"
												onClick={handleSendPhoneOtp}
												disabled={phoneVerification.countdown > 0 || phoneVerification.isLoading}
											>
												{phoneVerification.countdown > 0 ? (
													<>
														<i className="fas fa-clock me-2"></i>
														Resend in {phoneVerification.countdown}s
													</>
												) : (
													<>
														<i className="fas fa-redo me-2"></i>
														Resend OTP
													</>
												)}
											</button>

											<button
												className="btn btn-outline-secondary btn-lg px-4"
												onClick={handleCancelPhoneVerification}
												disabled={phoneVerification.isLoading}
											>
												<i className="fas fa-times me-2"></i>
												Cancel
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{editMode ? (
					<>
						<div className="col-lg-4">
							<label className="form-label fs-6 fw-semibold">Province / City</label>
							<select
								className={`form-select form-select-lg ${errors.province ? 'is-invalid' : ''}`}
								value={location.province}
								onChange={handleProvinceChange}
							>
								<option value="">Select province</option>
								{provinces.map((prov) => (
									<option key={prov.code} value={prov.code}>
										{prov.name}
									</option>
								))}
							</select>
							{errors.province && <div className="invalid-feedback">Province is required.</div>}
						</div>

						<div className="col-lg-4">
							<label className="form-label fs-6 fw-semibold">District</label>
							<select
								className={`form-select form-select-lg ${errors.district ? 'is-invalid' : ''}`}
								value={location.district}
								onChange={handleDistrictChange}
							>
								<option value="">Select district</option>
								{districts.map((dist) => (
									<option key={dist.code} value={dist.code}>
										{dist.name}
									</option>
								))}
							</select>
							{errors.district && <div className="invalid-feedback">District is required.</div>}
						</div>

						<div className="col-lg-4">
							<label className="form-label fs-6 fw-semibold">Ward</label>
							<select
								className={`form-select form-select-lg ${errors.ward ? 'is-invalid' : ''}`}
								value={location.ward}
								onChange={handleWardChange}
							>
								<option value="">Select ward</option>
								{wards.map((ward) => (
									<option key={ward.code} value={ward.code}>
										{ward.name}
									</option>
								))}
							</select>
							{errors.ward && <div className="invalid-feedback">Ward is required.</div>}
						</div>

						<div className="col-12">
							<label className="form-label fs-6 fw-semibold">Detail Address</label>
							<input
								type="text"
								className={`form-control form-control-lg ${errors.detail ? 'is-invalid' : ''}`}
								value={location.detail}
								onChange={handleDetailChange}
								placeholder="Enter your detailed address"
							/>
							{errors.detail && <div className="invalid-feedback">Detail address is required.</div>}
						</div>
					</>
				) : (
					<div className="col-12">
						<label className="form-label fs-6 fw-semibold">Address</label>
						<textarea
							className="form-control form-control-lg"
							value={form.address}
							disabled
							rows="2"
							style={{resize: 'none'}}
						/>
					</div>
				)}

				<div className="col-lg-6">
					<label className="form-label fs-6 fw-semibold">Score</label>
					<input
						type="text"
						className="form-control form-control-lg"
						value={user.score}
						disabled
					/>
				</div>

				<div className="col-12 d-flex justify-content-end mt-4 pt-3 border-top">
					{editMode ? (
						<>
							<button className="btn btn-success btn-lg me-3 px-5" onClick={handleSave}>
								<i className="fas fa-save me-2"></i>
								Save Changes
							</button>
							<button className="btn btn-outline-secondary btn-lg px-4"
									onClick={() => setEditMode(false)}>
								<i className="fas fa-times me-2"></i>
								Cancel
							</button>
						</>
					) : (
						<button className="btn btn-outline-primary btn-lg px-5" onClick={() => setEditMode(true)}>
							<i className="fas fa-edit me-2"></i>
							Edit Profile
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfileInfo;