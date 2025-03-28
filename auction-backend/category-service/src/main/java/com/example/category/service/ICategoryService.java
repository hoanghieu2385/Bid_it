package com.example.category.service;

import com.example.category.dto.CategoryCreateRequest;
import com.example.category.dto.CategoryDTO;
import com.example.category.dto.CategoryUpdateRequest;

import java.util.List;

public interface ICategoryService {
    CategoryDTO createCategory(CategoryCreateRequest request);
    List<CategoryDTO> getAllCategories();
    CategoryDTO getCategoryById(Integer id);
    CategoryDTO updateCategory(Integer id, CategoryUpdateRequest request);
    void deleteCategory(Integer id);
}