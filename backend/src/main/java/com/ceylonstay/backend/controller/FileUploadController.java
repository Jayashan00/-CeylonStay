package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Generic image upload endpoint used across the site: the admin settings
 * page (logo/favicon/hero image) and hotel owner forms (property/room
 * photos) all upload through here rather than requiring a pasted URL.
 *
 * Requires authentication (see SecurityConfig) — any logged-in user (guest,
 * hotel owner, or admin) can upload; access to *use* the resulting URL on a
 * given hotel/room/settings record is still controlled by the normal
 * ownership/role checks on those endpoints.
 */
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class FileUploadController {

    private static final List<String> ALLOWED_EXTENSIONS =
            List.of("jpg", "jpeg", "png", "webp", "gif", "svg", "ico");
    private static final long MAX_SIZE_BYTES = 8L * 1024 * 1024; // 8MB

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Value("${app.base-url}")
    private String baseUrl;

    @PostMapping
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException("No file was provided", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new ApiException("File is too large (max 8MB)", HttpStatus.BAD_REQUEST);
        }

        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = "";
        int dot = originalName.lastIndexOf('.');
        if (dot >= 0) {
            extension = originalName.substring(dot + 1).toLowerCase();
        }
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ApiException("Only image files are allowed (jpg, png, webp, gif, svg)", HttpStatus.BAD_REQUEST);
        }

        try {
            Path dirPath = Paths.get(uploadDir);
            Files.createDirectories(dirPath);

            String filename = UUID.randomUUID() + "." + extension;
            Path target = dirPath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String url = baseUrl + "/uploads/" + filename;
            return Map.of("url", url, "filename", filename);
        } catch (IOException e) {
            throw new ApiException("Could not save uploaded file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}