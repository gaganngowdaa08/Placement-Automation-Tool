# PAT Backend — Phase 2: Authentication Module
## Task Allocation File | Date: 23 March 2026

---

> **Rule for today:** Every time someone finishes a file, they push to `dev` immediately and message Fahim. Nobody moves to the next file without Fahim's confirmation.

---

## 📋 Overview — Who Builds What Today

| Person | Files to Build | Depends On |
|---|---|---|
| Tejas | `RegisterRequest.java`, `LoginRequest.java`, `AuthResponse.java` | Nothing — start immediately |
| Aishwarya D S | `JwtUtil.java` | Nothing — start immediately |
| B S Aishwarya | `UserDetailsServiceImpl.java` | Tejas must push DTOs first |
| Manoj | `JwtAuthFilter.java` | Aishwarya DS must push JwtUtil first |
| Fahim | `SecurityConfig.java` | Manoj + Aishwarya DS must both push first |
| Fahim | `AuthService.java`, `AuthController.java` | SecurityConfig must be clean first |

> **Frontend team (FE-1, FE-2, FE-3):** Work in full parallel today. Your tasks are at the bottom of this file.

---

---

# 👤 TEJAS — DTO Classes

## Your Task Today
You are building 3 simple Java classes called **DTOs (Data Transfer Objects)**.  
A DTO is just a class that defines the **shape of data** coming in or going out of the API.  
No business logic. No database queries. Just fields and annotations.

## What is a DTO? (Read this before coding)
When someone sends a request to your backend — for example, a student registering — that request comes as JSON like this:
```json
{
  "email": "student@email.com",
  "password": "mypassword",
  "role": "student"
}
```
Spring Boot needs a Java class to map this JSON into a Data Transfer Object. That class is a DTO.  
You are building the "mold" that incoming and outgoing data must fit into.

---

## File 1 of 3 — `RegisterRequest.java`

**Where to create it:**  
`src/main/java/com/pat/backend_pat/dto/RegisterRequest.java`

> Note: The `dto` folder does not exist yet. Create it as a new package inside `com.pat.backend_pat`.  
> In IntelliJ: Right click on `com.pat.backend_pat` → New → Package → type `dto`

**What this file does:**  
Maps the JSON body of the POST /auth/register request into a Java object.

**Approach to write this with AI:**  
Copy this exact prompt and give it to ChatGPT or Claude:

```
I am building a Spring Boot 3 REST API project. 
I need to create a DTO class called RegisterRequest 
inside the package com.pat.backend_pat.dto

Requirements:
- It must have 3 fields: email (String), password (String), role (String)
- Use Lombok @Data annotation to auto-generate getters and setters
- email field must have @NotBlank and @Email validation annotations
- password field must have @NotBlank annotation
- role field must have @NotBlank annotation
- Use Jakarta validation (jakarta.validation.constraints) not javax
- Do not add any methods or constructors manually
```

**What the final file should look like:**
```java
package com.pat.backend_pat.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Role is required")
    private String role;
}
```

**How to verify your file is correct:**  
- No red underlines in IntelliJ  
- `@Data` is not showing as an error (means Lombok is working)  
- If `@Data` shows red: Go to IntelliJ → Preferences → Plugins → search Lombok → install it → restart IntelliJ

---

## File 2 of 3 — `LoginRequest.java`

**Where to create it:**  
`src/main/java/com/pat/backend_pat/dto/LoginRequest.java`

**What this file does:**  
Maps the JSON body of the POST /auth/login request.

**Approach to write this with AI:**
```
I am building a Spring Boot 3 REST API.
Create a DTO class called LoginRequest 
inside package com.pat.backend_pat.dto

Requirements:
- 2 fields: email (String), password (String)
- Use Lombok @Data
- Both fields must have @NotBlank from jakarta.validation.constraints
- Add a meaningful message to each @NotBlank annotation
```

**What the final file should look like:**
```java
package com.pat.backend_pat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
```

---

## File 3 of 3 — `AuthResponse.java`

**Where to create it:**  
`src/main/java/com/pat/backend_pat/dto/AuthResponse.java`

**What this file does:**  
This is the response your backend sends BACK to the frontend after a successful login or register. It contains the JWT token, the user's role, and their ID.

**Approach to write this with AI:**
```
I am building a Spring Boot 3 REST API.
Create a DTO class called AuthResponse 
inside package com.pat.backend_pat.dto

Requirements:
- 3 fields: token (String), role (String), userId (Integer)
- Use Lombok @Data annotation
- Also add @AllArgsConstructor and @NoArgsConstructor from Lombok
- No validation annotations needed — this is an outgoing response only
```

**What the final file should look like:**
```java
package com.pat.backend_pat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private String role;
    private Integer userId;
}
```

---

## How to Test Your Work (Tejas)
You cannot run an API test yet — controllers don't exist. But you can verify:
1. Run `mvn spring-boot:run` — it must still start cleanly with zero new errors
2. Open each file in IntelliJ — zero red underlines anywhere
3. Hover over `@Data` — IntelliJ should show "Generates getters, setters..." tooltip

## What to Do If You Get an Error
- **`@Data` shows red** → Lombok plugin not installed. Go to IntelliJ → Preferences → Plugins → Lombok → Install
- **`jakarta.validation` shows red** → Your pom.xml is missing the validation dependency. Tell Fahim immediately.
- **Package not found error** → Make sure you created the `dto` folder as a package, not a regular folder

## Git Instructions (Tejas)
When all 3 files are done and zero red underlines:
```bash
git add backend_pat
git commit -m "feat: add auth DTO classes - RegisterRequest, LoginRequest, AuthResponse"
git push origin dev
```
Then message in the group: **"DTOs pushed to dev ✅"**

---
---

# 👤 AISHWARYA D S — JwtUtil.java

## Your Task Today
You are building the **JWT utility class**. This is the brain of the authentication system.  
JWT (JSON Web Token) is a secure string that proves who a user is.  
Your class will: create tokens, read data from tokens, and check if a token is still valid.

## What is a JWT? (Read this before coding)
When a user logs in successfully, your backend creates a JWT token that looks like this:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGVtYWlsLmNvbSJ9.abc123
```
This token has 3 parts separated by dots:
- Part 1: Header (algorithm used)
- Part 2: Payload (the data stored inside — email, role, expiry time)
- Part 3: Signature (proves nobody tampered with it)

Your `JwtUtil` class creates and reads these tokens.

---

## Step 1 — Add Dependencies to pom.xml FIRST

**Before writing any Java code**, open `pom.xml` and add these 3 dependencies inside the `<dependencies>` block:

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

After adding: IntelliJ will show a small icon to reload Maven. Click **"Load Maven Changes"** (or press the reload button). Wait for it to finish downloading before writing any code.

## Step 2 — Add to application.properties

Open `src/main/resources/application.properties` and add these two lines at the bottom:
```properties
jwt.secret=PAT_JWT_SECRET_KEY_MINIMUM_32_CHARACTERS_LONG
jwt.expiration=86400000
```
> `86400000` = 24 hours in milliseconds. This means tokens expire after 24 hours.

---

## File — `JwtUtil.java`

**Where to create it:**  
`src/main/java/com/pat/backend_pat/security/JwtUtil.java`

> The `security` folder does not exist yet.  
> In IntelliJ: Right click on `com.pat.backend_pat` → New → Package → type `security`

**Approach to write this with AI:**  
Copy this exact prompt:

```
I am building a Spring Boot 3 backend with JWT authentication.
Create a class called JwtUtil inside package com.pat.backend_pat.security

Requirements:
- Annotate with @Component so Spring manages it
- Read jwt.secret and jwt.expiration from application.properties using @Value
- Use the JJWT library version 0.11.5 (io.jsonwebtoken)
- Method 1: generateToken(String email, String role)
    → Creates and returns a JWT token string
    → Stores email as the subject
    → Stores role as a claim called "role"
    → Token expires based on jwt.expiration value
    → Signed with HMAC SHA256 using the secret key
- Method 2: extractEmail(String token)
    → Reads and returns the subject (email) from the token
- Method 3: extractRole(String token)  
    → Reads and returns the "role" claim from the token
- Method 4: isTokenValid(String token)
    → Returns true if token is not expired and not malformed
    → Returns false if token is expired or invalid
    → Must use try/catch — never let an exception bubble up
- Use Keys.hmacShaKeyFor() to create the signing key from the secret string
```

**What the final file should look like:**
```java
package com.pat.backend_pat.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
```

---

## How to Test Your Work (Aishwarya DS)
1. Run `mvn spring-boot:run` — must start cleanly, zero new errors
2. The JJWT imports must not show red in IntelliJ
3. Go to [jwt.io](https://jwt.io) — you will test token generation properly once AuthService is built

## What to Do If You Get an Error
- **`io.jsonwebtoken` imports show red** → Maven dependencies didn't download. Click "Load Maven Changes" in IntelliJ again and wait.
- **`WeakKeyException` at runtime** → Your `jwt.secret` in application.properties is too short. Make it at least 32 characters.
- **`@Value` not injecting** → Make sure the property names in application.properties match exactly: `jwt.secret` and `jwt.expiration`

## Git Instructions (Aishwarya DS)
When done and zero red underlines:
```bash
git add backend_pat
git commit -m "feat: add JwtUtil and security package"
git push origin dev
```
Then message in the group: **"JwtUtil pushed to dev ✅"**

---
---

# 👤 B S AISHWARYA — UserDetailsServiceImpl.java

## ⚠️ WAIT BEFORE STARTING
**Do not start until Tejas pushes the DTO files and you have pulled from dev.**
```bash
git pull origin dev
```
Confirm you can see the `dto` folder with `RegisterRequest.java`, `LoginRequest.java`, `AuthResponse.java` before proceeding.

---

## Your Task Today
You are building the bridge between **Spring Security** and your **database**.

When a user tries to log in, Spring Security asks: *"Who is this person? Load their details."*  
Your class answers that question by fetching the user from your database using their email.

## What is UserDetailsService? (Read this before coding)
Spring Security doesn't know about your `User` entity or your `UserRepository`.  
It only knows how to work with its own `UserDetails` object.  
Your job is to implement `UserDetailsService` — a Spring Security interface — and inside it, fetch your `User` from the database and convert it into a `UserDetails` object that Spring Security understands.

---

## File — `UserDetailsServiceImpl.java`

**Where to create it:**  
`src/main/java/com/pat/backend_pat/security/UserDetailsServiceImpl.java`

> This goes in the `security` package. Aishwarya DS is creating this package today.  
> Pull her push before creating your file to avoid package conflicts.

**Approach to write this with AI:**
```
I am building a Spring Boot 3 backend.
Create a class called UserDetailsServiceImpl 
inside package com.pat.backend_pat.security

Requirements:
- Implements Spring Security's UserDetailsService interface
- Annotate with @Service
- Inject UserRepository using @RequiredArgsConstructor (Lombok)
- UserRepository is in package com.pat.backend_pat.repository
- User entity is in package com.pat.backend_pat.entity
- User entity has fields: email (String), passwordHash (String), role (String)
- Implement the method: loadUserByUsername(String email)
    → Find the user by email using UserRepository
    → If user not found: throw UsernameNotFoundException with message "User not found: " + email
    → If found: return a Spring Security User object built with:
        - username = user.getEmail()
        - password = user.getPasswordHash()  
        - authorities = SimpleGrantedAuthority with "ROLE_" + user.getRole().toUpperCase()
- Import org.springframework.security.core.userdetails.User as SecurityUser to avoid 
  conflict with your own User entity class
```

**What the final file should look like:**
```java
package com.pat.backend_pat.security;

import com.pat.backend_pat.entity.User;
import com.pat.backend_pat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()))
        );
    }
}
```

> ⚠️ **Important:** Check your `User` entity — the password field might be named `password` not `passwordHash`. Look at your `User.java` file and use the correct getter name. If the field is `password`, use `user.getPassword()` instead.

---

## How to Test Your Work (B S Aishwarya)
1. Run `mvn spring-boot:run` — must still start cleanly
2. No red underlines in IntelliJ
3. Verify: `UserRepository` must have a `findByEmail(String email)` method. Open `UserRepository.java` and check. If it doesn't exist, tell Fahim — Tejas needs to add it.

## What to Do If You Get an Error
- **`findByEmail` method not found** → Open `UserRepository.java`, check if that method exists. If not, add it: `Optional<User> findByEmail(String email);`
- **`getPasswordHash()` method not found** → Open `User.java` and check what the password field is actually named. Use that getter instead.
- **Circular dependency error at startup** → Tell Fahim immediately. Do not try to fix this alone.

## Git Instructions (B S Aishwarya)
```bash
git add backend_pat
git commit -m "feat: add UserDetailsServiceImpl"
git push origin dev
```
Then message in the group: **"UserDetailsServiceImpl pushed to dev ✅"**

---
---

# 👤 MANOJ — JwtAuthFilter.java

## ⚠️ WAIT BEFORE STARTING
**Do not start until Aishwarya DS pushes JwtUtil and you have pulled from dev.**
```bash
git pull origin dev
```
Confirm you can see `security/JwtUtil.java` before proceeding.

---

## Your Task Today
You are building the **security checkpoint** for every single API request.

Every time anyone calls your backend — whether from React or Postman — this filter runs first. It checks: *"Does this request have a valid JWT token?"* If yes, it lets the request through. If no, Spring Security will block it.

## What is a Filter? (Read this before coding)
Think of this filter like a security guard at a building entrance. Every person (HTTP request) must show their ID (JWT token) before entering. The guard (your filter) checks the ID. If valid, the person gets in. If invalid or missing, they are turned away.

Your filter runs before Spring Security's own checks — it reads the token, validates it, and if valid, tells Spring Security: *"This user is authenticated."*

---

## File — `JwtAuthFilter.java`

**Where to create it:**  
`src/main/java/com/pat/backend_pat/security/JwtAuthFilter.java`

**Approach to write this with AI:**
```
I am building a Spring Boot 3 backend with JWT authentication.
Create a class called JwtAuthFilter 
inside package com.pat.backend_pat.security

Requirements:
- Extends OncePerRequestFilter (ensures it runs once per request)
- Annotate with @Component
- Inject JwtUtil and UserDetailsServiceImpl using @RequiredArgsConstructor
- Implement the method: doFilterInternal(HttpServletRequest, HttpServletResponse, FilterChain)
- Logic inside doFilterInternal:
    Step 1: Read the "Authorization" header from the request
    Step 2: If the header is null OR does not start with "Bearer ", 
            call filterChain.doFilter() and return immediately (skip token check)
    Step 3: Extract the token by removing "Bearer " from the start of the header
    Step 4: Call jwtUtil.isTokenValid(token) — if false, skip and return
    Step 5: Extract email using jwtUtil.extractEmail(token)
    Step 6: Check if SecurityContextHolder.getContext().getAuthentication() is null
            (only proceed if no authentication is set yet)
    Step 7: Load UserDetails using userDetailsService.loadUserByUsername(email)
    Step 8: Create a UsernamePasswordAuthenticationToken with userDetails and their authorities
    Step 9: Set the request details on the token using WebAuthenticationDetailsSource
    Step 10: Set this authentication into SecurityContextHolder
    Step 11: Always call filterChain.doFilter() at the end to continue the chain
- All steps must be inside a try/catch — catch Exception and just call filterChain.doFilter()
```

**What the final file should look like:**
```java
package com.pat.backend_pat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isTokenValid(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            String email = jwtUtil.extractEmail(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (Exception e) {
            // Invalid token — do nothing, Spring Security will handle the rejection
        }

        filterChain.doFilter(request, response);
    }
}
```

---

## How to Test Your Work (Manoj)
1. Run `mvn spring-boot:run` — must start cleanly
2. No red underlines in IntelliJ
3. You cannot fully test the filter until Fahim builds SecurityConfig — but a clean build confirms the code compiles correctly

## What to Do If You Get an Error
- **`OncePerRequestFilter` shows red** → Missing Spring Security dependency in pom.xml. Tell Fahim.
- **`UserDetailsServiceImpl` shows red** → B S Aishwarya's file hasn't been pushed yet. Pull from dev again.
- **`JwtUtil` shows red** → Aishwarya DS's file hasn't been pushed yet. Pull from dev again.

## Git Instructions (Manoj)
```bash
git add backend_pat
git commit -m "feat: add JwtAuthFilter"
git push origin dev
```
Then message in the group: **"JwtAuthFilter pushed to dev ✅"**

---
---

# 👤 FAHIM (Team Lead) — SecurityConfig + AuthService + AuthController

## Your Responsibilities Today

### Part 1 — Monitor and Unblock (All day)
- Watch for pushes from all 4 team members
- After each push: pull dev, run `mvn spring-boot:run`, confirm clean build
- If anyone is stuck for more than 20 minutes: jump on a call with them

### Part 2 — Write SecurityConfig.java
**Wait until:** Manoj pushes JwtAuthFilter AND Aishwarya DS pushes JwtUtil  
Then pull dev and build this file.

---

## File 1 of 3 — `SecurityConfig.java`

**Where to create it:**  
`src/main/java/com/pat/backend_pat/config/SecurityConfig.java`

> This goes in the existing `config` package which is currently empty.

**Approach to write this with AI:**
```
I am building a Spring Boot 4 backend with JWT authentication.
Create a class called SecurityConfig 
inside package com.pat.backend_pat.config

Requirements:
- Annotate with @Configuration and @EnableWebSecurity
- Inject JwtAuthFilter using @RequiredArgsConstructor
  JwtAuthFilter is in package com.pat.backend_pat.security
- Define a BCryptPasswordEncoder @Bean method
- Define an AuthenticationManager @Bean method that takes AuthenticationConfiguration
- Define the main SecurityFilterChain @Bean method that:
    → Disables CSRF (not needed for REST APIs)
    → Enables CORS with default settings
    → Sets session management to STATELESS 
      (we use JWT, not server sessions)
    → Permits all requests to: /api/v1/auth/** without authentication
    → Requires authentication for all other requests
    → Adds JwtAuthFilter before UsernamePasswordAuthenticationFilter
- Use the lambda DSL style (Spring Security 6+ style)
- Use HttpSecurity, not WebSecurityConfigurerAdapter (that is deprecated)
```

**What the final file should look like:**
```java
package com.pat.backend_pat.config;

import com.pat.backend_pat.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

> ✅ **After writing this file:** Run `mvn spring-boot:run`.  
> The `Using generated security password` warning should now be GONE.  
> That warning disappearing confirms SecurityConfig is working correctly.

---

## File 2 of 3 — `AuthService.java`

**Wait until:** SecurityConfig builds cleanly. Then proceed.

**Where to create it:**  
`src/main/java/com/pat/backend_pat/service/AuthService.java`

> Create a new package `service` inside `com.pat.backend_pat` if it doesn't exist.

**Approach to write this with AI:**
```
I am building a Spring Boot 4 backend with JWT authentication.
Create a class called AuthService 
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- Inject these using @RequiredArgsConstructor:
    → UserRepository (com.pat.backend_pat.repository)
    → StudentRepository (com.pat.backend_pat.repository)
    → EmployerRepository (com.pat.backend_pat.repository)
    → PasswordEncoder (org.springframework.security.crypto.password)
    → JwtUtil (com.pat.backend_pat.security)
- User entity is in com.pat.backend_pat.entity — fields: email, passwordHash, role
- Student entity is in com.pat.backend_pat.entity
- Employer entity is in com.pat.backend_pat.entity — has field: approvedStatus (Boolean)
- DTOs are in com.pat.backend_pat.dto
- AuthResponse has fields: token, role, userId (Integer)

- Method 1: register(RegisterRequest request) returns AuthResponse
    Step 1: Check if email already exists using userRepository.existsByEmail()
            If yes: throw RuntimeException("Email already registered")
    Step 2: Create new User object, set email, set passwordHash using 
            passwordEncoder.encode(request.getPassword()), set role
    Step 3: Save user to database using userRepository.save()
    Step 4: If role equals "student" (case insensitive):
            Create new Student object, set the user field, save using studentRepository.save()
    Step 5: If role equals "employer" (case insensitive):
            Create new Employer object, set the user field, 
            set approvedStatus to false, save using employerRepository.save()
    Step 6: Generate JWT token using jwtUtil.generateToken(email, role)
    Step 7: Return new AuthResponse(token, role, savedUser.getUserId())

- Method 2: login(LoginRequest request) returns AuthResponse
    Step 1: Find user by email — if not found throw RuntimeException("User not found")
    Step 2: Use passwordEncoder.matches(rawPassword, hashedPassword) to verify password
            If does not match: throw RuntimeException("Invalid credentials")  
    Step 3: Generate JWT token using jwtUtil.generateToken(email, role)
    Step 4: Return new AuthResponse(token, user.getRole(), user.getUserId())

- Wrap both methods with @Transactional annotation
```

---

## File 3 of 3 — `AuthController.java`

**Wait until:** AuthService is written and the build is clean.

**Where to create it:**  
`src/main/java/com/pat/backend_pat/controller/AuthController.java`

> Create a new package `controller` inside `com.pat.backend_pat` if it doesn't exist.

**Approach to write this with AI:**
```
I am building a Spring Boot 4 REST API.
Create a class called AuthController 
inside package com.pat.backend_pat.controller

Requirements:
- Annotate with @RestController and @RequestMapping("/api/v1/auth")
- Inject AuthService using @RequiredArgsConstructor
- Endpoint 1: POST /register
    → Method name: register
    → Takes @Valid @RequestBody RegisterRequest
    → Calls authService.register(request)
    → Returns ResponseEntity with HTTP status 201 CREATED and the AuthResponse body
    → Wrap in try/catch: if RuntimeException, return 400 BAD REQUEST with the error message
- Endpoint 2: POST /login
    → Method name: login
    → Takes @Valid @RequestBody LoginRequest  
    → Calls authService.login(request)
    → Returns ResponseEntity with HTTP status 200 OK and the AuthResponse body
    → Wrap in try/catch: if RuntimeException, return 401 UNAUTHORIZED with the error message
- All DTOs are in com.pat.backend_pat.dto
```

---

## How to Test the Complete Auth Module (Fahim — Do This in Postman)

After AuthController is written and the build is clean, test all 4 scenarios in Postman:

**Test 1 — Register a Student**
```
POST http://localhost:8080/api/v1/auth/register
Body (JSON):
{
  "email": "student@test.com",
  "password": "test123",
  "role": "student"
}
Expected: 201 Created with token in response
```

**Test 2 — Register Same Email Again**
```
POST http://localhost:8080/api/v1/auth/register
Same body as Test 1
Expected: 400 Bad Request with "Email already registered" message
```

**Test 3 — Login Successfully**
```
POST http://localhost:8080/api/v1/auth/login
Body:
{
  "email": "student@test.com",
  "password": "test123"
}
Expected: 200 OK with token in response
```

**Test 4 — Login With Wrong Password**
```
POST http://localhost:8080/api/v1/auth/login
Body:
{
  "email": "student@test.com",
  "password": "wrongpassword"
}
Expected: 401 Unauthorized with "Invalid credentials" message
```

**Test 5 — Verify JWT Token**  
Copy the token from Test 3. Go to [jwt.io](https://jwt.io). Paste the token.  
You should see the email and role in the decoded payload.

**Test 6 — Access Protected Endpoint**
```
GET http://localhost:8080/api/v1/students/profile
No Authorization header
Expected: 403 Forbidden (proves SecurityConfig is working)
```

## Git Instructions (Fahim)
```bash
git add backend_pat
git commit -m "feat: complete auth module - SecurityConfig, AuthService, AuthController"
git push origin dev
```

---
---

# 🖥️ FRONTEND TEAM — Today's Tasks (Work in Full Parallel)

> Frontend team works completely independently today. You do not need the backend to be running.

---

## FE-1 — Project Setup

**Task:** Create the React project and set up the folder structure.

```bash
npx create-react-app pat-frontend
cd pat-frontend
npm install axios react-router-dom
npm start
```

Confirm: Browser opens `localhost:3000` with the default React page.

Then inside `src/` create these empty folders:
- `pages/`
- `components/`
- `services/`
- `context/`
- `utils/`

Push to dev when done.

---

## FE-2 — Auth Service + Auth Context

**Task:** Create `src/services/authService.js` and `src/context/AuthContext.js`

These are pure JavaScript files. No backend needed. Use dummy responses to test.

For `authService.js` — tell AI:
```
Create a JavaScript file called authService.js for a React app.
It should use axios to call a backend at http://localhost:8080/api/v1
Functions needed:
- register(email, password, role) → POST /auth/register
- login(email, password) → POST /auth/login
- saveToken(token, role, userId) → saves to localStorage
- getToken() → reads token from localStorage
- getRole() → reads role from localStorage
- logout() → removes token, role, userId from localStorage
Export all functions individually.
```

---

## FE-3 — Login and Register Pages

**Task:** Create `src/pages/LoginPage.jsx` and `src/pages/RegisterPage.jsx`

Pure UI only. No API calls yet. Just forms with useState.

For `LoginPage.jsx` — tell AI:
```
Create a React functional component called LoginPage.
- State: email (string), password (string), error (string)
- Renders a form with: email input, password input, submit button
- On submit: console.log the email and password for now (no API call yet)
- Shows error message in red below the form if error state is not empty
- Has a link at the bottom: "Don't have an account? Register"
- Use only inline styles or a basic CSS file — no external UI libraries
```

---

## 📌 End of Day — Definition of Done

Before ending today, confirm all of these to Fahim:

**Backend:**
- [ ] `dto/` package has 3 files: RegisterRequest, LoginRequest, AuthResponse
- [ ] `security/` package has 3 files: JwtUtil, UserDetailsServiceImpl, JwtAuthFilter
- [ ] `config/SecurityConfig.java` exists and `generated security password` warning is gone
- [ ] `service/AuthService.java` exists
- [ ] `controller/AuthController.java` exists
- [ ] All 6 Postman tests pass
- [ ] Everything pushed to `dev` branch

**Frontend:**
- [ ] React project created and runs on localhost:3000
- [ ] Folder structure created
- [ ] authService.js and AuthContext.js created
- [ ] LoginPage.jsx and RegisterPage.jsx created with UI

> **Only when ALL backend checkboxes are ticked, message me (Claude/Mentor) with the Postman test results. We will then decide tomorrow's tasks.**
