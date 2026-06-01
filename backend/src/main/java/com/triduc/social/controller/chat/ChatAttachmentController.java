package com.triduc.social.controller.chat;

import com.cloudinary.Cloudinary;
import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.response.chat.ChatAttachmentResponse;
import com.triduc.social.enums.ChatMessageType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatAttachmentController {

    private static final long MAX_FILE_SIZE = 50L * 1024L * 1024L;
    private static final Set<String> ALLOWED_CONTENT_TYPE_PREFIXES = Set.of(
            "image/",
            "video/",
            "audio/",
            "text/"
    );
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/zip",
            "application/x-zip-compressed",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );

    private final Cloudinary cloudinary;

    @PostMapping(value = "/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ChatAttachmentResponse>> uploadChatAttachment(
            @RequestParam("file") MultipartFile file
    ) {
        validateFile(file);

        String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() == null || file.getOriginalFilename().isBlank()
                        ? "attachment"
                        : file.getOriginalFilename()
        );
        String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();

        try {
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", "auto");
            options.put("folder", "ducky/chat");
            options.put("use_filename", true);
            options.put("unique_filename", true);

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

            Object secureUrl = uploadResult.get("secure_url");
            Object publicId = uploadResult.get("public_id");

            if (secureUrl == null) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary không trả về URL file");
            }

            ChatAttachmentResponse response = ChatAttachmentResponse.builder()
                    .fileName(publicId == null ? originalFileName : String.valueOf(publicId))
                    .originalFileName(originalFileName)
                    .url(String.valueOf(secureUrl))
                    .type(resolveMessageType(contentType))
                    .contentType(contentType)
                    .size(file.getSize())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(HttpStatus.CREATED.value(), "Upload file chat thành công", response));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không upload được file chat lên Cloudinary");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File không được trống");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File không được vượt quá 50MB");
        }

        String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
        if (!isAllowedContentType(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Định dạng file chưa được hỗ trợ");
        }
    }

    private boolean isAllowedContentType(String contentType) {
        String normalized = contentType.toLowerCase(Locale.ROOT);
        return ALLOWED_CONTENT_TYPE_PREFIXES.stream().anyMatch(normalized::startsWith)
                || ALLOWED_CONTENT_TYPES.contains(normalized);
    }

    private ChatMessageType resolveMessageType(String contentType) {
        String normalized = contentType.toLowerCase(Locale.ROOT);
        if (normalized.startsWith("image/")) return ChatMessageType.IMAGE;
        if (normalized.startsWith("video/")) return ChatMessageType.VIDEO;
        if (normalized.startsWith("audio/")) return ChatMessageType.AUDIO;
        return ChatMessageType.FILE;
    }
}
