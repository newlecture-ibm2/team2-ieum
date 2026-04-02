package com.ieum.user.notification.adapter.out.persistence;

import com.ieum.user.notification.domain.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationJpaRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    /**
     * 전체 읽음 처리 — JPA 네이밍으로 벌크 UPDATE 불가하여 @Query 유지
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);

    /**
     * 개별 읽음 처리 — IN 절 벌크 UPDATE 불가하여 @Query 유지
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.id IN :ids")
    int markAsReadByIds(@Param("userId") Long userId, @Param("ids") List<Long> ids);
}
