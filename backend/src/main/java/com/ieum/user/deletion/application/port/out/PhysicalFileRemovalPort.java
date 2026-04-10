package com.ieum.user.deletion.application.port.out;

public interface PhysicalFileRemovalPort {
    // Optional: 1차 구현 시 아무 작업도 하지 않거나 비워둠 (no-op)
    // 2차 구현 시 이 곳에서 S3 / Local Storage 의 파일 폐기를 호출함
    void deleteFilesFromStorage(Long userId);
}
