package com.college.cms.dto;

import com.college.cms.entity.Subject;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class SubjectDto {

    @Data
    public static class Request {
        @NotBlank private String name;
        private String code;
        @NotNull private Integer semester;
        @NotNull private Integer year;
        private Integer totalUnits;
        @NotNull private Long courseId;
        private Long facultyId;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String code;
        private Integer semester;
        private Integer year;
        private Integer totalUnits;
        private Long courseId;
        private String courseName;
        private Long departmentId;
        private String departmentName;
        private Long facultyId;
        private String facultyName;
        private int materialCount;

        public static Response from(Subject s) {
            Response r = new Response();
            r.id = s.getId();
            r.name = s.getName();
            r.code = s.getCode();
            r.semester = s.getSemester();
            r.year = s.getYear();
            r.totalUnits = s.getTotalUnits();
            r.courseId = s.getCourse().getId();
            r.courseName = s.getCourse().getName();
            r.departmentId = s.getCourse().getDepartment().getId();
            r.departmentName = s.getCourse().getDepartment().getName();
            if (s.getFaculty() != null) {
                r.facultyId = s.getFaculty().getId();
                r.facultyName = s.getFaculty().getFullName();
            }
            r.materialCount = s.getMaterials() != null ? s.getMaterials().size() : 0;
            return r;
        }
    }
}
