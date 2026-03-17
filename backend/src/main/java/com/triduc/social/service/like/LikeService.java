package com.triduc.social.service.like;

import com.triduc.social.dto.request.post.LikeRequest;
import com.triduc.social.entity.Like;
import com.triduc.social.mapper.LikeMapper;
import com.triduc.social.repository.like.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeMapper mapper;
    private final LikeRepository repo;

    public Like like(LikeRequest request){
        Like like = mapper.toLike(request);
        return repo.save(like);
    }

    public void unlike(LikeRequest request) {
        repo.findByUserIdAndPostId(request.getUser_Id(), request.getPost_Id())
                .ifPresent(repo::delete);
    }
}
