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
  resetUserPassword
} from "../../services/admin-user-api";
import { FaEdit, FaTrash, FaUnlock, FaLock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaArrowLeft, FaUserShield, FaUser, FaKey } from "react-icons/fa";
import "../../assets/styles/admin/UserDetail.css";

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [setConfirmAction] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(userId);
      setUser(userData);
      setEditedUser({
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        fullName: userData.fullName,
        address: userData.address
      });
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit, reset form data
      setEditedUser({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        address: user.address
      });
    }
    setEditMode(!editMode);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(userId, editedUser);
      setUser(updatedUser);
      setEditMode(false);
      showSuccess("Thông tin người dùng đã được cập nhật thành công!");
    } catch (err) {
      console.error("Error updating user:", err);
      setFormError("Không thể cập nhật thông tin người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLockUser = async () => {
    try {
      setLoading(true);
      const updatedUser = await toggleUserLock(userId, !user.locked);
      setUser(updatedUser);
      showSuccess(`Tài khoản đã được ${updatedUser.locked ? 'khóa' : 'mở khóa'} thành công!`);
    } catch (err) {
      console.error("Error toggling user lock status:", err);
      setFormError(`Không thể ${user.locked ? 'mở khóa' : 'khóa'} tài khoản. Vui lòng thử lại.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerifyUser = async () => {
    try {
      setLoading(true);
      const updatedUser = await toggleUserVerification(userId, !user.verified);
      setUser(updatedUser);
      showSuccess(`Tài khoản đã được ${updatedUser.verified ? 'xác thực' : 'hủy xác thực'} thành công!`);
    } catch (err) {
      console.error("Error toggling user verification status:", err);
      setFormError(`Không thể ${user.verified ? 'hủy xác thực' : 'xác thực'} tài khoản. Vui lòng thử lại.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (isAdmin) => {
    try {
      setLoading(true);
      const roles = isAdmin ? ["USER", "ADMIN"] : ["USER"];
      const updatedUser = await updateUserRoles(userId, roles);
      setUser(updatedUser);
      showSuccess(`Vai trò người dùng đã được cập nhật thành ${isAdmin ? 'ADMIN' : 'USER'} thành công!`);
    } catch (err) {
      console.error("Error updating user roles:", err);
      setFormError("Không thể cập nhật vai trò người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await resetUserPassword(userId);
      showSuccess("Đã gửi email đặt lại mật khẩu cho người dùng!");
    } catch (err) {
      console.error("Error resetting password:", err);
      setFormError("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      await deleteUser(userId);
      navigate("/admin/users", { state: { message: "Đã xóa người dùng thành công!" } });
    } catch (err) {
      console.error("Error deleting user:", err);
      setFormError("Không thể xóa người dùng. Vui lòng thử lại.");
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
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  };

  const formatMoney = (amount) => {
    if (!amount) return "₫ 0";
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₫', '₫ ');
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#10B981"; // Green
    if (score >= 50) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const isUserAdmin = () => {
    return user?.roles?.some(role => role === "ADMIN");
  };

  // UI render
  const renderConfirmationModal = () => {
    if (!confirmAction) return null;

    let title, message, confirmText, confirmAction;

    switch (confirmAction) {
      case "delete":
        title = "Xác nhận xóa người dùng";
        message = `Bạn có chắc muốn xóa tài khoản của người dùng '${user?.username}' không? Hành động này không thể hoàn tác.`;
        confirmText = "Xóa";
        confirmAction = handleDeleteUser;
        break;
      case "reset-password":
        title = "Xác nhận đặt lại mật khẩu";
        message = `Gửi email đặt lại mật khẩu cho người dùng '${user?.username}'?`;
        confirmText = "Gửi";
        confirmAction = handleResetPassword;
        break;
      case "change-role":
        title = `Xác nhận thay đổi vai trò`;
        message = `Bạn có chắc muốn ${isUserAdmin() ? 'hạ quyền' : 'cấp quyền ADMIN'} cho người dùng '${user?.username}' không?`;
        confirmText = "Xác nhận";
        confirmAction = () => handleRoleChange(!isUserAdmin());
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
              Hủy
            </button>
            <button 
              className="modal-btn confirm-btn" 
              onClick={confirmAction}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xử lý..." : confirmText}
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
        <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
          <div id="content">
            <Topbar />
            <div className="container-fluid">
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải thông tin người dùng...</p>
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
        <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
          <div id="content">
            <Topbar />
            <div className="container-fluid">
              <div className="error-container">
                <FaExclamationTriangle size={40} color="#f8bb86" />
                <h2>Đã xảy ra lỗi</h2>
                <p>{error}</p>
                <button className="btn-retry" onClick={fetchUserData}>
                  Thử lại
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
      <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
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
                <FaArrowLeft /> Quay lại danh sách
              </button>

              <div className="user-actions">
                {editMode ? (
                  <>
                    <button 
                      className="action-btn save-btn"
                      form="user-form"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button 
                      className="action-btn cancel-btn"
                      onClick={handleEditToggle}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="action-btn edit-btn"
                      onClick={handleEditToggle}
                    >
                      <FaEdit /> Chỉnh sửa
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => setConfirmAction("delete")}
                    >
                      <FaTrash /> Xóa
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
                      <img src={user.avatar} alt={user.username} className="user-avatar-lg" />
                    ) : (
                      <div className="user-avatar-placeholder-lg">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="user-title-info">
                    <h1 className="user-username">{user?.username || "Không có tên người dùng"}</h1>
                    <div className="user-badges">
                      <span className={`status-badge ${user?.verified ? 'verified' : 'unverified'}`}>
                        {user?.verified ? "Đã xác thực" : "Chưa xác thực"}
                      </span>
                      {user?.locked && (
                        <span className="status-badge locked">
                          Đã khóa
                        </span>
                      )}
                      {isUserAdmin() && (
                        <span className="status-badge admin">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="join-date">
                      Ngày tham gia: {formatDate(user?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* User Form */}
                <form id="user-form" className="user-form" onSubmit={handleSubmit}>
                  <div className="form-section">
                    <h2>Thông tin cá nhân</h2>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="username">Tên người dùng</label>
                        {editMode ? (
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={editedUser.username || ""}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                        ) : (
                          <p className="form-value">{user?.username || "Không có"}</p>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="fullName">Họ và tên</label>
                        {editMode ? (
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={editedUser.fullName || ""}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                        ) : (
                          <p className="form-value">{user?.fullName || "Không có"}</p>
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
                          />
                        ) : (
                          <p className="form-value">{user?.email || "Không có"}</p>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="phoneNumber">Số điện thoại</label>
                        {editMode ? (
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={editedUser.phoneNumber || ""}
                            onChange={handleInputChange}
                            disabled={loading}
                          />
                        ) : (
                          <p className="form-value">{user?.phoneNumber || "Không có"}</p>
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor="address">Địa chỉ</label>
                        {editMode ? (
                          <textarea
                            id="address"
                            name="address"
                            value={editedUser.address || ""}
                            onChange={handleInputChange}
                            rows="3"
                            disabled={loading}
                          />
                        ) : (
                          <p className="form-value">{user?.address || "Không có"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>

                {/* User Stats and Activity */}
                <div className="form-section">
                  <h2>Thống kê sử dụng</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-title">Điểm tín nhiệm</div>
                      <div className="stat-value" style={{ color: getScoreColor(user?.points || 0) }}>
                        {user?.points || 0} / 100
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Số đấu giá đã đăng</div>
                      <div className="stat-value">{user?.totalAuctions || 0}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Lượt đấu giá</div>
                      <div className="stat-value">{user?.totalBids || 0}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Số lần thắng</div>
                      <div className="stat-value">{user?.bidsWon || 0}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Doanh thu từ đấu giá</div>
                      <div className="stat-value">{formatMoney(user?.auctionEarnings || 0)}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Tổng tiền đã chi</div>
                      <div className="stat-value">{formatMoney(user?.totalPaid || 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="form-section">
                  <h2>Hành động quản trị</h2>
                  <div className="admin-actions-grid">
                    <div className="admin-action-card">
                      <div className="admin-action-content">
                        <h3>
                          {user?.locked ? (
                            <>
                              <FaLock /> Tài khoản đã bị khóa
                            </>
                          ) : (
                            <>
                              <FaUnlock /> Tài khoản đang hoạt động
                            </>
                          )}
                        </h3>
                        <p>
                          {user?.locked 
                            ? "Người dùng hiện không thể đăng nhập hoặc sử dụng hệ thống." 
                            : "Người dùng có thể đăng nhập và sử dụng hệ thống bình thường."
                          }
                        </p>
                      </div>
                      <button 
                        className={`admin-action-btn ${user?.locked ? 'unlock-btn' : 'lock-btn'}`}
                        onClick={toggleLockUser}
                        disabled={loading}
                      >
                        {user?.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                      </button>
                    </div>

                    <div className="admin-action-card">
                      <div className="admin-action-content">
                        <h3>
                          {user?.verified ? (
                            <>
                              <FaCheckCircle /> Tài khoản đã xác thực
                            </>
                          ) : (
                            <>
                              <FaTimesCircle /> Tài khoản chưa xác thực
                            </>
                          )}
                        </h3>
                        <p>
                          {user?.verified 
                            ? "Email của người dùng đã được xác thực." 
                            : "Người dùng chưa xác thực email."
                          }
                        </p>
                      </div>
                      <button 
                        className={`admin-action-btn ${user?.verified ? 'unverify-btn' : 'verify-btn'}`}
                        onClick={toggleVerifyUser}
                        disabled={loading}
                      >
                        {user?.verified ? "Hủy xác thực" : "Xác thực tài khoản"}
                      </button>
                    </div>

                    <div className="admin-action-card">
                      <div className="admin-action-content">
                        <h3>
                          {isUserAdmin() ? (
                            <>
                              <FaUserShield /> Quyền quản trị viên
                            </>
                          ) : (
                            <>
                              <FaUser /> Người dùng thường
                            </>
                          )}
                        </h3>
                        <p>
                          {isUserAdmin() 
                            ? "Người dùng hiện có quyền quản trị hệ thống." 
                            : "Người dùng không có quyền quản trị hệ thống."
                          }
                        </p>
                      </div>
                      <button 
                        className="admin-action-btn role-btn"
                        onClick={() => setConfirmAction("change-role")}
                        disabled={loading}
                      >
                        {isUserAdmin() ? "Hạ quyền" : "Cấp quyền Admin"}
                      </button>
                    </div>

                    <div className="admin-action-card">
                      <div className="admin-action-content">
                        <h3>
                          <FaKey /> Đặt lại mật khẩu
                        </h3>
                        <p>
                          Gửi email đặt lại mật khẩu cho người dùng.
                        </p>
                      </div>
                      <button 
                        className="admin-action-btn reset-password-btn"
                        onClick={() => setConfirmAction("reset-password")}
                        disabled={loading}
                      >
                        Đặt lại mật khẩu
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