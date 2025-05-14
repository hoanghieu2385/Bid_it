import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCurrentUser, updateUserProfile } from '../../../services/user-api';

const ProfileInfo = () => {
	const [user, setUser] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [provinces, setProvinces] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [wards, setWards] = useState([]);

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

	// Load user and province list
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

				// Auto-parse address into location
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

	// Parse full address into dropdowns
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
		const res = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
		setDistricts(res.data.districts || []);
		setWards([]);
	};

	const handleDistrictChange = async (e) => {
		const districtCode = e.target.value;
		setLocation({ ...location, district: districtCode, ward: '' });
		const res = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
		setWards(res.data.wards || []);
	};

	const handleWardChange = (e) => {
		setLocation({ ...location, ward: e.target.value });
	};

	const handleDetailChange = (e) => {
		setLocation({ ...location, detail: e.target.value });
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSave = async () => {
		const selectedProvince = provinces.find((p) => p.code.toString() === location.province);
		const selectedDistrict = districts.find((d) => d.code.toString() === location.district);
		const selectedWard = wards.find((w) => w.code.toString() === location.ward);

		const fullAddress = `${location.detail}, ${selectedWard?.name || ''}, ${selectedDistrict?.name || ''}, ${
			selectedProvince?.name || ''
		}`;

		try {
			await updateUserProfile(user.id, {
				...form,
				address: fullAddress,
			});
			setForm({ ...form, address: fullAddress });
			alert('Profile updated successfully');
			setEditMode(false);
		} catch (error) {
			console.error('Update failed:', error);
			alert('Failed to update profile');
		}
	};

	if (!user) return <div>Loading...</div>;

	return (
		<div className="card p-3">
			<h5>Personal Information</h5>
			<div className="row">
				<div className="col-md-6">
					<label>Email (read-only)</label>
					<input type="email" className="form-control" value={user.email} disabled />
				</div>
				<div className="col-md-6">
					<label>First Name</label>
					<input
						type="text"
						className="form-control"
						name="firstName"
						value={form.firstName}
						onChange={handleChange}
						disabled={!editMode}
					/>
				</div>
				<div className="col-md-6 mt-3">
					<label>Last Name</label>
					<input
						type="text"
						className="form-control"
						name="lastName"
						value={form.lastName}
						onChange={handleChange}
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
						onChange={handleChange}
						disabled={!editMode}
					/>
				</div>

				{editMode ? (
					<>
						<div className="col-md-4 mt-3">
							<label>Province / City</label>
							<select className="form-control" value={location.province} onChange={handleProvinceChange}>
								<option value="">Select province</option>
								{provinces.map((prov) => (
									<option key={prov.code} value={prov.code}>
										{prov.name}
									</option>
								))}
							</select>
						</div>

						<div className="col-md-4 mt-3">
							<label>District</label>
							<select className="form-control" value={location.district} onChange={handleDistrictChange}>
								<option value="">Select district</option>
								{districts.map((dist) => (
									<option key={dist.code} value={dist.code}>
										{dist.name}
									</option>
								))}
							</select>
						</div>

						<div className="col-md-4 mt-3">
							<label>Ward</label>
							<select className="form-control" value={location.ward} onChange={handleWardChange}>
								<option value="">Select ward</option>
								{wards.map((ward) => (
									<option key={ward.code} value={ward.code}>
										{ward.name}
									</option>
								))}
							</select>
						</div>

						<div className="col-md-12 mt-3">
							<label>Detail Address</label>
							<input type="text" className="form-control" value={location.detail} onChange={handleDetailChange} />
						</div>
					</>
				) : (
					<div className="col-md-12 mt-3">
						<label>Address</label>
						<input type="text" className="form-control" value={form.address} disabled />
					</div>
				)}
			</div>

			<div className="mt-3">
				{editMode ? (
					<>
						<button className="btn btn-primary me-2" onClick={handleSave}>
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
	);
};

export default ProfileInfo;
