package com.college.cms.controller;

import com.college.cms.dto.ApiResponse;
import com.college.cms.entity.Course;
import com.college.cms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                courseRepository.findAll().stream().map(this::toMap).collect(Collectors.toList())));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<?>> getByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(ApiResponse.success(
                courseRepository.findByDepartmentId(departmentId).stream()
                        .map(this::toMap).collect(Collectors.toList())));
    }

    private Map<String, Object> toMap(Course c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("name", c.getName());
        map.put("code", c.getCode());
        map.put("durationYears", c.getDurationYears());
        if (c.getDepartment() != null) {
            map.put("departmentId", c.getDepartment().getId());
            map.put("departmentName", c.getDepartment().getName());
        }
        return map;
    }
}
