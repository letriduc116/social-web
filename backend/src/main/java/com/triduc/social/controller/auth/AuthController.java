package com.triduc.social.controller.auth;

import com.triduc.social.dto.request.*;
import com.triduc.social.dto.response.user.AuthResponse;
import com.triduc.social.repository.user.UserRepository;
import com.triduc.social.service.user.OtpService;
import com.triduc.social.service.user.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
	private final UserRepository userRepository;
	private final UserService userService;
	private final OtpService otpService;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse servletResponse) {
		try {
			return ResponseEntity
					.ok(userService.login(loginRequest.getEmail(), loginRequest.getPassword(), servletResponse));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản không tồn tại!");
		}
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED) 
	public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletResponse servletResponse) {
		if (userRepository.findByEmail(request.getEmail()).isPresent()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại!");
		}
//		userService.createUser(request);
		AuthResponse authResponse = userService.registerAndLogin(request, servletResponse);
		return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
	}

	@GetMapping("/check-email")
	public ResponseEntity<?> checkEmail(@RequestParam String email) {
		if (userRepository.findByEmail(email).isPresent()) {
			return ResponseEntity.ok().build();
		}
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email không tồn tại");
	}

	@PostMapping("/send-otp")
	public ResponseEntity<?> sendOtp(@RequestBody OTPRequest request) {
		otpService.generateAndSendOtp(request.getEmail());
		return ResponseEntity.ok().build();
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<?> verifyOtp(@RequestBody OTPVerifyRequest request) {
		boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
		if (!isValid) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP không chính xác hoặc đã hết hạn");
		}
		return ResponseEntity.ok().build();
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
		userService.resetPassword(request.getEmail(), request.getNewPassword());
		return ResponseEntity.ok().build();
	}
}
