package com.college.cms.service;

import com.college.cms.dto.MaterialDto;
import com.college.cms.entity.Material;
import com.college.cms.entity.Subject;
import com.college.cms.entity.User;
import com.college.cms.exception.BadRequestException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.MaterialRepository;
import com.college.cms.repository.SubjectRepository;
import com.college.cms.repository.UserRepository;
import com.college.cms.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf", "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg", "image/png"
    );

    @Transactional
    public MaterialDto.Response uploadMaterial(MultipartFile file, MaterialDto.UploadRequest request, Long userId) {
        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new BadRequestException("File type not allowed. Allowed: PDF, PPT, DOC, images");

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", request.getSubjectId()));
        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        String subDir = "dept-" + subject.getCourse().getDepartment().getId()
                + "/sem-" + subject.getSemester()
                + "/subject-" + subject.getId();

        String storedPath = storageService.store(file, subDir);
        long fileSizeKb = file.getSize() / 1024;
        String fileSize = fileSizeKb > 1024
                ? String.format("%.1f MB", fileSizeKb / 1024.0)
                : fileSizeKb + " KB";

        Material material = Material.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .fileName(file.getOriginalFilename())
                .filePath(storedPath)
                .fileSize(fileSize)
                .mimeType(file.getContentType())
                .unitNumber(request.getUnitNumber())
                .subject(subject)
                .uploadedBy(uploader)
                .build();

        return MaterialDto.Response.from(materialRepository.save(material));
    }

    public Page<MaterialDto.Response> getMaterialsBySubject(Long subjectId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());
        return materialRepository.findBySubjectId(subjectId, pageable)
                .map(MaterialDto.Response::from);
    }

    public Page<MaterialDto.Response> searchMaterials(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());
        return materialRepository.searchMaterials(query, pageable)
                .map(MaterialDto.Response::from);
    }

    @Transactional
    public byte[] downloadMaterial(Long id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
        materialRepository.incrementDownloadCount(id);
        return storageService.load(material.getFilePath());
    }

    public MaterialDto.Response getMaterialById(Long id) {
        return MaterialDto.Response.from(materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id)));
    }

    @Transactional
    public MaterialDto.Response updateMaterial(Long id, MaterialDto.UploadRequest request, Long userId) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
        if (!material.getUploadedBy().getId().equals(userId))
            throw new BadRequestException("You can only edit your own materials");

        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setType(request.getType());
        material.setUnitNumber(request.getUnitNumber());
        material.setUpdatedAt(LocalDateTime.now());
        return MaterialDto.Response.from(materialRepository.save(material));
    }

    @Transactional
    public void deleteMaterial(Long id, Long userId, boolean isAdmin) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
        if (!isAdmin && !material.getUploadedBy().getId().equals(userId))
            throw new BadRequestException("You can only delete your own materials");

        storageService.delete(material.getFilePath());
        materialRepository.delete(material);
    }

    public List<MaterialDto.Response> getRecentMaterials(int limit) {
        return materialRepository.findRecentMaterials(PageRequest.of(0, limit))
                .stream().map(MaterialDto.Response::from).collect(Collectors.toList());
    }

    public String getMaterialFileName(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id))
                .getFileName();
    }

    public String getMaterialMimeType(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id))
                .getMimeType();
    }
}
