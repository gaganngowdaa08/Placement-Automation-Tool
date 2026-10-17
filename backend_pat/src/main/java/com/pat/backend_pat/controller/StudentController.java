package com.pat.backend_pat.controller;

import com.pat.backend_pat.entity.StudentAcademic;
import com.pat.backend_pat.entity.StudentProfile;
import com.pat.backend_pat.entity.UserAccount;
import com.pat.backend_pat.repository.StudentAcademicRepository;
import com.pat.backend_pat.repository.StudentProfileRepository;
import com.pat.backend_pat.repository.UserRepository;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students/me")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {
    private final UserRepository userRepository;
    private final StudentProfileRepository studentRepository;
    private final StudentAcademicRepository academicRepository;

    public StudentController(UserRepository userRepository, StudentProfileRepository studentRepository,
                             StudentAcademicRepository academicRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.academicRepository = academicRepository;
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile(Principal principal) {
        UserAccount user = currentUser(principal);
        StudentProfile student = currentStudent(user);
        return new ProfileResponse(student.getFullName(), user.getEmail(), student.getPhoneNumber(),
                student.getLinkedinUrl(), student.getAddress(), student.getGithubUrl());
    }

    @PutMapping("/profile")
    @Transactional
    public ProfileResponse saveProfile(Principal principal, @RequestBody ProfileRequest request) {
        UserAccount user = currentUser(principal);
        StudentProfile student = currentStudent(user);
        student.setFullName(clean(request.name()));
        student.setPhoneNumber(clean(request.phone()));
        student.setLinkedinUrl(clean(request.linkedin()));
        student.setAddress(clean(request.address()));
        student.setGithubUrl(clean(request.github()));
        studentRepository.save(student);
        return new ProfileResponse(student.getFullName(), user.getEmail(), student.getPhoneNumber(),
                student.getLinkedinUrl(), student.getAddress(), student.getGithubUrl());
    }

    @GetMapping("/academic")
    public AcademicResponse getAcademic(Principal principal) {
        StudentProfile student = currentStudent(currentUser(principal));
        StudentAcademic academic = academicRepository.findByStudentId(student.getStudentId()).orElseGet(StudentAcademic::new);
        return academicResponse(student, academic);
    }

    @PutMapping("/academic")
    @Transactional
    public AcademicResponse saveAcademic(Principal principal, @RequestBody AcademicRequest request) {
        StudentProfile student = currentStudent(currentUser(principal));
        student.setCollegeName(clean(request.collegeName()));
        student.setBranch(clean(request.branch()));
        student.setUsn(clean(request.usn()));
        student.setCgpa(decimal(request.cgpa(), "CGPA"));
        student.setBacklogCount(integer(request.backlogs(), "Backlogs"));
        student.setPassingYear(integer(request.passingYear(), "Passing year"));
        student.setSkills(clean(request.skills()));
        student.setProjects(clean(request.projects()));
        studentRepository.save(student);

        StudentAcademic academic = academicRepository.findByStudentId(student.getStudentId()).orElseGet(StudentAcademic::new);
        academic.setStudentId(student.getStudentId());
        academic.setDegree(clean(request.degree()));
        academic.setSemester(integer(request.semester(), "Semester"));
        academic.setTenth(decimalDouble(request.tenth(), "10th percentage"));
        academic.setTwelfth(decimalDouble(request.twelfth(), "12th percentage"));
        academic.setCertifications(clean(request.certifications()));
        academicRepository.save(academic);
        return academicResponse(student, academic);
    }

    private UserAccount currentUser(Principal principal) {
        return userRepository.findByEmailIgnoreCase(principal.getName()).orElseThrow(() -> new IllegalArgumentException("Account not found."));
    }
    private StudentProfile currentStudent(UserAccount user) {
        return studentRepository.findByUserId(user.getUserId()).orElseThrow(() -> new IllegalArgumentException("Student profile not found."));
    }
    private AcademicResponse academicResponse(StudentProfile s, StudentAcademic a) {
        return new AcademicResponse(a.getDegree(), s.getCollegeName(), s.getBranch(), s.getUsn(), str(a.getSemester()), str(s.getCgpa()),
                str(a.getTenth()), str(a.getTwelfth()), str(s.getBacklogCount()), str(s.getPassingYear()), s.getSkills(), s.getProjects(), a.getCertifications());
    }
    private static String clean(String s) { return s == null || s.isBlank() ? null : s.trim(); }
    private static String str(Object value) { return value == null ? "" : value.toString(); }
    private static Integer integer(String raw, String label) {
        String value = clean(raw); if (value == null) return null;
        try { return Integer.valueOf(value); } catch (NumberFormatException e) { throw new IllegalArgumentException(label + " must be a whole number."); }
    }
    private static BigDecimal decimal(String raw, String label) {
        String value = clean(raw); if (value == null) return null;
        try { return new BigDecimal(value); } catch (NumberFormatException e) { throw new IllegalArgumentException(label + " must be a valid number."); }
    }
    private static Double decimalDouble(String raw, String label) {
        String value = clean(raw); if (value == null) return null;
        try { double d = Double.parseDouble(value); if (d < 0 || d > 100) throw new NumberFormatException(); return d; }
        catch (NumberFormatException e) { throw new IllegalArgumentException(label + " must be between 0 and 100."); }
    }

    public record ProfileRequest(String name, String phone, String linkedin, String address, String github) {}
    public record ProfileResponse(String name, String email, String phone, String linkedin, String address, String github) {}
    public record AcademicRequest(String degree, String collegeName, String branch, String usn, String semester, String cgpa,
                                  String tenth, String twelfth, String backlogs, String passingYear,
                                  String skills, String projects, String certifications) {}
    public record AcademicResponse(String degree, String collegeName, String branch, String usn, String semester, String cgpa,
                                   String tenth, String twelfth, String backlogs, String passingYear,
                                   String skills, String projects, String certifications) {}
}
