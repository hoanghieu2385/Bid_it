import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import {
  getUserById,
  updateUserProfile,
  deleteUser,
  toggleUserLock,
  toggleUserVerification,
  updateUserRoles,
  resetUserPassword,
} from "../../services/admin-user-api";
import bidAPI from "../../services/bid-admin-api";
import paymentAPI from "../../services/admin-payment-api";
import adminAuctionAPI from "../../services/admin-auction-api";
import {
  FaEdit,
  FaTrash,
  FaUnlock,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaUserShield,
  FaUser,
  FaKey,
} from "react-icons/fa";
import "../../assets/styles/admin/UserDetail.css";

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({
    totalAuctions: 0,
    totalBids: 0,
    bidsWon: 0,
    auctionEarnings: 0,
    totalPaid: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    draftAuctions: 0,
    totalBidsMade: 0,
    totalPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserStats();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log("Fetching user with ID:", userId);

      if (!userId) {
        setError("User ID does not exist, unable to load user information");
        setLoading(false);
        return;
      }

      const userData = await getUserById(userId);
      setUser(userData);
      
      // Update form data to match Spring Boot User model
      setEditedUser({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || ""
      });
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Unable to load user information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      console.log("Fetching user stats for ID:", userId);
      
      // Fetch auctions by seller ID
      const userAuctions = await adminAuctionAPI.getAuctionsBySeller(userId);
      console.log("User auctions:", userAuctions);
      
      // Fetch user bids
      let userBids = [];
      let bidsWon = 0;
      try {
        userBids = await bidAPI.getBidsByUser(userId);
        // Calculate bids won (bids where user won the auction)
        bidsWon = userBids.filter(bid => bid.isWinning).length;
      } catch (err) {
        console.error("Error fetching user bids:", err);
      }
      
      // Fetch user payments
      let userPayments = [];
      let totalPaid = 0;
      try {
        userPayments = await paymentAPI.getPaymentsByUserId(userId);
        // Calculate total amount paid
        totalPaid = userPayments
          .filter(payment => payment.status === 'COMPLETED' || payment.status === 'SUCCESS')
          .reduce((total, payment) => total + (payment.amount || 0), 0);
      } catch (err) {
        console.error("Error fetching user payments:", err);
      }
      
      // Calculate stats from auctions
      const stats = {
        totalAuctions: userAuctions.length,
        activeAuctions: userAuctions.filter(auction => auction.status === 'OPENED').length,
        completedAuctions: userAuctions.filter(auction => auction.status === 'COMPLETED').length,
        draftAuctions: userAuctions.filter(auction => auction.status === 'DRAFT').length,
        // Calculate total earnings from completed auctions
        auctionEarnings: userAuctions
          .filter(auction => auction.status === 'COMPLETED' && auction.currentBid)
          .reduce((total, auction) => total + (auction.currentBid || 0), 0),
        // Calculate total bids count from auctions
        totalBids: userAuctions.reduce((total, auction) => total + (auction.bidCount || 0), 0),
        // Real data from API calls
        bidsWon: bidsWon,
        totalPaid: totalPaid,
        // Additional stats
        totalBidsMade: userBids.length,
        totalPayments: userPayments.length
      };

      setUserStats(stats);
      console.log("Calculated user stats:", stats);
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setUserStats({
        totalAuctions: 0,
        totalBids: 0,
        bidsWon: 0,
        auctionEarnings: 0,
        totalPaid: 0,
        activeAuctions: 0,
        completedAuctions: 0,
        draftAuctions: 0,
        totalBidsMade: 0,
        totalPayments: 0
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Modified handleEditToggle function
  const handleEditToggle = () => {
    console.log("Before changing editMode:", editMode);
    if (editMode) {
      // Cancel editing, reset form to original data
      setEditedUser({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || ""
      });
    }
    setEditMode(!editMode);
    console.log("After changing editMode:", !editMode);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(userId, editedUser);
      setUser(updatedUser);
      setEditMode(false);
      showSuccess("User information has been updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      setFormError(
        err.response?.data || "Unable to update user information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLockUser = async () => {
    try {
      setLoading(true);
      const updatedUser = await toggleUserLock(userId, !user.locked);
      setUser(updatedUser);
      showSuccess(
        `Account has been ${
          updatedUser.locked ? "locked" : "unlocked"
        } successfully!`
      );
    } catch (err) {
      console.error("Error toggling user lock status:", err);
      setFormError(
        `Unable to ${
          user.locked ? "unlock" : "lock"
        } account. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleVerifyUser = async () => {
    try {
      setLoading(true);
      const updatedUser = await toggleUserVerification(userId, !user.verified);
      setUser(updatedUser);
      showSuccess(
        `Account has been ${
          updatedUser.verified ? "verified" : "unverified"
        } successfully!`
      );
    } catch (err) {
      console.error("Error toggling user verification status:", err);
      setFormError(
        `Unable to ${
          user.verified ? "unverify" : "verify"
        } account. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (isAdmin) => {
    try {
      setLoading(true);
      // Convert to Spring Security roles format
      const roles = new Set(user.roles || []);
      
      if (isAdmin) {
        roles.add("ADMIN");
      } else {
        roles.delete("ADMIN");
        // Ensure there's always at least USER role
        roles.add("USER");
      }
      
      const updatedUser = await updateUserRoles(userId, Array.from(roles));
      setUser(updatedUser);
      showSuccess(
        `User role has been updated successfully!`
      );
    } catch (err) {
      console.error("Error updating user roles:", err);
      setFormError("Unable to update user role. Please try again.");
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await resetUserPassword(userId);
      showSuccess("Password reset email has been sent to the user!");
    } catch (err) {
      console.error("Error resetting password:", err);
      setFormError("Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      await deleteUser(userId);
      navigate("/admin/users", {
        state: { message: "User has been deleted successfully!" },
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      setFormError("Unable to delete user. Please try again.");
      setIsDeleting(false);
      setConfirmAction(null);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#10B981"; // Green
    if (score >= 50) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const isUserAdmin = () => {
    return user?.roles?.includes("ADMIN");
  };

  // Display user's full name
  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    }
    return "No name";
  };

  // Display first letter of name for avatar (if no avatar exists)
  const getInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.lastName) return user.lastName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  // UI render
  const renderConfirmationModal = () => {
    if (!confirmAction) return null;

    let title, message, confirmText;
    let onConfirmAction = null;

    switch (confirmAction) {
      case "delete":
        title = "Confirm User Deletion";
        message = `Are you sure you want to delete the account of user '${user?.email || ""}'? This action cannot be undone.`;
        confirmText = "Delete";
        onConfirmAction = handleDeleteUser;
        break;
      case "reset-password":
        title = "Confirm Password Reset";
        message = `Send password reset email to user '${user?.email || ""}'?`;
        confirmText = "Send";
        onConfirmAction = handleResetPassword;
        break;
      case "change-role":
        title = "Confirm Role Change";
        message = `Are you sure you want to ${
          isUserAdmin() ? "remove ADMIN privileges" : "grant ADMIN privileges"
        } for user '${user?.email || ""}'?`;
        confirmText = "Confirm";
        onConfirmAction = () => handleRoleChange(!isUserAdmin());
        break;
      default:
        return null;
    }

    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h3>{title}</h3>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              className="modal-btn cancel-btn"
              onClick={() => setConfirmAction(null)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="modal-btn confirm-btn"
              onClick={onConfirmAction}
              disabled={isDeleting}
            >
              {isDeleting ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !user) {
    return (
      <div id="wrapper">
        <Sidebar />
        <div
          id="content-wrapper"
          className="d-flex flex-column"
          style={{ flex: 1 }}
        >
          <div id="content">
            <Topbar />
            <div className="container-fluid">
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading user information...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="wrapper">
        <Sidebar />
        <div
          id="content-wrapper"
          className="d-flex flex-column"
          style={{ flex: 1 }}
        >
          <div id="content">
            <Topbar />
            <div className="container-fluid">
              <div className="error-container">
                <FaExclamationTriangle size={40} color="#f8bb86" />
                <h2>An Error Occurred</h2>
                <p>{error}</p>
                <button className="btn-retry" onClick={fetchUserData}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="wrapper">
      <Sidebar />
      <div
        id="content-wrapper"
        className="d-flex flex-column"
        style={{ flex: 1 }}
      >
        <div id="content">
          <Topbar />
          <div className="container-fluid user-detail-container">
            {renderConfirmationModal()}

            {/* Header with back button */}
            <div className="user-detail-header">
              <button
                className="back-button"
                onClick={() => navigate("/admin/users")}
              >
                <FaArrowLeft /> Back to List
              </button>

              <div className="user-actions">
                {editMode ? (
                  <>
                    <button
                      className="action-btn save-btn"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      className="action-btn cancel-btn"
                      onClick={handleEditToggle}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="action-btn edit-btn"
                      onClick={handleEditToggle}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => setConfirmAction("delete")}
                    >
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Success message */}
            {success && (
              <div className="alert-success">
                <FaCheckCircle /> {success}
              </div>
            )}

            {/* Error message */}
            {formError && (
              <div className="alert-error">
                <FaTimesCircle /> {formError}
              </div>
            )}

            <div className="user-detail-content">
              {/* User Profile Section */}
              <div className="user-profile-section">
                <div className="user-profile-header">
                  <div className="user-avatar-container">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={getFullName()}
                        className="user-avatar-lg"
                      />
                    ) : (
                      <div className="user-avatar-placeholder-lg">
                        {getInitial()}
                      </div>
                    )}
                  </div>
                  <div className="user-title-info">
                    <h1 className="user-username">
                      {getFullName()}
                    </h1>
                    <div className="user-badges">
                      <span
                        className={`status-badge ${
                          user?.verified ? "verified" : "unverified"
                        }`}
                      >
                        {user?.verified ? "Verified" : "Unverified"}
                      </span>
                      {user?.locked && (
                        <span className="status-badge locked">Locked</span>
                      )}
                      {isUserAdmin() && (
                        <span className="status-badge admin">Admin</span>
                      )}
                    </div>
                    <p className="join-date">
                      Join Date: {formatDate(user?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* User Form */}
                <form
                  id="user-form"
                  className="user-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  <div className="form-section">
                    <h2>Personal Information</h2>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        {editMode ? (
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={editedUser.firstName || ""}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="edit-input"
                          />
                        ) : (
                          <p className="form-value">
                            {user?.firstName || "None"}
                          </p>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        {editMode ? (
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={editedUser.lastName || ""}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="edit-input"
                          />
                        ) : (
                          <p className="form-value">
                            {user?.lastName || "None"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        {editMode ? (
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={editedUser.email || ""}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="edit-input"
                          />
                        ) : (
                          <p className="form-value">
                            {user?.email || "None"}
                          </p>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        {editMode ? (
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={editedUser.phoneNumber || ""}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="edit-input"
                          />
                        ) : (
                          <p className="form-value">
                            {user?.phoneNumber || "None"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor="address">Address</label>
                        {editMode ? (
                          <textarea
                            id="address"
                            name="address"
                            value={editedUser.address || ""}
                            onChange={handleInputChange}
                            rows="3"
                            disabled={loading}
                            className="edit-input"
                          />
                        ) : (
                          <p className="form-value">
                            {user?.address || "None"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>

                {/* User Stats and Activity - Now using real data from API */}
                <div className="form-section">
                  <h2>Usage Statistics</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-title">Credit Score</div>
                      <div
                        className="stat-value"
                        style={{ color: getScoreColor(user?.points || 0) }}
                      >
                        {user?.points || 0} / 100
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Auctions Posted</div>
                      <div className="stat-value">
                        {userStats.totalAuctions}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Bids Made</div>
                      <div className="stat-value">{userStats.totalBidsMade}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Total Payments</div>
                      <div className="stat-value">{userStats.totalPayments}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Active Auctions</div>
                      <div className="stat-value">{userStats.activeAuctions}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Bids Won</div>
                      <div className="stat-value">{userStats.bidsWon}</div>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="form-section">
                  <h2>Admin Actions</h2>
                  <div className="admin-actions-grid">
                    <div className="admin-action-card">
                      <div className="admin-action-content">
                        <h3>
                          {user?.locked ? (
                            <>
                              <FaLock /> Account is Locked
                            </>
                          ) : (
                            <>
                              <FaUnlock /> Account is Active
                            </>
                          )}
                        </h3>
                        <p>
                          {user?.locked
                            ? "User currently cannot log in or use the system."
                            : "User can log in and use the system normally."}
                        </p>
                      </div>
                      <button
                        className={`admin-action-btn ${
                          user?.locked ? "unlock-btn" : "lock-btn"
                        }`}
                        onClick={toggleLockUser}
                        disabled={loading}
                      >
                        {user?.locked ? "Unlock Account" : "Lock Account"}
                      </button>
                    </div>

                    <div className="admin-action-card">
                      <div className="admin-action-content">
                        <h3>
                          {user?.verified ? (
                            <>
                              <FaCheckCircle /> Account is Verified
                            </>
                          ) : (
                            <>
                              <FaTimesCircle /> Account is Unverified
                            </>
                          )}
                        </h3>
                        <p>
                          {user?.verified
                            ? "User's email has been verified."
                            : "User has not verified their email."}
                        </p>
                      </div>
                      <button
                        className={`admin-action-btn ${
                          user?.verified ? "unverify-btn" : "verify-btn"
                        }`}
                        onClick={toggleVerifyUser}
                        disabled={loading}
                      >
                        {user?.verified ? "Unverify Account" : "Verify Account"}
                      </button>
                    </div>

                    <div className="admin-action-card">
                      <div className="admin-action-content">
                        <h3>
                          {isUserAdmin() ? (
                            <>
                              <FaUserShield /> Administrator Privileges
                            </>
                          ) : (
                            <>
                              <FaUser /> Regular User
                            </>
                          )}
                        </h3>
                        <p>
                          {isUserAdmin()
                            ? "User currently has system administrator privileges."
                            : "User does not have system administrator privileges."}
                        </p>
                      </div>
                      <button
                        className="admin-action-btn role-btn"
                        onClick={() => setConfirmAction("change-role")}
                        disabled={loading}
                      >
                        {isUserAdmin() ? "Remove Admin" : "Grant Admin"}
                      </button>
                    </div>

                    <div className="admin-action-card">
                      <div className="admin-action-content">
                        <h3>
                          <FaKey /> Reset Password
                        </h3>
                        <p>Send password reset email to user.</p>
                      </div>
                      <button
                        className="admin-action-btn reset-password-btn"
                        onClick={() => setConfirmAction("reset-password")}
                        disabled={loading}
                      >
                        Reset Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;