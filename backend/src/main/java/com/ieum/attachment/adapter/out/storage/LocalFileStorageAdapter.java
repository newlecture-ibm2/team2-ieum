package com.ieum.attachment.adapter.out.storage;

import com.ieum.attachment.application.port.out.FileStoragePort;
import com.ieum.global.exception.BusinessException;
import com.ieum.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 로컬 파일 저장소 어댑터 (Port OUT 구현체)
 * - 개발 환경에서는 로컬 디스크에 파일 저장
 * - 추후 S3Adapter 등으로 교체 가능 (인터페이스만 같으면 됨)
 */
@Component
public class LocalFileStorageAdapter implements FileStoragePort {

    private final Path rootLocation;

    public LocalFileStorageAdapter(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("업로드 디렉토리를 생성할 수 없습니다: " + uploadDir, e);
        }
    }

    @Override
    public String store(String targetType, Long targetId, MultipartFile file) {
        try {
            // 저장 경로: uploads/{targetType}/{UUID_원본파일명}
            Path targetDir = rootLocation.resolve(targetType.toLowerCase());
            Files.createDirectories(targetDir);

            String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destination = targetDir.resolve(storedName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            return destination.toString();
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패: " + file.getOriginalFilename(), e);
        }
    }

    @Override
    public Resource loadAsResource(String filePath) {
        try {
            Path file = Paths.get(filePath).toAbsolutePath().normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new BusinessException(ErrorCode.FILE_001, "기존 업로드 파일을 찾을 수 없습니다: " + filePath);
        } catch (MalformedURLException e) {
            throw new RuntimeException("잘못된 파일 경로: " + filePath, e);
        }
    }

    @Override
    public void delete(String filePath) {
        try {
            Path file = Paths.get(filePath);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("파일 삭제 실패: " + filePath, e);
        }
    }
}
