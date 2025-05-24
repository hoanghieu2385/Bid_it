// src/pages/client/CreateAuctionPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Tooltip } from 'bootstrap';
import { UserContext } from '../../../contexts/UserContext';
import { getAllCategories } from '../../../services/category-api';
import { createAuction, uploadAuctionImages } from '../../../services/auction-api';
import AuctionTimeAndPrice from '../../../components/client/auction/AuctionTimeAndPrice';
import AuctionImageUpload from '../../../components/client/auction/AuctionImageUpload';

const CreateAuctionPage = () => {
	const navigate = useNavigate();
	const { user } = useContext(UserContext);

	const [categories, setCategories] = useState([]);
	const [images, setImages] = useState([]);
	const [previews, setPreviews] = useState([]);

	useEffect(() => {
		if (!user) navigate('/login');
		document.title = 'Create Auction | Bid it';
		getAllCategories().then(setCategories);

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
		endTime: new Date(Date.now() + 130 * 60000)
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

	const handleSubmit = async (values, { setSubmitting }) => {
		try {
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

			const auction = await createAuction(payload, user.id);

			if (images.length > 0) {
				await uploadAuctionImages(auction.id, images);
			}

			alert('Auction created!');
			navigate('/profile?tab=my-auctions');
		} catch (err) {
			console.error(err);
			alert('Failed to create auction');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="container py-4">
			<h2 className="mb-4">Create Auction</h2>
			<Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
				{({ values, setFieldValue, isSubmitting }) => (
					<Form>
						<div className="mb-3">
							<label className="form-label">Title</label>
							<Field type="text" name="title" className="form-control" />
							<ErrorMessage name="title" component="div" className="text-danger" />
						</div>

						<div className="mb-3">
							<label className="form-label">Description</label>
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

						<AuctionTimeAndPrice formik={{ values, setFieldValue }} />

						<div className="form-check mb-3">
							<Field type="checkbox" name="requiresDeposit" className="form-check-input" id="requiresDeposit" />
							<label htmlFor="requiresDeposit" className="form-check-label">
								Requires Deposit?
							</label>
						</div>

						{values.requiresDeposit && (
							<div className="mb-3">
								<label className="form-label">Deposit Amount</label>
								<Field name="securityDeposit" component={({ field, form }) => {
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
										/>
									);
								}} />
								<ErrorMessage name="securityDeposit" component="div" className="text-danger" />
							</div>
						)}

						<AuctionImageUpload
							images={images}
							setImages={setImages}
							previews={previews}
							setPreviews={setPreviews}
						/>

						<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
							{isSubmitting ? 'Creating...' : 'Create Auction'}
						</button>
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default CreateAuctionPage;
