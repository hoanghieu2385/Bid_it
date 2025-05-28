import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import "../../assets/styles/admin/Categories.css";
import { FaEdit, FaTrash, FaSearch, FaFilter, FaPlus, FaHistory } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  getAllDeletedCategories,
} from "../../services/category-api";

const BOOTSTRAP_ICONS = [
  "bi-bag",
  "bi-alarm",
  "bi-award",
  "bi-basket",
  "bi-book",
  "bi-camera",
  "bi-cart",
  "bi-cash",
  "bi-chat",
  "bi-clipboard",
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    commissionRate: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDeletedList, setShowDeletedList] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
    commissionRate: 3,
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
      setError(null);
    } catch {
      setError("Unable to load categories list. Please try again later.");
      toast.error("Error loading categories list");
    } finally {
      setLoading(false);
    }
  };

  // Fetch deleted categories from API
  const fetchDeletedCategories = async () => {
    try {
      setLoadingDeleted(true);
      const data = await getAllDeletedCategories();
      setDeletedCategories(data);
    } catch {
      toast.error("Error loading deleted categories list");
    } finally {
      setLoadingDeleted(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showDeletedList || filters.status === "deleted") {
      fetchDeletedCategories();
    }
  }, [showDeletedList, filters.status]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category? The category will be permanently deleted after 7 days.")) {
      try {
        await deleteCategory(id);
        // After successful deletion, refresh the list from server
        fetchCategories();
        // If viewing deleted list, also refresh it
        if (showDeletedList || filters.status === "deleted") {
          fetchDeletedCategories();
        }
        toast.success("Category deleted successfully");
      } catch {
        toast.error("Unable to delete category. Please try again later.");
      }
    }
  };

  const handleAddCategory = async () => {
    try {
      // Validate form
      if (!formData.name.trim()) {
        toast.error("Please enter category name");
        return;
      }

      // Create data object to send
      const categoryData = {
        name: formData.name,
        icon: formData.icon,
        description: formData.description,
        commissionRate: formData.commissionRate,
      };

      // Call API to create category
      await createCategory(categoryData);

      // Refresh list
      fetchCategories();

      setShowAddModal(false);

      // Reset form
      setFormData({
        name: "",
        icon: "",
        description: "",
        commissionRate: 3,
      });

      toast.success("New category added successfully");
    } catch {
      toast.error("Unable to add category. Please try again later.");
    }
  };

  const handleEditCategory = async () => {
    try {
      // Validate form
      if (!formData.name.trim()) {
        toast.error("Please enter category name");
        return;
      }

      // Create data object to send
      const categoryData = {
        name: formData.name,
        icon: formData.icon,
        description: formData.description,
        commissionRate: formData.commissionRate,
      };

      // Call API to update category
      await updateCategory(currentCategory.id, categoryData);

      // Refresh list
      fetchCategories();

      setShowEditModal(false);
      toast.success("Category updated successfully");
    } catch {
      toast.error("Unable to update category. Please try again later.");
    }
  };

  const handleEditClick = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || "",
      description: category.description || "",
      commissionRate: category.commissionRate || 3,
    });
    setShowEditModal(true);
  };

  const handleRestore = async (id) => {
    try {
      // Call API to restore deleted category
      await restoreCategory(id);

      // Refresh lists
      fetchCategories();
      fetchDeletedCategories();

      toast.success("Category restored successfully");
    } catch {
      toast.error("Unable to restore category. Please try again later.");
    }
  };

  // Toggle deleted list display
  const toggleDeletedList = () => {
    setShowDeletedList(!showDeletedList);
    if (!showDeletedList) {
      fetchDeletedCategories();
    }
  };

  // Filter logic
  const applyFilters = (categories) => {
    let filtered = [...categories];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "active") {
        filtered = filtered.filter((cat) => !cat.deleted);
      } else if (filters.status === "deleted") {
        filtered = filtered.filter((cat) => cat.deleted);
      }
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let pastDate;

      switch (filters.dateRange) {
        case "today":
          // Only get categories created from beginning of today
          pastDate = today;
          break;
        case "week":
          // Get categories created in the last 7 days
          pastDate = new Date(today);
          pastDate.setDate(today.getDate() - 7);
          break;
        case "month":
          // Get categories created in the last 30 days
          pastDate = new Date(today);
          pastDate.setMonth(today.getMonth() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter((cat) => {
        if (!cat.createdAt) return false;
        const catDate = new Date(cat.createdAt);

        // If "today", only get categories with same date as current date
        if (filters.dateRange === "today") {
          return (
            catDate.getFullYear() === today.getFullYear() &&
            catDate.getMonth() === today.getMonth() &&
            catDate.getDate() === today.getDate()
          );
        }

        // Otherwise get categories with creation date >= pastDate
        return catDate >= pastDate;
      });
    }

    // Commission rate filter
    if (filters.commissionRate !== "all") {
      const [min, max] = filters.commissionRate.split("-").map(Number);
      filtered = filtered.filter(
        (cat) => {
          const rate = typeof cat.commissionRate === 'number' ? cat.commissionRate : 
                     (typeof cat.commissionRate === 'string' ? parseFloat(cat.commissionRate) : 0);
          return rate >= min && rate <= max;
        }
      );
    }

    return filtered;
  };

  // Get display list based on filters and display state
  const getDisplayItems = () => {
    if (showDeletedList) {
      return applyFilters(deletedCategories);
    }
    return applyFilters(categories);
  };

  const filteredCategories = getDisplayItems();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}.${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${date.getFullYear()} - ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // Calculate remaining days before permanent deletion
  const calculateRemainingDays = (category) => {
    if (!category.deleted) return null;
    return category.daysUntilPermanentDeletion;
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="d-flex flex-column flex-grow-1">
        <Topbar />

        <div className="container-fluid px-4 py-4 bg-light min-vh-100">
          <div className="bg-white rounded shadow-sm mt-3 p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-1 fw-bold">
                  {showDeletedList ? "Deleted Categories" : "All Categories"}
                </h5>
                <p className="text-muted mb-0">
                  Total {filteredCategories.length} categories
                </p>
              </div>
              <div>
                <button
                  className={`btn btn-${showDeletedList ? "outline-secondary" : "outline-danger"} me-2`}
                  onClick={toggleDeletedList}
                >
                  <FaHistory className="me-1" /> 
                  {showDeletedList ? "View Active Categories" : "View Deleted Categories"}
                </button>
                {!showDeletedList && (
                  <button
                    className="btn btn-primary d-inline-flex align-items-center"
                    onClick={() => setShowAddModal(true)}
                  >
                    <FaPlus className="me-1" /> Add New Category
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filter */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search categories..."
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
                  <FaFilter className="me-1" /> Filters
                </button>
              </div>
            </div>

            {/* Filter options */}
            {showFilters && (
              <div className="row mb-4 bg-light p-3 rounded">
                <div className="col-md-4 mb-2">
                  <label className="form-label">Created Date</label>
                  <select
                    className="form-select"
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters({ ...filters, dateRange: e.target.value })
                    }
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                <div className="col-md-4 mb-2">
                  <label className="form-label">Commission Rate</label>
                  <select
                    className="form-select"
                    value={filters.commissionRate}
                    onChange={(e) =>
                      setFilters({ ...filters, commissionRate: e.target.value })
                    }
                  >
                    <option value="all">All</option>
                    <option value="0-2">0% - 2%</option>
                    <option value="2-3">2% - 3%</option>
                    <option value="3-5">3% - 5%</option>
                    <option value="5-100">Above 5%</option>
                  </select>
                </div>
              </div>
            )}

            {/* Loading state */}
            {(loading || (showDeletedList && loadingDeleted)) && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading categories...</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Categories Table */}
            {!loading && !error && !(showDeletedList && loadingDeleted) && (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-3">Category</th>
                      <th>Description</th>
                      <th>Commission Rate</th>
                      <th>Created Date</th>
                      <th>Updated</th>
                      <th>Status</th>
                      <th className="text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((cat) => (
                        <tr
                          key={cat.id}
                          className={cat.deleted ? "table-secondary" : ""}
                        >
                          <td className="ps-3">
                            <div className="d-flex align-items-center">
                              <div className="category-icon me-3">
                                <i className={`bi ${cat.icon} fs-4 text-primary me-2`}></i>
                              </div>
                              <div>
                                <div className="fw-medium">{cat.name}</div>
                                <small className="text-muted">
                                  ID: #{cat.id}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted">
                            {cat.description || "N/A"}
                          </td>
                          <td>{typeof cat.commissionRate === 'number' ? cat.commissionRate.toFixed(0) : cat.commissionRate}%</td>
                          <td>
                            <div>{formatDate(cat.createdAt)}</div>
                          </td>
                          <td className="text-muted">
                            {formatDate(cat.updatedAt)}
                          </td>
                          <td>
                            {cat.deleted ? (
                              <div>
                                <span className="badge bg-danger mb-1">Deleted</span>
                                <div className="small text-danger">
                                  Permanent deletion in: {calculateRemainingDays(cat)} days
                                </div>
                              </div>
                            ) : (
                              <span className="badge bg-success">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="text-end pe-3">
                            {!cat.deleted ? (
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
                                Restore
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No categories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <nav className="mt-4 d-flex justify-content-center">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
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
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
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
            <Modal.Title>Add New Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Category Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Choose Icon</Form.Label>
                <Form.Select
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                >
                  {BOOTSTRAP_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Form.Select>
                <div className="mt-2">
                  <i className={`bi ${formData.icon} fs-4`}></i>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Brief description of the category"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Commission Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.commissionRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionRate: Number(e.target.value),
                    })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCategory}>
              Add Category
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Category Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Category Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Icon Path</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="/icons/example.svg"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Brief description of the category"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Commission Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.commissionRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionRate: Number(e.target.value),
                    })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditCategory}>
              Save Changes
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