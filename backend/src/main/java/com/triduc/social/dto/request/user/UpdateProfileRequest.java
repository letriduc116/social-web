package com.triduc.social.dto.request;

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
    private String profileImage;
}
