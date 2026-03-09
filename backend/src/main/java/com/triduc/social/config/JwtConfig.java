package com.triduc.social.config;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.util.Base64;
import com.triduc.social.service.jwt.JwtService;

@Configuration
public class JwtConfig {
    @Value("${jwt.base64-secret}")
    private String jwtKey;

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey()));
    }

    public SecretKey getSecretKey() {
        byte[] keyBytes = Base64.encode(jwtKey).decode();
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, JwtService.JWT_ALGORITHM.getName());
    }

//    @Bean
//    public JwtDecoder jwtDecoder() {
//        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(getSecretKey())
//                .macAlgorithm(JwtService.JWT_ALGORITHM).build();
//        return token -> {
//            try {
//                return jwtDecoder.decode(token);
//            } catch (Exception e) {
//                System.out.println("jwt error:" + e.getMessage());
//                throw e;
//            }
//        };
//    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // Tạo SecretKeySpec từ secret key
        SecretKeySpec secretKey = new SecretKeySpec(jwtKey.getBytes(), "HmacSHA256");
        // In ra log để debug, giúp bạn kiểm tra xem key có được load đúng không
        System.out.println("JwtDecoder initialized with key (Base64 encoded): " + java.util.Base64.getEncoder().encodeToString(secretKey.getEncoded()));
        return NimbusJwtDecoder.withSecretKey(secretKey).build();
    }
}