package com.example.category.service;

import com.example.category.dto.CategoryCreateRequest;
import com.example.category.dto.CategoryDTO;
import com.example.category.dto.CategoryUpdateRequest;
import com.example.category.exception.CategoryNotFoundException;
import com.example.category.exception.DuplicateCategoryException;
import com.example.category.model.Category;
import com.example.category.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService implements ICategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateCategoryException("Category with name " + request.getName() + " already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setDescription(request.getDescription());
        category.setCommissionRate(request.getCommissionRate());

        Category savedCategory = categoryRepository.save(category);
        return mapToDTO(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllActive().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Integer id) {
        return categoryRepository.findByIdActive(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new CategoryNotFoundException("Category with ID " + id + " not found"));
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Integer id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findByIdActive(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category with ID " + id + " not found"));

        if (categoryRepository.existsByNameAndNotId(request.getName(), id)) {
            throw new DuplicateCategoryException("Category with name " + request.getName() + " already exists");
        }

        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setDescription(request.getDescription());
        category.setCommissionRate(request.getCommissionRate());

        Category updatedCategory = categoryRepository.save(category);
        return mapToDTO(updatedCategory);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findByIdActive(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category with ID " + id + " not found"));

        // Đánh dấu là đã xóa
        category.setDeletedAt(LocalDateTime.now());
        
        // Lập lịch xóa sau 7 ngày
        category.setScheduledDeletionAt(LocalDateTime.now().plusDays(7));
        
        categoryRepository.save(category);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllDeletedCategories() {
        return categoryRepository.findAllDeleted().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void restoreCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("Category with ID " + id + " not found"));
        
        if (category.getDeletedAt() == null) {
            throw new IllegalStateException("Category with ID " + id + " is not deleted");
        }
        
        // Khôi phục danh mục
        category.setDeletedAt(null);
        category.setScheduledDeletionAt(null);
        
        categoryRepository.save(category);
    }
    
    @Override
    @Transactional
    public void permanentlyDeleteScheduledCategories() {
        List<Category> categoriesToDelete = categoryRepository.findAllScheduledForDeletion(LocalDateTime.now());
        categoryRepository.deleteAll(categoriesToDelete);
    }

    private CategoryDTO mapToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setIcon(category.getIcon());
        dto.setDescription(category.getDescription());
        dto.setCommissionRate(category.getCommissionRate());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setDeletedAt(category.getDeletedAt());
        dto.setScheduledDeletionAt(category.getScheduledDeletionAt());
        
        // Kiểm tra nếu danh mục đã bị xóa
        boolean isDeleted = category.getDeletedAt() != null;
        dto.setDeleted(isDeleted);
        
        // Tính toán số ngày còn lại trước khi xóa vĩnh viễn
        if (isDeleted && category.getScheduledDeletionAt() != null) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime scheduledDeletion = category.getScheduledDeletionAt();
            
            // Nếu đã quá thời gian xóa thì trả về 0
            if (now.isAfter(scheduledDeletion)) {
                dto.setDaysUntilPermanentDeletion(0);
            } else {
                // Tính số ngày còn lại
                long daysUntil = java.time.Duration.between(now, scheduledDeletion).toDays();
                dto.setDaysUntilPermanentDeletion(daysUntil);
            }
        }
        
        return dto;
    }
}