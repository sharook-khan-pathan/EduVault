package com.college.cms.config;

import com.college.cms.entity.*;
import com.college.cms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByUsername("admin")) {
            log.info("Data already initialized, skipping...");
            return;
        }

        log.info("Initializing sample data...");

        // Create Admin
        User admin = userRepository.save(User.builder()
                .username("admin").password(passwordEncoder.encode("admin123"))
                .email("admin@college.edu").fullName("System Administrator")
                .role(User.Role.ADMIN).build());

        // Create Departments
        Department csDept = departmentRepository.save(Department.builder()
                .name("Computer Science").code("CS").description("Computer Science & Engineering").build());
        Department ecDept = departmentRepository.save(Department.builder()
                .name("Electronics").code("EC").description("Electronics & Communication").build());

        // Create Courses
        Course btech = courseRepository.save(Course.builder()
                .name("B.Tech Computer Science").code("BTCS").durationYears(4).department(csDept).build());

        // Create Faculty
        User faculty = userRepository.save(User.builder()
                .username("faculty1").password(passwordEncoder.encode("faculty123"))
                .email("faculty1@college.edu").fullName("Dr. Rajesh Kumar")
                .role(User.Role.FACULTY).department(csDept).build());

        // Create Student
        userRepository.save(User.builder()
                .username("student1").password(passwordEncoder.encode("student123"))
                .email("student1@college.edu").fullName("Priya Sharma")
                .role(User.Role.STUDENT).department(csDept).build());

        // Create Subjects
        subjectRepository.save(Subject.builder()
                .name("Data Structures").code("CS301").semester(3).year(2)
                .totalUnits(5).course(btech).faculty(faculty).build());
        subjectRepository.save(Subject.builder()
                .name("Database Management Systems").code("CS302").semester(3).year(2)
                .totalUnits(5).course(btech).faculty(faculty).build());
        subjectRepository.save(Subject.builder()
                .name("Operating Systems").code("CS401").semester(4).year(2)
                .totalUnits(5).course(btech).faculty(faculty).build());

        log.info("Sample data initialized successfully!");
        log.info("Admin: admin / admin123");
        log.info("Faculty: faculty1 / faculty123");
        log.info("Student: student1 / student123");
    }
}
