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
		const result = await Swal.fire({
			title: 'Confirm Auction Creation',
			text: 'Do you want to publish this auction now?',
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

			toast.showSuccess('Auction created successfully!');
			navigate('/profile?tab=my-auctions');
		} catch (err) {
			console.error(err);
			toast.showError('Failed to create auction. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="container py-5">
			<div className="row justify-content-center">
				<div className="col-lg-10">
					<div className="bg-white p-4 rounded-4 shadow border">
						<h3 className="text-center mb-4">Create a New Auction</h3>
						<Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
							{({ values, setFieldValue, isSubmitting }) => (
								<Form>
									<div className="row g-3">
										<div className="col-12">
											<label className="form-label">Title</label>
											<Field
												type="text"
												name="title"
												className="form-control"
												placeholder="e.g. Samsung Galaxy S24 Ultra"
											/>
											<ErrorMessage name="title" component="div" className="text-danger small" />
										</div>

										<div className="col-12">
											<label className="form-label">Description</label>
											<Field as="textarea" name="description" className="form-control" rows={6} />
											<ErrorMessage name="description" component="div" className="text-danger small" />
										</div>

										<div className="col-12">
											<label className="form-label">Category</label>
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
											Requires Deposit?
										</label>
									</div>

									{values.requiresDeposit && (
										<div className="mt-2">
											<label className="form-label">Deposit Amount</label>
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
														/>
													);
												}}
											/>
											<ErrorMessage name="securityDeposit" component="div" className="text-danger small" />
										</div>
									)}

									<hr className="my-4" />

									<AuctionImageUpload
										images={images}
										setImages={setImages}
										previews={previews}
										setPreviews={setPreviews}
									/>

									<div className="text-center mt-4">
										<button type="submit" className="btn btn-dark px-5 py-2 rounded-pill" disabled={isSubmitting}>
											{isSubmitting ? 'Creating...' : 'Create Auction'}
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
