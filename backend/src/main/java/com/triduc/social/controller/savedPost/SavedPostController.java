package com.triduc.social.controller.savedPost;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.SavedPostRequest;
import com.triduc.social.dto.response.post.PostResponse;
import com.triduc.social.entity.SavedPost;
import com.triduc.social.service.savedPost.SavedPostService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


import lombok.RequiredArgsConstructor;

import java.util.List;


@RestController
@RequestMapping("/api/v1/saved-post")
@RequiredArgsConstructor
public class SavedPostController {
    private final SavedPostService savedPostService;

    @GetMapping()
    public List<PostResponse> getSavedPost(@RequestParam("id") String currentUserId) {
        return savedPostService.getSavedPost(currentUserId);
    }

    @PostMapping("/save")
    public ResponseEntity<ApiResponse> savePost(@RequestBody SavedPostRequest savedPost ) {
        try {
            savedPostService.savePost(savedPost.getPostId(),savedPost.getUserId());
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                    "SavedPost success", null));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "error");
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse> deleteSavedPost(@RequestBody SavedPostRequest savedPost ) {
        try {
            savedPostService.deleteSavedPost(savedPost.getPostId(),savedPost.getUserId());
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Unsave success", null));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "error");
        }
    }
}