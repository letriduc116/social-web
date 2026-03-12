package com.triduc.social.controller.admin;

import com.triduc.social.dto.request.auth.LoginRequest;
import com.triduc.social.dto.response.user.AuthResponse;
import com.triduc.social.entity.User;
import com.triduc.social.enums.Role;
import com.triduc.social.repository.user.UserRepository;
import com.triduc.social.service.user.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor

public class AdminAuthController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> adminLogin(@RequestBody LoginRequest request,
                                                   HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản không có quyền quản trị");
        }

        return ResponseEntity.ok(userService.login(request.getEmail(), request.getPassword(), response));
    }
}
