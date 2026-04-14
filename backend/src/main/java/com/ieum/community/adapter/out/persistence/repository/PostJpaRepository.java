package com.ieum.community.adapter.out.persistence.repository;

import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PostJpaRepository extends JpaRepository<PostEntity, Long> {

       @Query("SELECT p FROM PostEntity p WHERE " +
                     "p.status = 'ACTIVE' AND " +
                     "p.authorId NOT IN (SELECT u.userId FROM com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity u WHERE u.status = 'DELETED') AND " +
                     "(:category IS NULL OR p.category = :category) AND " +
                     "(:areaCode IS NULL OR p.areaCode = :areaCode) AND " +
                     "(:keyword IS NULL OR p.title LIKE %:keyword% OR p.content LIKE %:keyword%)")
       Page<PostEntity> findByFilters(
                     @Param("category") String category,
                     @Param("areaCode") String areaCode,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       @Query("SELECT p FROM PostEntity p WHERE " +
                     "p.status = 'ACTIVE' AND " +
                     "p.authorId NOT IN (SELECT u.userId FROM com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity u WHERE u.status = 'DELETED') AND " +
                     "(:category IS NULL OR p.category = :category) AND " +
                     "(:areaCode IS NULL OR p.areaCode = :areaCode) AND " +
                     "(:keyword IS NULL OR p.title LIKE %:keyword%)")
       Page<PostEntity> findByFiltersTitle(
                     @Param("category") String category,
                     @Param("areaCode") String areaCode,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       @Query("SELECT p FROM PostEntity p WHERE " +
                     "p.status = 'ACTIVE' AND " +
                     "p.authorId NOT IN (SELECT u.userId FROM com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity u WHERE u.status = 'DELETED') AND " +
                     "(:category IS NULL OR p.category = :category) AND " +
                     "(:areaCode IS NULL OR p.areaCode = :areaCode) AND " +
                     "(:keyword IS NULL OR p.content LIKE %:keyword%)")
       Page<PostEntity> findByFiltersContent(
                     @Param("category") String category,
                     @Param("areaCode") String areaCode,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       @Query("SELECT p FROM PostEntity p WHERE p.id = :id AND p.status = 'ACTIVE' AND p.authorId NOT IN (SELECT u.userId FROM com.ieum.user.auth.adapter.out.persistence.entity.UserJpaEntity u WHERE u.status = 'DELETED')")
       java.util.Optional<PostEntity> findActiveById(@Param("id") Long id);

       /**
        * 사용자 ID 목록으로 최신 닉네임과 프로필 이미지를 일괄 조회 (users 테이블 실시간 참조)
        * 반환: [user_id, nickname, profile_image] 배열 리스트
        */
       @Query(value = "SELECT user_id, nickname, profile_image FROM users WHERE user_id IN :ids", nativeQuery = true)
       List<Object[]> findUserInfoByUserIds(@Param("ids") Collection<Long> ids);
}
