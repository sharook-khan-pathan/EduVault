package com.college.cms.repository;

import com.college.cms.entity.Material;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    Page<Material> findBySubjectId(Long subjectId, Pageable pageable);
    List<Material> findBySubjectIdAndType(Long subjectId, Material.MaterialType type);
    List<Material> findByUploadedById(Long userId);

    @Query("SELECT m FROM Material m WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Material> searchMaterials(String query, Pageable pageable);

    @Query("SELECT m FROM Material m WHERE m.subject.course.department.id = :deptId ORDER BY m.uploadedAt DESC")
    Page<Material> findByDepartmentId(Long deptId, Pageable pageable);

    @Modifying
    @Query("UPDATE Material m SET m.downloadCount = m.downloadCount + 1 WHERE m.id = :id")
    void incrementDownloadCount(Long id);

    @Query("SELECT COUNT(m) FROM Material m")
    long countAllMaterials();

    @Query("SELECT SUM(m.downloadCount) FROM Material m")
    Long sumAllDownloads();

    // Recently uploaded - last 10
    @Query("SELECT m FROM Material m ORDER BY m.uploadedAt DESC")
    List<Material> findRecentMaterials(Pageable pageable);
}
