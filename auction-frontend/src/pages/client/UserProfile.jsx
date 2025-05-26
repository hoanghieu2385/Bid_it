// src/components/client/UserProfile.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext.jsx';
import ProfileInfo from '../../components/client/profile/ProfileInfo';
import EKYCVerification from '../../components/client/profile/EKYCVerification';
import ChangePassword from '../../components/client/profile/ChangePassword';
import MyAuctions from '../../components/client/profile/MyAuctions';
import ParticipatedAuctions from '../../components/client/profile/ParticipatedAuctions';
import { FaUser, FaHistory, FaLock, FaGavel, FaClipboardList } from 'react-icons/fa';
import '../../assets/styles/client/user-profile.css';

const UserProfile = () => {
	// context
	const { user, loading } = useContext(UserContext);

	// router
	const navigate = useNavigate();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const currentTab = queryParams.get('tab') || 'info';

	// chuyển tab và cập nhật URL
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
					{/* Sidebar */}
					<div className="col-md-3 mb-4">
						<div className="user-profile-sidebar list-group shadow-sm">
							<button className={`sidebar-tab list-group-item ${currentTab === 'info' ? 'active' : ''}`} onClick={() => changeTab('info')}>
								<FaUser /> Profile Info
							</button>
							<button className={`sidebar-tab list-group-item ${currentTab === 'ekyc' ? 'active' : ''}`} onClick={() => changeTab('ekyc')}>
								<i className="fa-solid fa-id-card me-2" style={{ color: '#d1d3e2' }} />
								eKYC Verification
							</button>
							<button className={`sidebar-tab list-group-item ${currentTab === 'my-auctions' ? 'active' : ''}`} onClick={() => changeTab('my-auctions')}>
								<FaGavel /> My Auctions
							</button>
							<button className={`sidebar-tab list-group-item ${currentTab === 'participated' ? 'active' : ''}`} onClick={() => changeTab('participated')}>
								<FaClipboardList /> Participated
							</button>
							<button className={`sidebar-tab list-group-item ${currentTab === 'password' ? 'active' : ''}`} onClick={() => changeTab('password')}>
								<FaLock /> Change Password
							</button>
						</div>
					</div>

					{/* Main Content */}
					<div className="col-md-9">
						<div className="user-profile-content">
							{currentTab === 'info' && <ProfileInfo />}
							{currentTab === 'ekyc' && <EKYCVerification />}
							{currentTab === 'my-auctions' && <MyAuctions />}
							{currentTab === 'participated' && <ParticipatedAuctions />}
							{currentTab === 'password' && <ChangePassword />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;