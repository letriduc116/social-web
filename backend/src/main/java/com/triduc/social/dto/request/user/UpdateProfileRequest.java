package com.triduc.social.dto.request.user;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class UpdateProfileRequest {
    private String userName;
    private String fullName;
    private String bio;

    /** URL ảnh đại diện đã upload lên Cloudinary. Có thể null nếu chỉ sửa text. */
    private String profileImage;

    /** URL ảnh bìa đã upload lên Cloudinary. Có thể null nếu chỉ sửa text. */
    private String coverImage;
}
