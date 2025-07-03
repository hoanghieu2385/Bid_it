// src/components/client/UserProfile.jsx

import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext.jsx';
import ProfileInfo from '../../components/client/profile/ProfileInfo';
import EKYCVerification from '../../components/client/profile/EKYCVerification';
import ChangePassword from '../../components/client/profile/ChangePassword';
import MyAuctions from '../../components/client/profile/MyAuctions';
import ParticipatedAuctionsNew from '../../components/client/profile/ParticipatedAuctionsNew';
import {FaUser, FaHistory, FaLock, FaGavel, FaClipboardList, FaExclamationCircle} from 'react-icons/fa';
import '../../assets/styles/client/user-profile.css';
import defaultAvatar from '../../assets/images/default-avatar.png';

const UserProfile = () => {
	const { user, loading } = useContext(UserContext);
	const navigate = useNavigate();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const currentTab = queryParams.get('tab') || 'info';

	const changeTab = (tabName) => {
		queryParams.set('tab', tabName);
		navigate({ search: queryParams.toString() });
	};

	useEffect(() => {
		if (!loading && !user) {
			navigate('/login');
		}
		document.title = 'User Profile | Bid it';
	}, [user, loading, navigate]);

	if (loading) return <div className="text-center mt-5">Loading...</div>;
	if (!user) return null;

	return (
		<div className="user-profile-wrapper py-4">
			<div className="container user-profile-container">
				<div className="row">
					{/* Sidebar with Avatar */}
					<div className="col-md-3 mb-4">
						<div className="user-profile-sidebar shadow-sm p-3 rounded bg-white">
							<div className="text-center mb-3">
								<img
									src={defaultAvatar}
									alt="Avatar"
									className="rounded-circle mb-2"
									style={{ width: '100px', height: '100px', objectFit: 'cover' }}
								/>
								<h5 className="fw-bold">{user?.firstName || 'User'}</h5>
								<p className="text-muted small mb-0">{user?.email}</p>
							</div>
							<div className="list-group mt-3">
								<button
									className={`sidebar-tab list-group-item ${currentTab === 'info' ? 'active' : ''}`}
									onClick={() => changeTab('info')}>
									<FaUser className="me-2"/> Profile Info
								</button>
								<button
									className={`sidebar-tab list-group-item ${currentTab === 'ekyc' ? 'active' : ''}`}
									onClick={() => changeTab('ekyc')}
								>
									<div>
										<i className="fa-solid fa-id-card me-2" style={{color: '#d1d3e2'}}/> eKYC Verification
									</div>
									{user?.citizenIdStatus !== 'APPROVED'
										&& (
										<FaExclamationCircle className="text-warning ms-2" title="eKYC not verified"/>
									)}
								</button>
								<button
									className={`sidebar-tab list-group-item ${currentTab === 'my-auctions' ? 'active' : ''}`}
									onClick={() => changeTab('my-auctions')}>
									<FaGavel className="me-2"/> My Auctions
								</button>
								<button
									className={`sidebar-tab list-group-item ${currentTab === 'participated' ? 'active' : ''}`}
									onClick={() => changeTab('participated')}>
									<FaClipboardList className="me-2"/> Participated
								</button>
								<button
									className={`sidebar-tab list-group-item ${currentTab === 'password' ? 'active' : ''}`}
									onClick={() => changeTab('password')}>
									<FaLock className="me-2"/> Change Password
								</button>
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="col-md-9">
						<div className="card shadow-sm p-4">
							{currentTab === 'info' && <ProfileInfo/>}
							{currentTab === 'ekyc' && <EKYCVerification/>}
							{currentTab === 'my-auctions' && <MyAuctions/>}
							{currentTab === 'participated' && <ParticipatedAuctionsNew/>}
							{currentTab === 'password' && <ChangePassword/>}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;