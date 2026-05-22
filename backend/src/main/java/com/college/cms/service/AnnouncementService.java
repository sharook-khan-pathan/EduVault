package com.college.cms.service;

import com.college.cms.dto.AnnouncementDto;
import com.college.cms.entity.Announcement;
import com.college.cms.entity.User;
import com.college.cms.exception.BadRequestException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.AnnouncementRepository;
import com.college.cms.repository.DepartmentRepository;
import com.college.cms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public AnnouncementDto.Response create(AnnouncementDto.Request request, Long userId) {
        User poster = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .priority(request.getPriority())
                .postedBy(poster)
                .build();

        if (request.getDepartmentId() != null) {
            departmentRepository.findById(request.getDepartmentId())
                    .ifPresent(announcement::setDepartment);
        }

        return AnnouncementDto.Response.from(announcementRepository.save(announcement));
    }

    public Page<AnnouncementDto.Response> getForDepartment(Long deptId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return announcementRepository.findForDepartment(deptId, pageable)
                .map(AnnouncementDto.Response::from);
    }

    public Page<AnnouncementDto.Response> getGlobal(int page, int size) {
        return announcementRepository.findGlobalAnnouncements(PageRequest.of(page, size))
                .map(AnnouncementDto.Response::from);
    }

    public Page<AnnouncementDto.Response> getAll(int page, int size) {
        return announcementRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(AnnouncementDto.Response::from);
    }

    @Transactional
    public void delete(Long id, Long userId, boolean isAdmin) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        if (!isAdmin && !a.getPostedBy().getId().equals(userId))
            throw new BadRequestException("You can only delete your own announcements");
        announcementRepository.delete(a);
    }
}
