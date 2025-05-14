import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../assets/styles/admin/Categories-list.css";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

// Mock data for demo purposes
const mockCategories = [
  {
    id: 1,
    name: "Cars/Trucks",
    icon: "/icons/car.svg",
    description: "Various cars and trucks",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 2,
    name: "Motorcycles",
    icon: "/icons/motorcycle.svg",
    description: "All kinds of motorcycles",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 3,
    name: "Jewelry",
    icon: "/icons/jewelry.svg",
    description: "Luxury jewelry items",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 4,
    name: "Watches",
    icon: "/icons/watch.svg",
    description: "Luxury and casual watches",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 5,
    name: "Electronics",
    icon: "/icons/electronics.svg",
    description: "Modern electronics",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 6,
    name: "Clothes",
    icon: "/icons/clothes.svg",
    description: "Fashion items",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: "2024-07-23T10:15:00",
    deletedAt: null,
    status: "active"
  },
  {
    id: 7,
    name: "Sports",
    icon: "/icons/sports.svg",
    description: "Sports equipment",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 8,
    name: "Furniture",
    icon: "/icons/furniture.svg",
    description: "Home furniture",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: "2024-07-25T08:30:00",
    status: "deleted"
  },
  {
    id: 9,
    name: "Arts",
    icon: "/icons/arts.svg",
    description: "Artwork and collectibles",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 10,
    name: "Real Estate",
    icon: "/icons/realestate.svg",
    description: "Properties and land",
    commissionRate: 0.03,
    createdAt: "2024-07-22T01:42:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 11,
    name: "Books",
    icon: "/icons/books.svg",
    description: "Books and literature",
    commissionRate: 0.02,
    createdAt: "2024-07-24T14:20:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  },
  {
    id: 12,
    name: "Toys",
    icon: "/icons/toys.svg",
    description: "Children's toys and games",
    commissionRate: 0.025,
    createdAt: "2024-07-25T09:45:00",
    updatedAt: null,
    deletedAt: null,
    status: "active"
  }
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    commissionRate: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
    commissionRate: 0.03
  });

  useEffect(() => {
    // Load mock data
    setCategories(mockCategories);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      // Soft delete - just mark as deleted
      setCategories(prev => prev.map(cat => 
        cat.id === id 
          ? { ...cat, deletedAt: new Date().toISOString(), status: "deleted" } 
          : cat
      ));
      toast.success("Đã xóa danh mục thành công");
    }
  };

  const handleAddCategory = () => {
    const newId = Math.max(...categories.map(cat => cat.id)) + 1;
    const newCategory = {
      ...formData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
      status: "active"
    };
    
    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    setFormData({
      name: "",
      icon: "",
      description: "",
      commissionRate: 0.03
    });
    toast.success("Đã thêm danh mục mới thành công");
  };

  const handleEditCategory = () => {
    setCategories(prev => prev.map(cat => 
      cat.id === currentCategory.id 
        ? { 
            ...cat, 
            ...formData, 
            updatedAt: new Date().toISOString() 
          } 
        : cat
    ));
    setShowEditModal(false);
    toast.success("Đã cập nhật danh mục thành công");
  };

  const handleEditClick = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      description: category.description,
      commissionRate: category.commissionRate
    });
    setShowEditModal(true);
  };

  const handleRestore = (id) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id 
        ? { ...cat, deletedAt: null, status: "active" } 
        : cat
    ));
    toast.success("Đã khôi phục danh mục thành công");
  };

  // Filter logic
  const applyFilters = (categories) => {
    let filtered = [...categories];
    
    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(cat => cat.status === filters.status);
    }
    
    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const pastDate = new Date();
      
      switch(filters.dateRange) {
        case "today":
          pastDate.setDate(now.getDate() - 1);
          break;
        case "week":
          pastDate.setDate(now.getDate() - 7);
          break;
        case "month":
          pastDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(cat => 
        new Date(cat.createdAt) >= pastDate
      );
    }
    
    // Commission rate filter
    if (filters.commissionRate !== "all") {
      const [min, max] = filters.commissionRate.split("-").map(Number);
      filtered = filtered.filter(cat => 
        cat.commissionRate >= min/100 && cat.commissionRate <= max/100
      );
    }
    
    return filtered;
  };
  
  const filteredCategories = applyFilters(categories);
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="d-flex flex-column flex-grow-1">
        <Topbar />

        <div className="container-fluid px-4 py-4 bg-light min-vh-100">
          {/* Breadcrumb */}
          <div className="d-flex">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">Categories</li>
                <li className="breadcrumb-item active">List</li>
              </ol>
            </nav>
          </div>

          <div className="bg-white rounded shadow-sm mt-3 p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-1 fw-bold">All Categories</h5>
                <p className="text-muted mb-0">Tổng cộng {filteredCategories.length} danh mục</p>
              </div>
              <button 
                className="btn btn-primary d-flex align-items-center"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="me-1" /> Thêm mới danh mục
              </button>
            </div>

            {/* Search and Filter */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Tìm kiếm danh mục..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="button">
                    <FaSearch />
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter className="me-1" /> Bộ lọc
                </button>
              </div>
            </div>

            {/* Filter options */}
            {showFilters && (
              <div className="row mb-4 bg-light p-3 rounded">
                <div className="col-md-4 mb-2">
                  <label className="form-label">Trạng thái</label>
                  <select 
                    className="form-select" 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="deleted">Đã xóa</option>
                  </select>
                </div>
                <div className="col-md-4 mb-2">
                  <label className="form-label">Ngày tạo</label>
                  <select 
                    className="form-select"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="today">Hôm nay</option>
                    <option value="week">Tuần này</option>
                    <option value="month">Tháng này</option>
                  </select>
                </div>
                <div className="col-md-4 mb-2">
                  <label className="form-label">Tỷ lệ hoa hồng</label>
                  <select 
                    className="form-select"
                    value={filters.commissionRate}
                    onChange={(e) => setFilters({...filters, commissionRate: e.target.value})}
                  >
                    <option value="all">Tất cả</option>
                    <option value="0-2">0% - 2%</option>
                    <option value="2-3">2% - 3%</option>
                    <option value="3-5">3% - 5%</option>
                    <option value="5-100">Trên 5%</option>
                  </select>
                </div>
              </div>
            )}

            {/* Categories Table */}
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-3">Danh mục</th>
                    <th>Mô tả</th>
                    <th>Tỷ lệ hoa hồng</th>
                    <th>Ngày tạo</th>
                    <th>Cập nhật</th>
                    <th>Trạng thái</th>
                    <th className="text-end pe-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map(cat => (
                      <tr key={cat.id} className={cat.status === "deleted" ? "table-secondary" : ""}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center">
                            <div className="category-icon me-3">
                              <img
                                src={cat.icon}
                                alt={cat.name}
                                width={32}
                                height={32}
                              />
                            </div>
                            <div>
                              <div className="fw-medium">{cat.name}</div>
                              <small className="text-muted">ID: #{cat.id}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-muted">{cat.description || 'N/A'}</td>
                        <td>{(cat.commissionRate * 100).toFixed(0)}%</td>
                        <td>
                          <div>{formatDate(cat.createdAt)}</div>
                        </td>
                        <td className="text-muted">
                          {formatDate(cat.updatedAt)}
                        </td>
                        <td>
                          {cat.status === "active" ? (
                            <span className="badge bg-success">Đang hoạt động</span>
                          ) : (
                            <span className="badge bg-secondary">Đã xóa</span>
                          )}
                        </td>
                        <td className="text-end pe-3">
                          {cat.status === "active" ? (
                            <>
                              <button 
                                className="btn btn-sm btn-link text-secondary p-0 me-3"
                                onClick={() => handleEditClick(cat)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-sm btn-link text-secondary p-0"
                                onClick={() => handleDelete(cat.id)}
                              >
                                <FaTrash />
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleRestore(cat.id)}
                            >
                              Khôi phục
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        Không tìm thấy danh mục nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <li 
                      key={index} 
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link" 
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>

        {/* Add Category Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Thêm danh mục mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tên danh mục</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Nhập tên danh mục"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Đường dẫn biểu tượng</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="/icons/example.svg"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  placeholder="Mô tả ngắn về danh mục"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tỷ lệ hoa hồng (%)</Form.Label>
                <Form.Control 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.5"
                  value={formData.commissionRate * 100}
                  onChange={(e) => setFormData({...formData, commissionRate: Number(e.target.value) / 100})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" onClick={handleAddCategory}>
              Thêm danh mục
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Category Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh sửa danh mục</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tên danh mục</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Nhập tên danh mục"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Đường dẫn biểu tượng</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="/icons/example.svg"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  placeholder="Mô tả ngắn về danh mục"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tỷ lệ hoa hồng (%)</Form.Label>
                <Form.Control 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.5"
                  value={formData.commissionRate * 100}
                  onChange={(e) => setFormData({...formData, commissionRate: Number(e.target.value) / 100})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" onClick={handleEditCategory}>
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast Notifications */}
        <ToastContainer position="bottom-right" />
      </div>
    </div>
  );
};

export default Categories;