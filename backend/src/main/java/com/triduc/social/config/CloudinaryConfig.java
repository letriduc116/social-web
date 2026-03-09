package com.triduc.social.config;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {
    @Value("${cloud_name}")
    private String cloudName;
    @Value("${api_key}")
    private String key;
    @Value("${api_secret}")
    private String secret;


    @Bean
    public Cloudinary configKey() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", key);
        config.put("api_secret", secret);
        return new Cloudinary(config);
    }
}