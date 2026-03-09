package com.triduc.social.service.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final EmailService emailService;
    private final Map<String, String> otpStorage = new HashMap<>();

    public String generateAndSendOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        otpStorage.put(email, otp); // lưu tạm
        emailService.sendOtpEmail(email, otp); // gửi mail
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        return otp.equals(otpStorage.get(email));
    }

    public void removeOtp(String email) {
        otpStorage.remove(email);
    }
}
