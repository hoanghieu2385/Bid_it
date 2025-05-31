// src/pages/admin/VerifyRequests.jsx
import React, { useEffect, useState } from 'react';
import {
    getVerifyRequests,
    approveUserCCCD,
    denyUserCCCD
} from '../../services/admin-user-api';

const VerifyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            console.log('🌀 Fetching verify requests...');
            const data = await getVerifyRequests();
            console.log('✅ Data received:', data);
            setRequests(data);
        } catch (error) {
            console.error('❌ Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        await approveUserCCCD(userId);
        fetchRequests();
    };

    const handleDeny = async (userId) => {
        await denyUserCCCD(userId);
        fetchRequests();
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="container mt-4">
            <h3 className="mb-3">CCCD Verification Requests</h3>
            {loading && <p>Loading...</p>}
            {!loading && requests.length === 0 && <p>No pending requests.</p>}
            <div className="row">
                {requests.map((user) => (
                    <div className="col-md-6 mb-4" key={user.id}>
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <strong>{user.fullName}</strong> ({user.email})
                            </div>
                            <div className="card-body">
                                <p><strong>Citizen ID:</strong> {user.citizenId}</p>
                                <p>Front Image:</p>
                                <img
                                    src={user.citizenIdFrontImage}
                                    alt="Front"
                                    style={{ maxHeight: '200px', cursor: 'pointer' }}
                                    className="img-fluid border mb-2"
                                    onClick={() => window.open(user.citizenIdFrontImage, '_blank')}
                                />
                                <p>Back Image:</p>
                                <img
                                    src={user.citizenIdBackImage}
                                    alt="Back"
                                    style={{ maxHeight: '200px', cursor: 'pointer' }}
                                    className="img-fluid border mb-3"
                                    onClick={() => window.open(user.citizenIdBackImage, '_blank')}
                                />
                                <div className="d-flex gap-2">
                                    <button className="btn btn-success" onClick={() => handleApprove(user.id)}>
                                        Approve
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDeny(user.id)}>
                                        Deny
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VerifyRequests;
