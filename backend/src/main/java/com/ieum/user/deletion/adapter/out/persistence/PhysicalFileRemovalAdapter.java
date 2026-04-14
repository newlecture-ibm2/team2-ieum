package com.ieum.user.deletion.adapter.out.persistence;

import com.ieum.user.deletion.application.port.out.PhysicalFileRemovalPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class PhysicalFileRemovalAdapter implements PhysicalFileRemovalPort {

    @Override
    public void deleteFilesFromStorage(Long userId) {
        log.info("[PhysicalFileRemovalAdapter] S3/로컬 정적 파일 삭제 로직은 스킵합니다. (userId: {})", userId);
    }
}
