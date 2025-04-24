package com.example.auction.validator;

import com.example.auction.dto.AuctionRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDateTime;

public class AuctionTimeValidator implements ConstraintValidator<ValidAuctionTime, AuctionRequestDTO> {

    private long minGapMinutes;

    @Override
    public void initialize(ValidAuctionTime constraintAnnotation) {
        this.minGapMinutes = constraintAnnotation.minGapMinutes();
        System.out.println("✅ AuctionTimeValidator initialized with minGapMinutes = " + minGapMinutes);
    }

    @Override
    public boolean isValid(AuctionRequestDTO auctionRequest, ConstraintValidatorContext context) {
        System.out.println("🔍 AuctionTimeValidator is running!");

        if (auctionRequest == null) {
            System.out.println("❌ auctionRequest is null");
            return true;
        }

        System.out.println("➡️  startTime: " + auctionRequest.getStartTime());
        System.out.println("➡️  endTime: " + auctionRequest.getEndTime());

        if (auctionRequest.getStartTime() == null || auctionRequest.getEndTime() == null) {
            return true;
        }

        return auctionRequest.getEndTime().isAfter(auctionRequest.getStartTime().plusMinutes(minGapMinutes));
    }

    // Temporary commented out to test what data is being received by the DTO
//    @Override
//    public boolean isValid(AuctionRequestDTO auctionRequest, ConstraintValidatorContext context) {
//        System.out.println("🔍 AuctionTimeValidator is running!");
//
//        if (auctionRequest == null) {
//            return true; // Let @NotNull handle it
//        }
//
//        LocalDateTime start = auctionRequest.getStartTime();
//        LocalDateTime end = auctionRequest.getEndTime();
//
//        if (start == null || end == null) {
//            return true; // Let field-level @NotNull handle this
//        }
//
//        // Check the time gap
//        LocalDateTime minEndTime = start.plusMinutes(minGapMinutes);
//        if (end.isAfter(minEndTime)) {
//            return true;
//        }
//
//        // Build custom error message
//        context.disableDefaultConstraintViolation();
//        context.buildConstraintViolationWithTemplate(
//                "endTime must be at least " + minGapMinutes + " minutes after startTime"
//        ).addConstraintViolation();
//
//        return false;
//    }
}
