// src/components/client/auction/AuctionImageUpload.jsx
import React from 'react';

const AuctionImageUpload = ({ previews, setPreviews, images, setImages }) => {
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

	return (
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
	);
};

export default AuctionImageUpload;
