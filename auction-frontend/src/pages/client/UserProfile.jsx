// src/components/client/UserProfile.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext.jsx';
import ProfileInfo from '../../components/client/profile/ProfileInfo';
import EKYCVerification from '../../components/client/profile/EKYCVerification';
import AuctionHistory from '../../components/client/profile/AuctionHistory';
import ChangePassword from '../../components/client/profile/ChangePassword';
import { FaUser, FaHistory, FaLock } from 'react-icons/fa';
import '../../assets/styles/client/user-profile.css';

const UserProfile = () => {
	const [activeTab, setActiveTab] = useState('info');
	const { user, loading } = useContext(UserContext);
	const navigate = useNavigate();

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
							<button
								className={`sidebar-tab list-group-item ${activeTab === 'info' ? 'active' : ''}`}
								onClick={() => setActiveTab('info')}
							>
								<FaUser /> Profile Info
							</button>
							<button
								className={`sidebar-tab list-group-item ${activeTab === 'ekyc' ? 'active' : ''}`}
								onClick={() => setActiveTab('ekyc')}
							>
								<i className="fa-solid fa-id-card me-2" style={{ color: '#d1d3e2' }} />
								eKYC Verification
							</button>
							<button
								className={`sidebar-tab list-group-item ${activeTab === 'history' ? 'active' : ''}`}
								onClick={() => setActiveTab('history')}
							>
								<FaHistory /> Auction History
							</button>
							<button
								className={`sidebar-tab list-group-item ${activeTab === 'password' ? 'active' : ''}`}
								onClick={() => setActiveTab('password')}
							>
								<FaLock /> Change Password
							</button>
						</div>
					</div>

					{/* Main Content */}
					<div className="col-md-9">
						<div className="user-profile-content">
							{activeTab === 'info' && <ProfileInfo />}
							{activeTab === 'ekyc' && <EKYCVerification />}
							{activeTab === 'history' && <AuctionHistory />}
							{activeTab === 'password' && <ChangePassword />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
