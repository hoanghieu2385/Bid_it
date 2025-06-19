import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Tooltip } from 'bootstrap';
import Swal from 'sweetalert2';
import { UserContext } from '../../../contexts/UserContext';
import { getAllCategories } from '../../../services/category-api';
import { createAuction, uploadAuctionImages } from '../../../services/auction-api';
import AuctionTimeAndPrice from '../../../components/client/auction/AuctionTimeAndPrice';
import AuctionImageUpload from '../../../components/client/auction/AuctionImageUpload';
import useToastMessage from '../../../hooks/useToastMessage';

const CreateAuctionPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const toast = useToastMessage();

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
    document.title = 'Create Auction | Bid it';
    getAllCategories().then(setCategories);

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new Tooltip(el));
  }, [user, navigate]);

  useEffect(() => {
    if (images.length > 0) {
      setImageError('');
    }
  }, [images]);

  const initialValues = {
    title: '',
    description: '',
    categoryId: '',
    startTime: new Date(Date.now() + 60 * 60000)
      .toLocaleString('sv-SE', { hour12: false })
      .replace(' ', 'T')
      .slice(0, 16),
    endTime: new Date(Date.now() + 130 * 60000)
      .toLocaleString('sv-SE', { hour12: false })
      .replace(' ', 'T')
      .slice(0, 16),
    startingPrice: '',
    incrementAmount: '',
    requiresDeposit: false,
    securityDeposit: ''
  };

  const validationSchema = Yup.object({
    title: Yup.string().max(100).required('Required'),
    description: Yup.string().min(30).required('Required'),
    categoryId: Yup.string().required('Required'),
    startTime: Yup.date().min(new Date(), 'Start must be in the future').required('Required'),
    endTime: Yup.date().min(Yup.ref('startTime'), 'End must be after start').required('Required'),
    startingPrice: Yup.number().min(1, 'Must be greater than 0').required('Required'),
    incrementAmount: Yup.number().min(1, 'Must be greater than 0').required('Required'),
    securityDeposit: Yup.number().when('requiresDeposit', {
      is: true,
      then: Yup.number()
        .required('Required')
        .min(1, 'Must be greater than 0')
        .test('less-than-starting', 'Must be less than starting price', function (value) {
          return value < this.parent.startingPrice;
        })
    })
  });

  const validateImages = () => {
    if (images.length === 0) {
      setImageError('At least one image is required');
      return false;
    }
    if (images.length > 10) {
      setImageError('Maximum of 10 images allowed');
      return false;
    }
    return true;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!validateImages()) {
      setSubmitting(false);
      document.querySelector('.image-upload-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Auction Creation',
      text: 'Do you want to post this auction now?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      setSubmitting(false);
      return;
    }

    try {
      const loadingSwal = Swal.fire({
        title: 'Creating Auction...',
        html: 'Please wait a moment',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const payload = {
        ...values,
        startingPrice: Number(values.startingPrice),
        incrementAmount: Number(values.incrementAmount),
        securityDeposit: Number(values.securityDeposit || 0),
        currentBid: Number(values.startingPrice),
        status: 'UPCOMING',
        bidCount: 0,
        imageUrls: []
      };

      const auction = await createAuction(payload, user.id);

      if (images.length > 0) {
        await uploadAuctionImages(auction.id, images);
      }

      loadingSwal.close();

      await Swal.fire({
        title: 'Success!',
        text: 'Auction has been created successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      navigate('/profile?tab=my-auctions');
    } catch (err) {
      console.error('Error creating auction:', err);

      Swal.close();

      let errorMessage = 'Could not create auction. Please try again.';

      if (err.response?.status === 400) {
        errorMessage = 'Invalid data. Please check the information.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        navigate('/login');
        return;
      } else if (err.response?.status === 413) {
        errorMessage = 'Image file too large. Please select images smaller than 5MB.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      await Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });

      toast.showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="bg-white p-4 rounded-4 shadow border">
            <h3 className="text-center mb-4">Create New Auction</h3>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
              {({ values, setFieldValue, isSubmitting }) => (
                <Form>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">
                        Title <span className="text-danger">*</span>
                      </label>
                      <Field
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="E.g.: Samsung Galaxy S24 Ultra"
                      />
                      <ErrorMessage name="title" component="div" className="text-danger small" />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="description"
                        className="form-control"
                        rows={6}
                        placeholder="Detailed product description (at least 30 characters)..."
                      />
                      <ErrorMessage name="description" component="div" className="text-danger small" />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Category <span className="text-danger">*</span>
                      </label>
                      <Field as="select" name="categoryId" className="form-select">
                        <option value="">-- Select Category --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="categoryId" component="div" className="text-danger small" />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <AuctionTimeAndPrice formik={{ values, setFieldValue }} />

                  <div className="form-check form-switch mt-3">
                    <Field type="checkbox" name="requiresDeposit" className="form-check-input" id="requiresDeposit" />
                    <label htmlFor="requiresDeposit" className="form-check-label">
                      Require Deposit?
                    </label>
                  </div>

                  {values.requiresDeposit && (
                    <div className="mt-2">
                      <label className="form-label">Security Deposit (VND)</label>
                      <Field
                        name="securityDeposit"
                        component={({ field, form }) => {
                          const handleChange = (e) => {
                            const raw = e.target.value.replace(/\./g, '');
                            if (!/^\d*$/.test(raw)) return;
                            form.setFieldValue(field.name, raw);
                          };
                          return (
                            <input
                              {...field}
                              type="text"
                              value={field.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                              onChange={handleChange}
                              className="form-control"
                              placeholder="E.g.: 1,000,000"
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="securityDeposit" component="div" className="text-danger small" />
                    </div>
                  )}

                  <hr className="my-4" />

                  <div className="image-upload-section">
                    <h5 className="mb-3">
                      Product Images <span className="text-danger">*</span>
                    </h5>
                    <AuctionImageUpload images={images} setImages={setImages} previews={previews} setPreviews={setPreviews} />
                    {imageError && (
                      <div className="alert alert-danger mt-2 py-2">
                        <small>{imageError}</small>
                      </div>
                    )}
                    <small className="text-muted">
                      • At least 1 image is required<br />
                      • Up to 10 images, each no larger than 5MB<br />
                      • Supported formats: JPG, JPEG, PNG, WebP
                    </small>
                  </div>

                  <div className="text-center mt-4">
                    <button type="submit" className="btn btn-dark px-5 py-2 rounded-pill" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        'Create Auction'
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAuctionPage;
