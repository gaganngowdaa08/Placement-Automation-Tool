package com.pat.backend_pat.service;

import com.pat.backend_pat.auth.JwtService;
import com.pat.backend_pat.auth.dto.AuthResponse;
import com.pat.backend_pat.auth.dto.LoginRequest;
import com.pat.backend_pat.auth.dto.RegisterRequest;
import com.pat.backend_pat.entity.CollegeProfile;
import com.pat.backend_pat.entity.Employer;
import com.pat.backend_pat.entity.StudentProfile;
import com.pat.backend_pat.entity.UserAccount;
import com.pat.backend_pat.repository.CollegeProfileRepository;
import com.pat.backend_pat.repository.EmployerRepository;
import com.pat.backend_pat.repository.StudentProfileRepository;
import com.pat.backend_pat.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final EmployerRepository employerRepository;
    private final CollegeProfileRepository collegeProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       EmployerRepository employerRepository,
                       CollegeProfileRepository collegeProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.employerRepository = employerRepository;
        this.collegeProfileRepository = collegeProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyRegisteredException();
        }
        String role = normalizeRole(request.role());
        String organizationName = trimToNull(request.organizationName());
        if (!role.equals("student") && organizationName == null) {
            throw new IllegalArgumentException("Enter the college or company name to register this account.");
        }

        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setContactName(request.fullName().trim());
        user.setPhoneNumber(request.phoneNumber().trim());
        user.setRole(role);
        UserAccount savedUser = userRepository.saveAndFlush(user);

        switch (role) {
            case "student" -> studentProfileRepository.save(new StudentProfile(
                    savedUser.getUserId(), request.fullName().trim(), request.phoneNumber().trim()));
            case "company" -> {
                Employer employer = new Employer();
                employer.setUserId(savedUser.getUserId());
                employer.setCompanyName(organizationName);
                employer.setCompanyDescription(defaultString(request.organizationDescription()));
                employer.setApprovedStatus(false);
                employer.setRejectedStatus(false);
                employerRepository.save(employer);
            }
            case "college" -> {
                CollegeProfile college = new CollegeProfile();
                college.setUserId(savedUser.getUserId());
                college.setCollegeName(organizationName);
                college.setCollegeDescription(defaultString(request.organizationDescription()));
                college.setApprovedStatus(false);
                collegeProfileRepository.save(college);
            }
            default -> throw new IllegalArgumentException("Choose Student, College, or Company.");
        }

        return createResponse(savedUser, "Account created successfully.");
    }

    public AuthResponse login(LoginRequest request) {
        UserAccount user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .filter(account -> passwordEncoder.matches(request.password(), account.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));
        String role = user.getRole().equalsIgnoreCase("employer") ? "company" : user.getRole().toLowerCase();
        return new AuthResponse(jwtService.createToken(user.getEmail(), role), user.getEmail(), role, "Login successful.");
    }

    private AuthResponse createResponse(UserAccount user, String message) {
        String role = user.getRole().equalsIgnoreCase("employer") ? "company" : user.getRole().toLowerCase();
        return new AuthResponse(jwtService.createToken(user.getEmail(), role), user.getEmail(), role, message);
    }

    private static String normalizeRole(String role) {
        String normalized = role == null || role.isBlank() ? "student" : role.trim().toLowerCase();
        if (!normalized.equals("student") && !normalized.equals("college") && !normalized.equals("company")) {
            throw new IllegalArgumentException("Choose Student, College, or Company.");
        }
        return normalized;
    }
    private static String normalizeEmail(String email) { return email.trim().toLowerCase(java.util.Locale.ROOT); }
    private static String trimToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private static String defaultString(String value) { return value == null ? "" : value.trim(); }

    public static class EmailAlreadyRegisteredException extends RuntimeException {
        public EmailAlreadyRegisteredException() { super("An account with this email already exists."); }
    }
}
