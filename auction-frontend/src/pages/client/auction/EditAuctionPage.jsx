import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { UserContext } from '../../../contexts/UserContext';
import { getAllCategories } from '../../../services/category-api';
import {
    getAuctionDetailById as getAuctionById,
    updateAuction,
    uploadAuctionImages,
    getMediaByAuction,
    deleteMedia,
    setThumbnail
} from '../../../services/auction-api';
import AuctionTimeAndPrice from '../../../components/client/auction/AuctionTimeAndPrice';
import AuctionImageUpload from '../../../components/client/auction/AuctionImageUpload';
import useToastMessage from '../../../hooks/useToastMessage';


const EditAuctionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const toast = useToastMessage();

    const [auction, setAuction] = useState(null);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [existingMedia, setExistingMedia] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        document.title = 'Edit Auction | Bid it';

        const fetchData = async () => {
            try {
                const [auctionData, categoryData] = await Promise.all([
                    getAuctionById(id),
                    getAllCategories()
                ]);
                setAuction(auctionData);
                setCategories(categoryData);
            } catch (err) {
                console.error('Failed to load auction:', err);
                toast.showError('Failed to load auction');
                navigate('/profile?tab=my-auctions');
            }
        };

        fetchData();
    }, [id, user, navigate, toast]);

    useEffect(() => {
        if (auction?.id) {
            getMediaByAuction(auction.id)
                .then(setExistingMedia)
                .catch(() => toast.showError('Failed to load existing images'));
        }
    }, [auction?.id, toast]);

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

    const handleSubmit = async (values, { setSubmitting }) => {
        const result = await Swal.fire({
            title: 'Confirm Update',
            text: 'Do you want to update this auction?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            setSubmitting(false);
            return;
        }

        try {
            Swal.fire({
                title: 'Updating...',
                html: 'Please wait a moment',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });

            const payload = {
                ...values,
                startingPrice: Number(values.startingPrice),
                incrementAmount: Number(values.incrementAmount),
                securityDeposit: Number(values.securityDeposit || 0),
                currentBid: Number(values.startingPrice),
                status: auction.status,
                bidCount: auction.bidCount
            };

            await updateAuction(id, payload, user.id);

            if (images.length > 0) {
                await uploadAuctionImages(id, images);
            }

            Swal.close();

            await Swal.fire({
                title: 'Success!',
                text: 'Auction has been updated successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            navigate('/profile?tab=my-auctions');
        } catch (err) {
            console.error('Update error:', err);
            Swal.close();
            toast.showError('Failed to update auction. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteImage = async (mediaId) => {
        try {
            await deleteMedia(mediaId);
            setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
            toast.showSuccess('Image deleted');
        } catch {
            toast.showError('Failed to delete image');
        }
    };

    const handleSetThumbnail = async (mediaId) => {
        try {
            await setThumbnail(mediaId);
            const updated = existingMedia.map(m => ({
                ...m,
                isThumbnail: m.id === mediaId
            }));
            setExistingMedia(updated);
            toast.showSuccess('Thumbnail updated');
        } catch {
            toast.showError('Failed to set thumbnail');
        }
    };

    if (!auction) return <div>Loading auction...</div>;

    const initialValues = {
        title: auction.title || '',
        description: auction.description || '',
        categoryId: auction.categoryId?.toString() || '',
        startTime: new Date(auction.startTime).toISOString().slice(0, 16),
        endTime: new Date(auction.endTime).toISOString().slice(0, 16),
        startingPrice: auction.startingPrice || '',
        incrementAmount: auction.incrementAmount || '',
        requiresDeposit: auction.requiresDeposit || false,
        securityDeposit: auction.securityDeposit || ''
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="bg-white p-4 rounded-4 shadow border">
                        <h3 className="text-center mb-4">Edit Auction</h3>

                        <Formik
                            enableReinitialize
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ values, setFieldValue, isSubmitting }) => (
                                <Form>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">Title <span className="text-danger">*</span></label>
                                            <Field type="text" name="title" className="form-control" />
                                            <ErrorMessage name="title" component="div" className="text-danger small" />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">Description <span className="text-danger">*</span></label>
                                            <Field as="textarea" name="description" className="form-control" rows={6} />
                                            <ErrorMessage name="description" component="div" className="text-danger small" />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">Category</label>
                                            <Field as="select" name="categoryId" className="form-select">
                                                <option value="">-- Select Category --</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="categoryId" component="div" className="text-danger small" />
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    <AuctionTimeAndPrice formik={{ values, setFieldValue }} />

                                    <div className="form-check form-switch mt-3">
                                        <Field type="checkbox" name="requiresDeposit" className="form-check-input" id="requiresDeposit" />
                                        <label htmlFor="requiresDeposit" className="form-check-label">Require Deposit?</label>
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

                                    <div className="existing-images mb-4">
                                        <h5 className="mb-3">Existing Images</h5>
                                        <div className="row g-3">
                                            {existingMedia.map((media) => (
                                                <div className="col-4 col-md-3" key={media.id}>
                                                    <div className="position-relative border rounded">
                                                        <img
                                                            src={media.url}
                                                            alt="media"
                                                            className="img-fluid rounded"
                                                            style={{ objectFit: 'cover', height: '120px', width: '100%' }}
                                                        />
                                                        {media.isThumbnail && (
                                                            <span className="badge bg-primary position-absolute top-0 start-0 m-1">Thumbnail</span>
                                                        )}
                                                        <div className="d-flex justify-content-between mt-1 px-1">
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                type="button"
                                                                onClick={() => handleDeleteImage(media.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                            {!media.isThumbnail && (
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    type="button"
                                                                    onClick={() => handleSetThumbnail(media.id)}
                                                                >
                                                                    Set Thumbnail
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="image-upload-section">
                                        <h5 className="mb-3">Upload Additional Images</h5>
                                        <AuctionImageUpload
                                            images={images}
                                            setImages={setImages}
                                            previews={previews}
                                            setPreviews={setPreviews}
                                        />
                                        <small className="text-muted">
                                            • Optional: Upload new images to add to the auction<br />
                                            • Max 10 images total, max 5MB each<br />
                                            • JPG, PNG, WebP
                                        </small>
                                    </div>

                                    <div className="text-center mt-4">
                                        <button type="submit" className="btn btn-dark px-5 py-2 rounded-pill" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Update Auction'
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

export default EditAuctionPage;
