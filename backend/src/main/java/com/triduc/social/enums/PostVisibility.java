package com.triduc.social.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PostVisibility {
    EVERYONE("Mọi người"),
    FRIENDS("Bạn bè"),
    ONLY_ME("Chỉ mình tôi");

    private final String label;

    @JsonCreator
    public static PostVisibility from(String value) {
        if (value == null || value.isBlank()) {
            return EVERYONE;
        }

        String normalized = value.trim().toUpperCase();

        return switch (normalized) {
            case "EVERYONE", "PUBLIC", "MOI_NGUOI", "MỌI NGƯỜI", "Mọi người" -> EVERYONE;
            case "FRIENDS", "FRIEND", "BAN_BE", "BẠN BÈ", "Bạn bè" -> FRIENDS;
            case "ONLY_ME", "PRIVATE", "CHI_MINH_TOI", "CHỈ MÌNH TÔI", "Chỉ mình tôi" -> ONLY_ME;
            default -> EVERYONE;
        };
    }

    @JsonValue
    public String toJson() {
        return this.name();
    }
}
