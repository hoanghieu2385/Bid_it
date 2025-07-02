import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Tooltip } from 'bootstrap';
import Swal from 'sweetalert2';

import { UserContext } from '../../../contexts/UserContext';
import { getAllCategories } from '../../../services/category-api';
import { createAuctionWithMedia } from '../../../services/auction-api';

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

	const [showVerificationPopup, setShowVerificationPopup] = useState(false);
	const [showLowScorePopup, setShowLowScorePopup] = useState(false);

	// ✅ Handle timezone correction
	const toLocalISOString = (date) => {
		const tzOffset = date.getTimezoneOffset() * 60000;
		return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
	};

	const now = new Date();
	const start = new Date(now.getTime() + 90 * 60000); //  +1 tiếng 30 phút
	const end = new Date(start.getTime() + 180 * 60000); // +3 tiếng

	// ✅ Formik initial values
	const initialValues = {
		title: '',
		description: '',
		categoryId: '',
		startTime: toLocalISOString(start),
		endTime: toLocalISOString(end),
		startingPrice: '',
		incrementAmount: '',
		requiresDeposit: false,
		securityDeposit: '',
	};

	useEffect(() => {
		if (!user) {
			navigate('/login');
			return;
		}

		if (user.citizenIdStatus !== 'APPROVED') {
			setShowVerificationPopup(true);
		} else if (user.score < 70) {
			setShowLowScorePopup(true);
		}

		document.title = 'Create Auction | Bid it';
		getAllCategories().then(setCategories);

		const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
		tooltipTriggerList.forEach((el) => new Tooltip(el));
	}, [user, navigate]);

	useEffect(() => {
		if (images.length > 0) {
			setImageError('');
		}
	}, [images]);

	// ✅ Form validation
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
				}),
		}),
	});

	// ✅ Validate images
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

	// ✅ Handle Submit
	const handleSubmit = async (values, { setSubmitting }) => {
		if (user.citizenIdStatus !== 'APPROVED') {
			setShowVerificationPopup(true);
			setSubmitting(false);
			return;
		}
		if (user.score < 70) {
			setShowLowScorePopup(true);
			setSubmitting(false);
			return;
		}

		if (!validateImages()) {
			setSubmitting(false);
			document.querySelector('.image-upload-section')?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
			return;
		}

		const result = await Swal.fire({
			title: 'Confirm Auction Creation',
			text: 'Do you want to post this auction now?',
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Yes, create it!',
			cancelButtonText: 'Cancel',
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
				},
			});

			const payload = {
				...values,
				startingPrice: Number(values.startingPrice),
				incrementAmount: Number(values.incrementAmount),
				securityDeposit: Number(values.securityDeposit || 0),
				currentBid: Number(values.startingPrice),
				status: 'UPCOMING',
				bidCount: 0,
				imageUrls: [],
			};

			await createAuctionWithMedia(payload, images, user.id);

			loadingSwal.close();

			await Swal.fire({
				title: 'Success!',
				text: 'Auction has been created successfully!',
				icon: 'success',
				confirmButtonText: 'OK',
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
				confirmButtonText: 'OK',
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
												name="title"
												type="text"
												className="form-control border"
												placeholder="E.g.: iPhone 15 Pro Max"
											/>
											<ErrorMessage name="title" component="div" className="text-danger small"/>
										</div>

										<div className="col-12">
											<label className="form-label">
												Description <span className="text-danger">*</span>
											</label>
											<Field
												as="textarea"
												name="description"
												className="form-control border"
												rows={6}
												placeholder="Detailed product description (at least 30 characters)..."
											/>
											<ErrorMessage name="description" component="div"
														  className="text-danger small"/>
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
											<ErrorMessage name="categoryId" component="div"
														  className="text-danger small"/>
										</div>
									</div>

									<hr className="my-4"/>
									<AuctionTimeAndPrice formik={{values, setFieldValue}}/>
									<small className="text-muted d-block mt-1">
										⚠️ Auctions can only be edited or deleted if the start time is more than 1 hour
										from starting time.
									</small>

									<hr className="my-4"/>

									<div className="image-upload-section">
										<h5 className="mb-3">
											Product Images <span className="text-danger">*</span>
										</h5>
										<AuctionImageUpload
											images={images}
											setImages={setImages}
											previews={previews}
											setPreviews={setPreviews}
										/>
										{imageError && (
											<div className="alert alert-danger mt-2 py-2">
												<small>{imageError}</small>
											</div>
										)}
										<small className="text-muted d-block mt-1">
											• At least 1 image is required
											<br/>
											• Up to 10 images, each no larger than 5MB
											<br/>• Supported formats: JPG, JPEG, PNG, WebP
										</small>
									</div>

									<div className="text-center mt-4">
										<button type="submit" className="btn btn-dark px-5 py-2 rounded-pill"
												disabled={isSubmitting}>
											{isSubmitting ? (
												<>
													<span
														className="spinner-border spinner-border-sm me-2"
														role="status"
														aria-hidden="true"
													></span>
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

			{/* Popup: Not Verified */}
			{showVerificationPopup && (
				<div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Account Not Verified</h5>
							</div>
							<div className="modal-body">
								<p>You must verify your identity (CCCD) before creating an auction.</p>
							</div>
							<div className="modal-footer">
								<button className="btn btn-secondary" onClick={() => navigate('/')}>
									Go to Homepage
								</button>
								<button className="btn btn-primary" onClick={() => navigate('/profile?tab=ekyc')}>
									Go to Verification
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Popup: Low Score */}
			{showLowScorePopup && (
				<div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Insufficient Score</h5>
							</div>
							<div className="modal-body">
								<p>
									Your account score is too low ({user?.score}/100). A minimum score of 70 is required to create
									auctions.
								</p>
							</div>
							<div className="modal-footer">
								<button className="btn btn-secondary" onClick={() => navigate('/')}>
									Go to Homepage
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreateAuctionPage;
