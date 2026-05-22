package com.college.cms.repository;

import com.college.cms.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // Global + department-specific announcements for a student
    @Query("SELECT a FROM Announcement a WHERE a.active = true AND (a.department IS NULL OR a.department.id = :deptId) ORDER BY a.createdAt DESC")
    Page<Announcement> findForDepartment(Long deptId, Pageable pageable);

    // All global announcements
    @Query("SELECT a FROM Announcement a WHERE a.active = true AND a.department IS NULL ORDER BY a.createdAt DESC")
    Page<Announcement> findGlobalAnnouncements(Pageable pageable);

    Page<Announcement> findByPostedById(Long userId, Pageable pageable);
}
