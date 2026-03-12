package com.triduc.social.dto.request.post;


import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpPostRequest {
    private String content;
    private List<String> postImages;
    private String user_Id;
}

