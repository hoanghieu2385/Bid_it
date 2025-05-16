package com.example.user.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService() {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "YOUR_CLOUD_NAME",
                "api_key", "YOUR_API_KEY",
                "api_secret", "YOUR_API_SECRET"
        ));
    }

    public String uploadImage(MultipartFile file) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("secure_url").toString(); // hoặc public_id nếu bạn muốn
        } catch (IOException e) {
            throw new RuntimeException("Image upload failed", e);
        }
    }
}
