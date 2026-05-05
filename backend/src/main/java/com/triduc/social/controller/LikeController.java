package com.triduc.social.controller;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.post.LikeRequest;
import com.triduc.social.entity.Like;
import com.triduc.social.service.like.LikeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/like")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService service;

    @PostMapping()
    public ResponseEntity<ApiResponse> like(@RequestBody LikeRequest request) {
        Like like = service.like(request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Like success", null));
    }

    @PostMapping("/toggle")
    public ResponseEntity<ApiResponse> toggleLike(@RequestBody LikeRequest request) {
        boolean liked = service.toggleLike(request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                liked ? "Like success" : "Unlike success", liked));
    }

    @DeleteMapping()
    public ResponseEntity<ApiResponse> unlike(@RequestBody LikeRequest request) {
        service.unlike(request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Unlike success",null));
    }

}

