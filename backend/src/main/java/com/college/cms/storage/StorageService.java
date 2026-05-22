package com.college.cms.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /**
     * Store a file and return its stored path/key
     */
    String store(MultipartFile file, String subDirectory);

    /**
     * Load file as byte array for download
     */
    byte[] load(String filePath);

    /**
     * Delete a file by its path/key
     */
    void delete(String filePath);

    /**
     * Get the public URL or download path for a file
     */
    String getFileUrl(String filePath);
}
