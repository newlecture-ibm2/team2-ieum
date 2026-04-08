package com.ieum.community.adapter.out.persistence.repository;

import com.ieum.community.adapter.out.persistence.entity.PostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostJpaRepository extends JpaRepository<PostEntity, Long> {

       @Query("SELECT p FROM PostEntity p WHERE " +
                     "p.status = 'ACTIVE' AND " +
                     "(:category IS NULL OR p.category = :category) AND " +
                     "(:areaCode IS NULL OR p.areaCode = :areaCode) AND " +
                     "(:keyword IS NULL OR p.title LIKE %:keyword% OR p.content LIKE %:keyword%)")
       Page<PostEntity> findByFilters(
                     @Param("category") String category,
                     @Param("areaCode") String areaCode,
                     @Param("keyword") String keyword,
                     Pageable pageable);

       @Query("SELECT p FROM PostEntity p WHERE p.id = :id AND p.status = 'ACTIVE'")
       java.util.Optional<PostEntity> findActiveById(@Param("id") Long id);
}
