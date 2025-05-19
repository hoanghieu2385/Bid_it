
package com.example.user.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public String uploadImage(MultipartFile file) {
        try {
            // Upload file to Cloudinary
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "ekyc_documents",
                    "resource_type", "image",
                        "allowed_formats", new String[] {"jpg", "jpeg", "png"},
                        "max_file_size", 5000000 // 5MB limit
                )
            );

            // Return the secure URL
            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error during image upload: " + e.getMessage(), e);
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            // Extract public_id from URL
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            // Log error but don't throw exception for delete operations
            System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            // Extract public_id from Cloudinary URL
            // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
            String[] parts = imageUrl.split("/");
            if (parts.length >= 2) {
                String fileName = parts[parts.length - 1];
                return fileName.substring(0, fileName.lastIndexOf('.'));
            }
        } catch (Exception e) {
            System.err.println("Failed to extract public_id from URL: " + imageUrl);
        }
        return null;
    }
}