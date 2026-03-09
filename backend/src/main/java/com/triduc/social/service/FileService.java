package com.triduc.social.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final Cloudinary cloudinary;
    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = List.of("jpg", "jpeg", "png", "gif", "webp");
    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = List.of("mp4", "mov", "avi", "wmv", "flv", "webm");

    public String uploadImageToCloudinary(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;

        validateImageFile(file);
        // tạo tên file
        String publicValue = generatePublicValue(file.getOriginalFilename());
        File fileUpload = convert(file);
        try {
//            cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id", publicValue));
            Map<?, ?> uploadResult = cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id", publicValue));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new IOException("Failed to upload file to Cloudinary", e);
        } finally {
            if (fileUpload.exists()) {
                if (!fileUpload.delete()) {
                    System.err.println("Warning: Failed to delete temporary file " + fileUpload.getAbsolutePath());
                }
            }
        }

//        return  cloudinary.url().generate(StringUtils.join(publicValue, ".", extension));
    }

    /**
     * Upload video to Cloudinary (for Story feature)
     */
    public String uploadVideoToCloudinary(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;

        validateVideoFile(file);
        String publicValue = generatePublicValue(file.getOriginalFilename());
        File fileUpload = convert(file);
        try {
            // Upload video với resource_type = "video"
            Map<?, ?> uploadResult = cloudinary.uploader().upload(fileUpload, 
                ObjectUtils.asMap(
                    "public_id", publicValue,
                    "resource_type", "video"
                ));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new IOException("Failed to upload video to Cloudinary", e);
        } finally {
            if (fileUpload.exists()) {
                if (!fileUpload.delete()) {
                    System.err.println("Warning: Failed to delete temporary file " + fileUpload.getAbsolutePath());
                }
            }
        }
    }

    /**
     * Upload media (image or video) for Story - tự động detect type
     */
    public String uploadStoryMedia(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;
        
        String extension = getFileName(file.getOriginalFilename())[1].toLowerCase();
        
        if (ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            return uploadImageToCloudinary(file);
        } else if (ALLOWED_VIDEO_EXTENSIONS.contains(extension)) {
            return uploadVideoToCloudinary(file);
        } else {
            throw new IllegalArgumentException("File format not supported for story. Supported: images (jpg, jpeg, png, gif, webp) and videos (mp4, mov, avi, wmv, flv, webm)");
        }
    }

    /**
     * Detect media type từ URL (dùng sau khi upload)
     */
    public String detectMediaTypeFromUrl(String url) {
        if (url == null) return "IMAGE";
        
        String lowerUrl = url.toLowerCase();
        for (String ext : ALLOWED_VIDEO_EXTENSIONS) {
            if (lowerUrl.contains("." + ext)) {
                return "VIDEO";
            }
        }
        return "IMAGE";
    }

    public void deleteImageInCloudinary(String imageUrl) throws IOException {
        String publicId = extractPublicIdFromUrl(imageUrl);
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    public String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("/upload/")) {
            return null;
        }

        String[] parts = imageUrl.split("/upload/");
        if (parts.length < 2) {
            return null;
        }

        String publicIdWithExtension = parts[1];
        int dotIndex = publicIdWithExtension.lastIndexOf(".");
        return dotIndex != -1 ? publicIdWithExtension.substring(0, dotIndex) : publicIdWithExtension;
    }

    public void validateImageFile(MultipartFile file) {
        String extension = getFileName(file.getOriginalFilename())[1].toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Image format not supported: " + extension + ". Supported: " + ALLOWED_IMAGE_EXTENSIONS);
        }
    }

    public void validateVideoFile(MultipartFile file) {
        String extension = getFileName(file.getOriginalFilename())[1].toLowerCase();
        if (!ALLOWED_VIDEO_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Video format not supported: " + extension + ". Supported: " + ALLOWED_VIDEO_EXTENSIONS);
        }
    }

    public File convert(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;
        File covertFile = new File(StringUtils.join(generatePublicValue(file.getOriginalFilename()), ".",
                getFileName(file.getOriginalFilename())[1]));
        try (InputStream is = file.getInputStream()) {
            Files.copy(is, covertFile.toPath());
        }
        return covertFile;
    }

    public String generatePublicValue(String originalName) {
        String fileName = getFileName(originalName)[0];
        return StringUtils.join(UUID.randomUUID().toString(), "_", fileName);
    }

    public String[] getFileName(String originalName) {
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == originalName.length() - 1) {
            throw new IllegalArgumentException("Invalid file name: missing extension.");
        }
        String name = originalName.substring(0, dotIndex);
        String extension = originalName.substring(dotIndex + 1);
        return new String[] { name, extension };
    }

}