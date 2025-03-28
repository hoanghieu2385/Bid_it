package com.example.category.service;

import com.example.category.dto.CategoryCreateRequest;
import com.example.category.dto.CategoryDTO;
import com.example.category.dto.CategoryUpdateRequest;
import com.example.category.exception.ResourceNotFoundException;
import com.example.category.model.Category;
import com.example.category.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService implements ICategoryService{
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryDTO createCategory(CategoryCreateRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setDescription(request.getDescription());
        category.setCommissionRate(request.getCommissionRate());
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        Category savedCategory = categoryRepository.save(category);
        return mapToDTO(savedCategory);
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllActive()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO getCategoryById(Integer id) {
        Category category = categoryRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToDTO(category);
    }

    @Override
    public CategoryDTO updateCategory(Integer id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setDescription(request.getDescription());
        category.setCommissionRate(request.getCommissionRate());
        category.setUpdatedAt(LocalDateTime.now());

        Category updatedCategory = categoryRepository.save(category);
        return mapToDTO(updatedCategory);
    }

    @Override
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        category.setDeletedAt(LocalDateTime.now());
        categoryRepository.save(category);
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
        return dto;
    }
}
