package com.college.cms.dto;

import com.college.cms.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// ===== AUTH DTOs =====

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Size(min = 3, max = 50) private String username;
        @NotBlank @Size(min = 6) private String password;
        @NotBlank @Email private String email;
        @NotBlank private String fullName;
        private String phone;
        private User.Role role;
        private Long departmentId;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private Long departmentId;
        private String departmentName;

        public AuthResponse(String token, Long id, String username, String email,
                            String fullName, String role, Long departmentId, String departmentName) {
            this.token = token;
            this.id = id;
            this.username = username;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.departmentId = departmentId;
            this.departmentName = departmentName;
        }
    }
}
