package com.college.cms.controller;

import com.college.cms.dto.ApiResponse;
import com.college.cms.dto.MaterialDto;
import com.college.cms.entity.Material;
import com.college.cms.security.UserDetailsImpl;
import com.college.cms.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaterialDto.Response>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("type") Material.MaterialType type,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam(value = "unitNumber", required = false) Integer unitNumber,
            @AuthenticationPrincipal UserDetailsImpl user) {

        MaterialDto.UploadRequest request = new MaterialDto.UploadRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setType(type);
        request.setSubjectId(subjectId);
        request.setUnitNumber(unitNumber);

        return ResponseEntity.ok(ApiResponse.success("Material uploaded successfully",
                materialService.uploadMaterial(file, request, user.getId())));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<?>> getBySubject(
            @PathVariable Long subjectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                materialService.getMaterialsBySubject(subjectId, page, size)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                materialService.searchMaterials(query, page, size)));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<?>> getRecent(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(materialService.getRecentMaterials(limit)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaterialDto.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(materialService.getMaterialById(id)));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        byte[] data = materialService.downloadMaterial(id);
        String fileName = materialService.getMaterialFileName(id);
        String mimeType = materialService.getMaterialMimeType(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType != null ? mimeType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(data);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaterialDto.Response>> update(
            @PathVariable Long id,
            @RequestBody MaterialDto.UploadRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success("Material updated",
                materialService.updateMaterial(id, request, user.getId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        materialService.deleteMaterial(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Material deleted", null));
    }
}
