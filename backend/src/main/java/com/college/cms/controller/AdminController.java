package com.college.cms.controller;

import com.college.cms.dto.*;
import com.college.cms.entity.User;
import com.college.cms.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ===== DEPARTMENTS =====
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<?>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllDepartments()));
    }

    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<?>> createDepartment(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Department created",
                adminService.createDepartment(body.get("name"), body.get("code"), body.get("description"))));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<?>> updateDepartment(@PathVariable Long id,
                                                            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Department updated",
                adminService.updateDepartment(id, body.get("name"), body.get("code"), body.get("description"))));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        adminService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted", null));
    }

    // ===== COURSES =====
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<?>> getCourses() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllCourses()));
    }

    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<?>> createCourse(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.success("Course created",
                adminService.createCourse(
                        (String) body.get("name"),
                        (String) body.get("code"),
                        (Integer) body.get("durationYears"),
                        Long.valueOf(body.get("departmentId").toString()))));
    }

    // ===== SUBJECTS =====
    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<?>> getSubjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllSubjects(page, size)));
    }

    @PostMapping("/subjects")
    public ResponseEntity<ApiResponse<?>> createSubject(@Valid @RequestBody SubjectDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Subject created", adminService.createSubject(request)));
    }

    @PutMapping("/subjects/{subjectId}/assign-faculty/{facultyId}")
    public ResponseEntity<ApiResponse<?>> assignFaculty(@PathVariable Long subjectId,
                                                         @PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success("Faculty assigned",
                adminService.assignFaculty(subjectId, facultyId)));
    }

    // ===== USERS =====
    @PostMapping("/users")
    public ResponseEntity<ApiResponse<?>> createUser(@Valid @RequestBody AuthDto.RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User created", adminService.createUser(request)));
    }

    @GetMapping("/users/students")
    public ResponseEntity<ApiResponse<?>> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsersByRole(User.Role.STUDENT, page, size)));
    }

    @GetMapping("/users/faculty")
    public ResponseEntity<ApiResponse<?>> getFaculty(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUsersByRole(User.Role.FACULTY, page, size)));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        adminService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }
}
