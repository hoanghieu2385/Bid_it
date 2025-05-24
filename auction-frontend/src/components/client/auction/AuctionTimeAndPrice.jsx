// src/components/client/auction/AuctionTimeAndPrice.jsx
import React from 'react';
import { Field, ErrorMessage } from 'formik';

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
		<input
			{...props}
			type="text"
			value={formatNumber(field.value)}
			onChange={handleChange}
			className="form-control"
		/>
	);
};

const renderSuggestions = (value, setFieldValue, fieldName) => {
	if (!value) return null;
	return (
		<div className="form-text mt-1">
			Suggest:
			{['0', '00', '000'].map((s, i) => {
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

const AuctionTimeAndPrice = ({ formik }) => {
	const { values, setFieldValue } = formik;

	return (
		<>
			<div className="row mb-3">
				<div className="col">
					<label className="form-label">Start Time</label>
					<Field type="datetime-local" name="startTime" className="form-control" />
					<ErrorMessage name="startTime" component="div" className="text-danger" />
				</div>
				<div className="col">
					<label className="form-label">End Time</label>
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
		</>
	);
};

export default AuctionTimeAndPrice;