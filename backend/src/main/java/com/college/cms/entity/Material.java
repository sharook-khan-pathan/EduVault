package com.college.cms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType type;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String fileSize;
    private String mimeType;

    private Integer unitNumber;

    @Builder.Default
    private Long downloadCount = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public enum MaterialType {
        PDF, PPT, DOC, ASSIGNMENT, LAB_MANUAL, PREVIOUS_PAPER, OTHER
    }
}
