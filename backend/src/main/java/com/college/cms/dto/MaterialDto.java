package com.college.cms.dto;

import com.college.cms.entity.Material;
import lombok.Data;
import java.time.LocalDateTime;

public class MaterialDto {

    @Data
    public static class UploadRequest {
        private String title;
        private String description;
        private Material.MaterialType type;
        private Long subjectId;
        private Integer unitNumber;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private String type;
        private String fileName;
        private String fileSize;
        private Integer unitNumber;
        private Long downloadCount;
        private Long subjectId;
        private String subjectName;
        private String subjectCode;
        private Long uploadedById;
        private String uploadedByName;
        private LocalDateTime uploadedAt;

        public static Response from(Material m) {
            Response r = new Response();
            r.id = m.getId();
            r.title = m.getTitle();
            r.description = m.getDescription();
            r.type = m.getType().name();
            r.fileName = m.getFileName();
            r.fileSize = m.getFileSize();
            r.unitNumber = m.getUnitNumber();
            r.downloadCount = m.getDownloadCount();
            r.subjectId = m.getSubject().getId();
            r.subjectName = m.getSubject().getName();
            r.subjectCode = m.getSubject().getCode();
            r.uploadedById = m.getUploadedBy().getId();
            r.uploadedByName = m.getUploadedBy().getFullName();
            r.uploadedAt = m.getUploadedAt();
            return r;
        }
    }
}
