package com.triduc.social.controller.admin;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.UpdateUserRoleRequest;
import com.triduc.social.dto.response.admin.AdminUserResponse;
import com.triduc.social.enums.Role;
import com.triduc.social.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(), "OK", adminUserService.getAllUsers()
        ));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateRole(
            @PathVariable String id,
            @RequestBody UpdateUserRoleRequest req
    ) {
        Role role = Role.valueOf(req.getRole().toUpperCase());
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(), "Cập nhật quyền thành công", adminUserService.updateRole(id, role)
        ));
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<ApiResponse<AdminUserResponse>> lock(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(), "Đã khoá tài khoản", adminUserService.lockUser(id)
        ));
    }

    @PatchMapping("/{id}/unlock")
    public ResponseEntity<ApiResponse<AdminUserResponse>> unlock(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(), "Đã mở khoá tài khoản", adminUserService.unlockUser(id)
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(), "Xóa người dùng thành công", null
        ));
    }
}
