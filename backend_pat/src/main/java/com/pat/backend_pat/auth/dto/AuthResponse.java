package com.pat.backend_pat.auth.dto;

public record AuthResponse(String token, String email, String role, String message) {
}
