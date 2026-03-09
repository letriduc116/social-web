package com.triduc.social.controller;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<List<String>>> uploadFile(@RequestParam("files") List<MultipartFile> files) {
        List<String> urlImages = new ArrayList<>();
        System.out.println("ok");
        try {
            for (MultipartFile file : files) {
                String urlPath = fileService.uploadImageToCloudinary(file);
                urlImages.add(urlPath);
            }

            return ResponseEntity.ok(
                    ApiResponse.success(HttpStatus.OK.value(), "Tải ảnh thành công", urlImages)
            );

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Tải ảnh thất bại: " + e.getMessage()));
        }
    }

    /**
     * Upload story media (image or video) to Cloudinary
     * POST /file/upload-story
     */
    @PostMapping("/upload-story")
    public ResponseEntity<ApiResponse<String>> uploadStoryMedia(@RequestParam("file") MultipartFile file) {
        try {
            String mediaUrl = fileService.uploadStoryMedia(file);
            return ResponseEntity.ok(
                    ApiResponse.success(HttpStatus.OK.value(), "Tải story media thành công", mediaUrl)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Tải story media thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    public String test(){
        System.out.println("test");
        return "test";
    }
}
