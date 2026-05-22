package com.college.cms.storage;

import com.college.cms.exception.BadRequestException;
import com.college.cms.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * Local filesystem storage implementation.
 * To switch to AWS S3, create an S3StorageService implementing StorageService
 * and annotate it with @Primary or use @Profile("s3").
 */
@Service
public class LocalStorageService implements StorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    @Override
    public String store(MultipartFile file, String subDirectory) {
        if (file.isEmpty()) throw new BadRequestException("Cannot store empty file");
        if (file.getSize() > MAX_FILE_SIZE) throw new BadRequestException("File size exceeds 50MB limit");

        try {
            Path uploadPath = Paths.get(uploadDir, subDirectory);
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String storedFileName = UUID.randomUUID() + extension;

            Path destination = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            return subDirectory + "/" + storedFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public byte[] load(String filePath) {
        try {
            Path path = Paths.get(uploadDir, filePath);
            if (!Files.exists(path)) throw new ResourceNotFoundException("File not found: " + filePath);
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage());
        }
    }

    @Override
    public void delete(String filePath) {
        try {
            Path path = Paths.get(uploadDir, filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    @Override
    public String getFileUrl(String filePath) {
        return "/api/files/download/" + filePath;
    }
}
