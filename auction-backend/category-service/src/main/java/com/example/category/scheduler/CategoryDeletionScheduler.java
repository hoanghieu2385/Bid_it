package com.example.category.scheduler;

import com.example.category.service.ICategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CategoryDeletionScheduler {
    private static final Logger logger = LoggerFactory.getLogger(CategoryDeletionScheduler.class);
    
    private final ICategoryService categoryService;

    public CategoryDeletionScheduler(ICategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Chạy hàng ngày vào lúc 1 giờ sáng
    @Scheduled(cron = "0 0 1 * * ?")
    public void deletePermanentlyScheduledCategories() {
        logger.info("Starting the scheduled task to delete permanently scheduled categories...");
        categoryService.permanentlyDeleteScheduledCategories();
        logger.info("Completed the scheduled task to delete permanently scheduled categories.");
    }
}