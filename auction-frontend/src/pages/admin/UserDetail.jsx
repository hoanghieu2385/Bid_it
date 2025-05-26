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
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log("Fetching user with ID:", userId);

      if (!userId) {
        setError("User ID không tồn tại, không thể tải thông tin người dùng");
        setLoading(false);
        return;
      }

      const userData = await getUserById(userId);
      setUser(userData);
      
      // Cập nhật form dữ liệu để phù hợp với model User của Spring Boot
      setEditedUser({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || ""
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

  // Thay đổi hàm handleEditToggle
  const handleEditToggle = () => {
    console.log("Trước khi thay đổi editMode:", editMode);
    if (editMode) {
      // Hủy chỉnh sửa, reset form về dữ liệu ban đầu
      setEditedUser({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || ""
      });
    }
    setEditMode(!editMode);
    console.log("Sau khi thay đổi editMode:", !editMode);
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
      setFormError(
        err.response?.data || "Không thể cập nhật thông tin người dùng. Vui lòng thử lại."
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
        `Tài khoản đã được ${
          updatedUser.locked ? "khóa" : "mở khóa"
        } thành công!`
      );
    } catch (err) {
      console.error("Error toggling user lock status:", err);
      setFormError(
        `Không thể ${
          user.locked ? "mở khóa" : "khóa"
        } tài khoản. Vui lòng thử lại.`
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
        `Tài khoản đã được ${
          updatedUser.verified ? "xác thực" : "hủy xác thực"
        } thành công!`
      );
    } catch (err) {
      console.error("Error toggling user verification status:", err);
      setFormError(
        `Không thể ${
          user.verified ? "hủy xác thực" : "xác thực"
        } tài khoản. Vui lòng thử lại.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (isAdmin) => {
    try {
      setLoading(true);
      // Chuyển đổi sang định dạng Spring Security roles
      const roles = new Set(user.roles || []);
      
      if (isAdmin) {
        roles.add("ADMIN");
      } else {
        roles.delete("ADMIN");
        // Đảm bảo luôn có ít nhất role USER
        roles.add("USER");
      }
      
      const updatedUser = await updateUserRoles(userId, Array.from(roles));
      setUser(updatedUser);
      showSuccess(
        `Vai trò người dùng đã được cập nhật thành công!`
      );
    } catch (err) {
      console.error("Error updating user roles:", err);
      setFormError("Không thể cập nhật vai trò người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setConfirmAction(null);
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
      navigate("/admin/users", {
        state: { message: "Đã xóa người dùng thành công!" },
      });
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
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("vi-VN", options).format(date);
  };

  const formatMoney = (amount) => {
    if (!amount) return "₫ 0";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₫", "₫ ");
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#10B981"; // Green
    if (score >= 50) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const isUserAdmin = () => {
    return user?.roles?.includes("ADMIN");
  };

  // Hiển thị tên đầy đủ người dùng
  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    }
    return "Không có tên";
  };

  // Hiển thị chữ cái đầu tiên của tên để làm avatar (nếu không có avatar)
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
        title = "Xác nhận xóa người dùng";
        message = `Bạn có chắc muốn xóa tài khoản của người dùng '${user?.email || ""}' không? Hành động này không thể hoàn tác.`;
        confirmText = "Xóa";
        onConfirmAction = handleDeleteUser;
        break;
      case "reset-password":
        title = "Xác nhận đặt lại mật khẩu";
        message = `Gửi email đặt lại mật khẩu cho người dùng '${user?.email || ""}'?`;
        confirmText = "Gửi";
        onConfirmAction = handleResetPassword;
        break;
      case "change-role":
        title = "Xác nhận thay đổi vai trò";
        message = `Bạn có chắc muốn ${
          isUserAdmin() ? "hạ quyền" : "cấp quyền ADMIN"
        } cho người dùng '${user?.email || ""}' không?`;
        confirmText = "Xác nhận";
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
              Hủy
            </button>
            <button
              className="modal-btn confirm-btn"
              onClick={onConfirmAction}
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
                <FaArrowLeft /> Quay lại danh sách
              </button>

              <div className="user-actions">
                {editMode ? (
                  <>
                    <button
                      className="action-btn save-btn"
                      onClick={handleSubmit}
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
                        {user?.verified ? "Đã xác thực" : "Chưa xác thực"}
                      </span>
                      {user?.locked && (
                        <span className="status-badge locked">Đã khóa</span>
                      )}
                      {isUserAdmin() && (
                        <span className="status-badge admin">Admin</span>
                      )}
                    </div>
                    <p className="join-date">
                      Ngày tham gia: {formatDate(user?.createdAt)}
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
                    <h2>Thông tin cá nhân</h2>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstName">Tên</label>
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
                            {user?.firstName || "Không có"}
                          </p>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastName">Họ</label>
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
                            {user?.lastName || "Không có"}
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
                            {user?.email || "Không có"}
                          </p>
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
                            className="edit-input"
                          />
                        ) : (
                          <p className="form-value">
                            {user?.phoneNumber || "Không có"}
                          </p>
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
                            className="edit-input"
                          />
                        ) : (
                          <p className="form-value">
                            {user?.address || "Không có"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>

                {/* User Stats and Activity - Sử dụng dữ liệu từ mô hình User trong Spring Boot */}
                <div className="form-section">
                  <h2>Thống kê sử dụng</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-title">Điểm tín nhiệm</div>
                      <div
                        className="stat-value"
                        style={{ color: getScoreColor(user?.points || 0) }}
                      >
                        {user?.points || 0} / 100
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Số đấu giá đã đăng</div>
                      <div className="stat-value">
                        {user?.totalAuctions || 0}
                      </div>
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
                      <div className="stat-value">
                        {formatMoney(user?.auctionEarnings || 0)}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Tổng tiền đã chi</div>
                      <div className="stat-value">
                        {formatMoney(user?.totalPaid || 0)}
                      </div>
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
                            : "Người dùng có thể đăng nhập và sử dụng hệ thống bình thường."}
                        </p>
                      </div>
                      <button
                        className={`admin-action-btn ${
                          user?.locked ? "unlock-btn" : "lock-btn"
                        }`}
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
                            : "Người dùng chưa xác thực email."}
                        </p>
                      </div>
                      <button
                        className={`admin-action-btn ${
                          user?.verified ? "unverify-btn" : "verify-btn"
                        }`}
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
                            : "Người dùng không có quyền quản trị hệ thống."}
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
                        <p>Gửi email đặt lại mật khẩu cho người dùng.</p>
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