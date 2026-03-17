package com.triduc.social.dto.request.comment;

import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ModifyCommentRequestDTO {
    private String commentId;
    private String content;
}
