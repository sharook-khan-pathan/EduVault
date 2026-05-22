package com.college.cms.repository;

import com.college.cms.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByCourseId(Long courseId);
    List<Subject> findByCourseIdAndSemester(Long courseId, Integer semester);
    List<Subject> findByFacultyId(Long facultyId);

    @Query("SELECT s FROM Subject s WHERE s.course.department.id = :deptId AND s.semester = :semester")
    List<Subject> findByDepartmentAndSemester(Long deptId, Integer semester);

    @Query("SELECT s FROM Subject s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Subject> searchByName(String query, Pageable pageable);
}
