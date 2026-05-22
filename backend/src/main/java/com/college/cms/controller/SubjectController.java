package com.college.cms.controller;

import com.college.cms.dto.ApiResponse;
import com.college.cms.dto.SubjectDto;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.SubjectRepository;
import com.college.cms.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectRepository subjectRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                subjectRepository.findAll().stream()
                        .map(SubjectDto.Response::from).collect(Collectors.toList())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                SubjectDto.Response.from(subjectRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Subject", id)))));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<?>> getByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(
                subjectRepository.findByCourseId(courseId).stream()
                        .map(SubjectDto.Response::from).collect(Collectors.toList())));
    }

    @GetMapping("/course/{courseId}/semester/{semester}")
    public ResponseEntity<ApiResponse<?>> getByCourseAndSemester(
            @PathVariable Long courseId, @PathVariable Integer semester) {
        return ResponseEntity.ok(ApiResponse.success(
                subjectRepository.findByCourseIdAndSemester(courseId, semester).stream()
                        .map(SubjectDto.Response::from).collect(Collectors.toList())));
    }

    @GetMapping("/my-subjects")
    public ResponseEntity<ApiResponse<?>> getMySubjects(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success(
                subjectRepository.findByFacultyId(user.getId()).stream()
                        .map(SubjectDto.Response::from).collect(Collectors.toList())));
    }
}
