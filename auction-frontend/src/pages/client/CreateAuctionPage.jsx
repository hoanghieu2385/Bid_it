// src/pages/client/CreateAuctionPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Tooltip } from 'bootstrap';
import { UserContext } from '../../contexts/UserContext';
import { getAllCategories } from '../../services/category-api';
import { createAuction, uploadAuctionImages } from '../../services/auction-api';

const formatNumber = (value) => {
	if (!value) return '';
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const unformatNumber = (value) => {
	return value.replace(/\./g, '');
};

const CustomNumberInput = ({ field, form, ...props }) => {
	const handleChange = (e) => {
		const raw = unformatNumber(e.target.value);
		if (!/^\d*$/.test(raw)) return;
		form.setFieldValue(field.name, raw);
	};

	return (
		<input {...props} type="text" value={formatNumber(field.value)} onChange={handleChange} className="form-control" />
	);
};

const CreateAuctionPage = () => {
	const navigate = useNavigate();
	const { user } = useContext(UserContext);

	const [categories, setCategories] = useState([]);
	const [images, setImages] = useState([]);
	const [previews, setPreviews] = useState([]);
	const [step, setStep] = useState('form'); // 'form' | 'review'

	useEffect(() => {
		if (!user) navigate('/login');
		document.title = 'Create Auction | Bid it';
		getAllCategories().then(setCategories);

		// Enable Bootstrap tooltips
		const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
		tooltipTriggerList.forEach((el) => new Tooltip(el));
	}, [user, navigate]);

	const initialValues = {
		title: '',
		description: '',
		categoryId: '',
		startTime: new Date(Date.now() + 60 * 60000)
			.toLocaleString('sv-SE', { hour12: false })
			.replace(' ', 'T')
			.slice(0, 16),
		endTime: new Date(Date.now() + 120 * 60000)
			.toLocaleString('sv-SE', { hour12: false })
			.replace(' ', 'T')
			.slice(0, 16),
		startingPrice: '',
		incrementAmount: '',
		requiresDeposit: false,
		securityDeposit: '',
	};

	const validationSchema = Yup.object({
		title: Yup.string().max(100).required('Required'),
		description: Yup.string().min(30).required('Required'),
		categoryId: Yup.string().required('Required'),
		startTime: Yup.date().min(new Date(), 'Start must be in future').required(),
		endTime: Yup.date().min(Yup.ref('startTime'), 'End must be after start').required('Required'),
		startingPrice: Yup.number().min(1, 'Must > 0').required('Required'),
		incrementAmount: Yup.number().min(1, 'Must > 0').required('Required'),
		securityDeposit: Yup.number().when('requiresDeposit', {
			is: true,
			then: Yup.number()
				.required('Required')
				.min(1, 'Must > 0')
				.test('less-than-starting', 'Must be less than starting price', function (value) {
					return value < this.parent.startingPrice;
				}),
		}),
	});

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		setImages(files);
		setPreviews(files.map((file) => URL.createObjectURL(file)));
	};

	const handleRemoveImage = (index) => {
		const newImages = [...images];
		const newPreviews = [...previews];
		newImages.splice(index, 1);
		URL.revokeObjectURL(newPreviews[index]);
		newPreviews.splice(index, 1);
		setImages(newImages);
		setPreviews(newPreviews);
	};

	const handleReview = () => setStep('review');
	const handleBack = () => setStep('form');

	const handleSubmit = async (values, { setSubmitting }) => {
		try {
			const imageUrls = await uploadAuctionImages(images);
			const payload = {
				...values,
				startingPrice: Number(values.startingPrice),
				incrementAmount: Number(values.incrementAmount),
				securityDeposit: Number(values.securityDeposit || 0),
				currentBid: Number(values.startingPrice),
				status: 'UPCOMING',
				bidCount: 0,
				imageUrls,
			};
			await createAuction(payload, user.id);
			alert('Auction created!');
			navigate('/profile');
		} catch {
			alert('Failed to create auction');
		} finally {
			setSubmitting(false);
		}
	};

	const renderSuggestions = (value, setFieldValue, fieldName) => {
		if (!value) return null;
		return (
			<div className="form-text mt-1">
				Suggest:
				{['000', '0000', '00000'].map((s, i) => {
					const suggestion = `${value}${s}`;
					return (
						<span
							key={i}
							className="badge bg-light text-dark border ms-2"
							style={{ cursor: 'pointer' }}
							onClick={() => setFieldValue(fieldName, suggestion)}
						>
							{Number(suggestion).toLocaleString('vi-VN')}
						</span>
					);
				})}
			</div>
		);
	};

	return (
		<div className="container py-4">
			<h2 className="mb-4">Create Auction</h2>
			{step === 'form' ? (
				<Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleReview}>
					{({ values, setFieldValue }) => (
						<Form>
							<div className="mb-3">
								<label className="form-label">
									Title
									<i
										className="fas fa-circle-info text-secondary ms-1"
										data-bs-toggle="tooltip"
										data-bs-placement="top"
										title="A short, descriptive title"
									/>
								</label>
								<Field type="text" name="title" className="form-control" />
								<ErrorMessage name="title" component="div" className="text-danger" />
							</div>
							<div className="mb-3">
								<label className="form-label">
									Description
									<i
										className="fas fa-circle-info text-secondary ms-1"
										data-bs-toggle="tooltip"
										data-bs-placement="top"
										title="Detailed description of the item"
									/>
								</label>
								<Field as="textarea" name="description" className="form-control" />
								<ErrorMessage name="description" component="div" className="text-danger" />
							</div>
							<div className="mb-3">
								<label className="form-label">Category</label>
								<Field as="select" name="categoryId" className="form-select">
									<option value="">-- Select --</option>
									{categories.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.name}
										</option>
									))}
								</Field>
								<ErrorMessage name="categoryId" component="div" className="text-danger" />
							</div>
							<div className="row mb-3">
								<div className="col">
									<label className="form-label">
										Start Time
										<i
											className="fas fa-circle-info text-secondary ms-1"
											data-bs-toggle="tooltip"
											data-bs-placement="top"
											title="Must be at least 15 minutes from now"
										/>
									</label>
									<Field type="datetime-local" name="startTime" className="form-control" />
									<ErrorMessage name="startTime" component="div" className="text-danger" />
								</div>
								<div className="col">
									<label className="form-label">
										End Time
										<i
											className="fas fa-circle-info text-secondary ms-1"
											data-bs-toggle="tooltip"
											data-bs-placement="top"
											title="Must be after start time"
										/>
									</label>
									<Field type="datetime-local" name="endTime" className="form-control" />
									<ErrorMessage name="endTime" component="div" className="text-danger" />
								</div>
							</div>
							<div className="row mb-3">
								<div className="col">
									<label className="form-label">Starting Price (VNĐ)</label>
									<Field name="startingPrice" component={CustomNumberInput} />
									<ErrorMessage name="startingPrice" component="div" className="text-danger" />
									{renderSuggestions(values.startingPrice, setFieldValue, 'startingPrice')}
								</div>
								<div className="col">
									<label className="form-label">Increment Amount (VNĐ)</label>
									<Field name="incrementAmount" component={CustomNumberInput} />
									<ErrorMessage name="incrementAmount" component="div" className="text-danger" />
									{renderSuggestions(values.incrementAmount, setFieldValue, 'incrementAmount')}
								</div>
							</div>
							<div className="form-check mb-3">
								<Field type="checkbox" name="requiresDeposit" className="form-check-input" id="requiresDeposit" />
								<label htmlFor="requiresDeposit" className="form-check-label">
									Requires Deposit?
									<i
										className="fas fa-circle-info text-secondary ms-1"
										data-bs-toggle="tooltip"
										data-bs-placement="top"
										title="Deposit must be less than starting price"
									/>
								</label>
							</div>
							{values.requiresDeposit && (
								<div className="mb-3">
									<label className="form-label">Deposit Amount</label>
									<Field name="securityDeposit" component={CustomNumberInput} />
									<ErrorMessage name="securityDeposit" component="div" className="text-danger" />
									{renderSuggestions(values.securityDeposit, setFieldValue, 'securityDeposit')}
								</div>
							)}
							<div className="mb-3">
								<label className="form-label">Upload Images</label>
								<input type="file" multiple onChange={handleImageChange} className="form-control" />
								<div className="d-flex flex-wrap gap-2 mt-2">
									{previews.map((src, idx) => (
										<div key={idx} className="position-relative">
											<img
												src={src}
												alt={`preview-${idx}`}
												width="100"
												height="100"
												style={{ objectFit: 'cover', borderRadius: '8px' }}
											/>
											<button
												type="button"
												className="btn-close position-absolute top-0 end-0"
												onClick={() => handleRemoveImage(idx)}
											></button>
										</div>
									))}
								</div>
							</div>
							<button type="submit" className="btn btn-warning">
								Review & Confirm
							</button>
						</Form>
					)}
				</Formik>
			) : (
				<Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
					{({ isSubmitting }) => (
						<Form>
							<h4>Review Your Auction</h4>
							<ul>
								<li>Title: {initialValues.title}</li>
								<li>Description: {initialValues.description}</li>
								<li>Category ID: {initialValues.categoryId}</li>
								<li>Start: {initialValues.startTime}</li>
								<li>End: {initialValues.endTime}</li>
								<li>Price: {initialValues.startingPrice}</li>
								<li>Increment: {initialValues.incrementAmount}</li>
							</ul>
							<button type="button" className="btn btn-secondary me-2" onClick={handleBack}>
								Back
							</button>
							<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
								{isSubmitting ? 'Submitting...' : 'Confirm & Create'}
							</button>
						</Form>
					)}
				</Formik>
			)}
		</div>
	);
};

export default CreateAuctionPage;
