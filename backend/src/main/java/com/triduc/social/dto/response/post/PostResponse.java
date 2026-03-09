package com.triduc.social.dto.response.post;

import com.triduc.social.dto.response.user.UserResponse;
import com.triduc.social.entity.Comment;
import com.triduc.social.entity.Like;
import com.triduc.social.entity.PostImages;
import com.triduc.social.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostResponse {
    private String id;
    private String content;
    private LocalDateTime createAt;
    private List<PostImages> images;
    private int comments;
    private int likes;
    private boolean liked;
    private boolean savedPost;
    private UserResponse user;
}
