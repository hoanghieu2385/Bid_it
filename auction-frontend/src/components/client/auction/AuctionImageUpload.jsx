import React from 'react';

const AuctionImageUpload = ({ previews, setPreviews, images, setImages }) => {
	// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
	const MAX_FILES = 10;
	const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

	const validateFile = (file) => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return `File "${file.name}" has invalid format. Only JPG, JPEG, PNG, WebP are accepted.`;
		}
		// if (file.size > MAX_FILE_SIZE) {
		// 	return `File "${file.name}" is too large. Maximum size is 5MB.`;
		// }
		return null;
	};

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);

		// Check total file count
		if (images.length + files.length > MAX_FILES) {
			alert(`You can only upload up to ${MAX_FILES} images`);
			return;
		}

		// Validate each file
		const errors = [];
		const validFiles = [];

		files.forEach((file) => {
			const error = validateFile(file);
			if (error) {
				errors.push(error);
			} else {
				validFiles.push(file);
			}
		});

		// Show errors if any
		if (errors.length > 0) {
			alert(errors.join('\n'));
		}

		// Add valid files
		if (validFiles.length > 0) {
			const newImages = [...images, ...validFiles];
			const newPreviews = [...previews, ...validFiles.map((file) => URL.createObjectURL(file))];

			setImages(newImages);
			setPreviews(newPreviews);
		}

		// Clear input
		e.target.value = '';
	};

	const handleImageDrop = (droppedFiles) => {
		const files = droppedFiles.filter((f) => f instanceof File);

		// Check total file count
		if (images.length + files.length > MAX_FILES) {
			alert(`You can only upload up to ${MAX_FILES} images`);
			return;
		}

		const errors = [];
		const validFiles = [];

		files.forEach((file) => {
			const error = validateFile(file);
			if (error) {
				errors.push(error);
			} else {
				validFiles.push(file);
			}
		});

		if (errors.length > 0) {
			alert(errors.join('\n'));
		}

		if (validFiles.length > 0) {
			const newImages = [...images, ...validFiles];
			const newPreviews = [...previews, ...validFiles.map((file) => URL.createObjectURL(file))];

			setImages(newImages);
			setPreviews(newPreviews);
		}
	};

	const handleRemoveImage = (index) => {
		const newImages = [...images];
		const newPreviews = [...previews];

		// Revoke object URL to prevent memory leaks
		URL.revokeObjectURL(newPreviews[index]);

		newImages.splice(index, 1);
		newPreviews.splice(index, 1);

		setImages(newImages);
		setPreviews(newPreviews);
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div className="mb-3">
			<div className="d-flex justify-content-between align-items-center mb-2">
				<label className="form-label mb-0">
					Upload Images <span className="text-danger">*</span>
				</label>
				<small className="text-muted">
					{images.length}/{MAX_FILES} images
				</small>
			</div>

			<div
				className={`dropzone bg-white border border-2 rounded d-flex flex-column align-items-center justify-content-center text-center p-4 mb-3 ${
					images.length === 0 ? 'border-secondary' : 'border-success'
				}`}
				onDragOver={(e) => e.preventDefault()}
				onDrop={(e) => {
					e.preventDefault();
					const droppedFiles = Array.from(e.dataTransfer.files);
					handleImageDrop(droppedFiles);
				}}
				onDragEnter={(e) => e.currentTarget.classList.add('border-primary')}
				onDragLeave={(e) => e.currentTarget.classList.remove('border-primary')}
			>
				<i className="bi bi-cloud-arrow-up-fill fs-2 text-primary mb-2"></i>
				<p className="mb-1">
					<strong>Drag & drop</strong> your images here or
				</p>
				<label htmlFor="imageUpload" className="btn btn-outline-dark btn-sm mt-1">
					Select Files
				</label>
				<input
					id="imageUpload"
					type="file"
					multiple
					accept="image/jpeg,image/jpg,image/png,image/webp"
					onChange={handleImageChange}
					className="d-none"
				/>
			</div>

			{previews.length > 0 && (
				<div className="row g-2">
					{previews.map((src, idx) => (
						<div key={idx} className="col-6 col-md-4 col-lg-3">
							<div className="position-relative border rounded overflow-hidden">
								<img
									src={src}
									alt={`preview-${idx}`}
									className="w-100 bg-light"
									style={{
										height: '120px',
										objectFit: 'contain',
										padding: '4px',
										// backgroundColor: '#f8f9fa',
									}}
								/>

								<button
									type="button"
									className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-1 lh-1"
									onClick={() => handleRemoveImage(idx)}
									style={{
										width: '24px',
										height: '24px',
										fontSize: '12px',
									}}
									title="Remove image"
								>
									×
								</button>
								{images[idx] && (
									<div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-1">
										<small className="d-block text-truncate" style={{ fontSize: '10px' }}>
											{images[idx].name}
										</small>
										<small style={{ fontSize: '9px' }}>{formatFileSize(images[idx].size)}</small>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{previews.length === 0 && (
				<div className="alert alert-warning py-2 mb-3 text-center small">
					<i className="bi bi-exclamation-triangle me-1"></i>
					No images selected. Please upload at least one image.
				</div>
			)}
		</div>
	);
};

export default AuctionImageUpload;
