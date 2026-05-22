package com.college.cms.service;

import com.college.cms.dto.*;
import com.college.cms.entity.*;
import com.college.cms.exception.*;
import com.college.cms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final MaterialRepository materialRepository;
    private final PasswordEncoder passwordEncoder;

    // ===== DASHBOARD STATS =====
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", userRepository.countByRole(User.Role.STUDENT));
        stats.put("totalFaculty", userRepository.countByRole(User.Role.FACULTY));
        stats.put("totalDepartments", departmentRepository.count());
        stats.put("totalCourses", courseRepository.count());
        stats.put("totalSubjects", subjectRepository.count());
        stats.put("totalMaterials", materialRepository.countAllMaterials());
        stats.put("totalDownloads", materialRepository.sumAllDownloads());
        return stats;
    }

    // ===== DEPARTMENTS =====
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional
    public Department createDepartment(String name, String code, String description) {
        if (departmentRepository.existsByName(name)) throw new BadRequestException("Department already exists");
        return departmentRepository.save(Department.builder()
                .name(name).code(code).description(description).build());
    }

    @Transactional
    public Department updateDepartment(Long id, String name, String code, String description) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        dept.setName(name);
        dept.setCode(code);
        dept.setDescription(description);
        return departmentRepository.save(dept);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    // ===== COURSES =====
    public List<Map<String, Object>> getAllCourses() {
        return courseRepository.findAll().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("code", c.getCode());
            map.put("durationYears", c.getDurationYears());
            if (c.getDepartment() != null) {
                map.put("departmentId", c.getDepartment().getId());
                map.put("departmentName", c.getDepartment().getName());
                Map<String, Object> dept = new HashMap<>();
                dept.put("id", c.getDepartment().getId());
                dept.put("name", c.getDepartment().getName());
                map.put("department", dept);
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createCourse(String name, String code, Integer durationYears, Long departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
        Course c = courseRepository.save(Course.builder()
                .name(name).code(code).durationYears(durationYears).department(dept).build());
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("name", c.getName());
        map.put("code", c.getCode());
        map.put("durationYears", c.getDurationYears());
        map.put("departmentId", dept.getId());
        map.put("departmentName", dept.getName());
        return map;
    }

    // ===== SUBJECTS =====
    public Page<SubjectDto.Response> getAllSubjects(int page, int size) {
        return subjectRepository.findAll(PageRequest.of(page, size))
                .map(SubjectDto.Response::from);
    }

    @Transactional
    public SubjectDto.Response createSubject(SubjectDto.Request request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", request.getCourseId()));

        Subject subject = Subject.builder()
                .name(request.getName())
                .code(request.getCode())
                .semester(request.getSemester())
                .year(request.getYear())
                .totalUnits(request.getTotalUnits())
                .course(course)
                .build();

        if (request.getFacultyId() != null) {
            User faculty = userRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty", request.getFacultyId()));
            subject.setFaculty(faculty);
        }

        return SubjectDto.Response.from(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectDto.Response assignFaculty(Long subjectId, Long facultyId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", subjectId));
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", facultyId));
        subject.setFaculty(faculty);
        return SubjectDto.Response.from(subjectRepository.save(subject));
    }

    // ===== USERS =====
    @Transactional
    public Map<String, Object> createUser(AuthDto.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new BadRequestException("Username already taken");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already registered");

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .ifPresent(user::setDepartment);
        }

        User saved = userRepository.save(user);
        return Map.of("id", saved.getId(), "username", saved.getUsername(),
                "role", saved.getRole(), "message", "User created successfully");
    }

    public Page<Map<String, Object>> getUsersByRole(User.Role role, int page, int size) {
        return userRepository.findByRole(role, PageRequest.of(page, size))
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("username", u.getUsername());
                    map.put("email", u.getEmail());
                    map.put("fullName", u.getFullName());
                    map.put("phone", u.getPhone());
                    map.put("role", u.getRole());
                    map.put("active", u.isActive());
                    map.put("department", u.getDepartment() != null ? u.getDepartment().getName() : null);
                    map.put("createdAt", u.getCreatedAt());
                    return map;
                });
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
}
