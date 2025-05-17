package com.example.category.repository;

import com.example.category.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND c.id <> :id AND c.deletedAt IS NULL")
    boolean existsByNameAndNotId(String name, Integer id);

    @Query("SELECT c FROM Category c WHERE c.deletedAt IS NULL")
    List<Category> findAllActive();

    @Query("SELECT c FROM Category c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Category> findByIdActive(Integer id);

    // Tìm các danh mục đã bị xóa (soft delete)
    @Query("SELECT c FROM Category c WHERE c.deletedAt IS NOT NULL")
    List<Category> findAllDeleted();
    
    // Tìm các danh mục đến hạn xóa vĩnh viễn
    @Query("SELECT c FROM Category c WHERE c.scheduledDeletionAt IS NOT NULL AND c.scheduledDeletionAt <= :now")
    List<Category> findAllScheduledForDeletion(LocalDateTime now);
}