// src/components/client/UserProfile.jsx
import React, { useState } from 'react';
import ProfileInfo from '../../components/client/profile/ProfileInfo';
import AuctionHistory from '../../components/client/profile/AuctionHistory';
import ChangePassword from '../../components/client/profile/ChangePassword';
import { FaUser, FaHistory, FaLock } from 'react-icons/fa';
import '../../assets/styles/client/user-profile.css';

const UserProfile = () => {
	const [activeTab, setActiveTab] = useState('info');

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