package com.college.cms.dto;

import com.college.cms.entity.Announcement;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

public class AnnouncementDto {

    @Data
    public static class Request {
        @NotBlank private String title;
        @NotBlank private String content;
        private Announcement.Priority priority = Announcement.Priority.NORMAL;
        private Long departmentId;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private String priority;
        private Long postedById;
        private String postedByName;
        private String postedByRole;
        private Long departmentId;
        private String departmentName;
        private LocalDateTime createdAt;

        public static Response from(Announcement a) {
            Response r = new Response();
            r.id = a.getId();
            r.title = a.getTitle();
            r.content = a.getContent();
            r.priority = a.getPriority().name();
            r.postedById = a.getPostedBy().getId();
            r.postedByName = a.getPostedBy().getFullName();
            r.postedByRole = a.getPostedBy().getRole().name();
            if (a.getDepartment() != null) {
                r.departmentId = a.getDepartment().getId();
                r.departmentName = a.getDepartment().getName();
            }
            r.createdAt = a.getCreatedAt();
            return r;
        }
    }
}
