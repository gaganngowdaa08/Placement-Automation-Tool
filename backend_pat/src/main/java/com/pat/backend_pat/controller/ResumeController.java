package com.pat.backend_pat.controller;

import com.pat.backend_pat.entity.ResumeRecord;
import com.pat.backend_pat.entity.StudentProfile;
import com.pat.backend_pat.entity.UserAccount;
import com.pat.backend_pat.repository.ResumeRepository;
import com.pat.backend_pat.repository.StudentProfileRepository;
import com.pat.backend_pat.repository.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/students/me/resume")
@PreAuthorize("hasRole('STUDENT')")
public class ResumeController {
    private final UserRepository users;
    private final StudentProfileRepository students;
    private final ResumeRepository resumes;
    private final Path uploadDirectory;

    public ResumeController(UserRepository users, StudentProfileRepository students, ResumeRepository resumes,
                            @Value("${app.upload-dir:uploads/resumes}") String uploadDirectory) {
        this.users = users; this.students = students; this.resumes = resumes; this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    @GetMapping
    public List<ResumeResponse> list(Principal principal) {
        StudentProfile student = currentStudent(principal);
        return resumes.findByStudentIdOrderByUploadedAtDesc(student.getStudentId()).stream()
                .map(r -> new ResumeResponse(r.getResumeId(), displayName(r), r.getUploadedAt(), Boolean.TRUE.equals(r.getIsDefault()))).toList();
    }

    @GetMapping("/{resumeId}/file")
    public ResponseEntity<Resource> viewOwnResume(Principal principal, @PathVariable Integer resumeId) throws IOException {
        StudentProfile student = currentStudent(principal);
        ResumeRecord resume = resumes.findById(resumeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found."));
        if (!student.getStudentId().equals(resume.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view resumes uploaded by your own account.");
        }
        if (resume.getResumeFile() == null || resume.getResumeFile().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The resume file is unavailable.");
        }
        Path path = Path.of(resume.getResumeFile()).toAbsolutePath().normalize();
        if (!path.startsWith(uploadDirectory) || !Files.isRegularFile(path) || !Files.isReadable(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The saved resume file could not be found. Please upload it again.");
        }
        Resource resource = new UrlResource(path.toUri());
        String safeName = Path.of(displayName(resume)).getFileName().toString();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(safeName).build().toString())
                .body(resource);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResumeResponse upload(Principal principal, @RequestPart("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Choose a PDF file to upload.");
        String original = file.getOriginalFilename() == null ? "resume.pdf" : Path.of(file.getOriginalFilename()).getFileName().toString();
        if (!original.toLowerCase().endsWith(".pdf") || (file.getContentType() != null && !file.getContentType().equalsIgnoreCase("application/pdf")))
            throw new IllegalArgumentException("Only PDF resumes are supported.");
        if (file.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("Resume size must be 5 MB or less.");

        StudentProfile student = currentStudent(principal);
        Files.createDirectories(uploadDirectory);
        String storedName = UUID.randomUUID() + ".pdf";
        Path target = uploadDirectory.resolve(storedName).normalize();
        if (!target.startsWith(uploadDirectory)) throw new IllegalArgumentException("Invalid upload path.");
        file.transferTo(target);

        List<ResumeRecord> previous = resumes.findByStudentIdOrderByUploadedAtDesc(student.getStudentId());
        previous.forEach(r -> r.setIsDefault(false));
        resumes.saveAll(previous);
        ResumeRecord record = new ResumeRecord();
        record.setStudentId(student.getStudentId());
        record.setResumeFile(target.toString());
        record.setOriginalFileName(original);
        record.setIsDefault(true);
        ResumeRecord saved = resumes.save(record);
        return new ResumeResponse(saved.getResumeId(), original, LocalDateTime.now(), true);
    }

    private StudentProfile currentStudent(Principal principal) {
        UserAccount user = users.findByEmailIgnoreCase(principal.getName()).orElseThrow(() -> new IllegalArgumentException("Account not found."));
        return students.findByUserId(user.getUserId()).orElseThrow(() -> new IllegalArgumentException("Student profile not found."));
    }
    private static String displayName(ResumeRecord record) {
        if (record.getOriginalFileName() != null && !record.getOriginalFileName().isBlank()) return record.getOriginalFileName();
        return record.getResumeFile() == null ? "Resume" : Path.of(record.getResumeFile()).getFileName().toString();
    }
    public record ResumeResponse(Integer resumeId, String fileName, LocalDateTime uploadedAt, boolean isDefault) {}
}
