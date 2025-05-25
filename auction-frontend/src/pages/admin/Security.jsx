// src/pages/admin/Security.jsx
import React from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Topbar from '../../components/admin/Topbar';
import ChangePassword from '../../components/client/profile/ChangePassword';

const Security = () => {
	return (
		<div className="d-flex">
			<Sidebar />
			<div className="d-flex flex-column flex-grow-1">
				<Topbar />
				<div className="container-fluid px-4 py-4 bg-light min-vh-100">
						<ChangePassword />
				</div>
			</div>
		</div>
	);
};

export default Security;
