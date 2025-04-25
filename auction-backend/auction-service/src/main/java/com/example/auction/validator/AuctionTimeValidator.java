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
        System.out.println("✅ Initialized with minGapMinutes = " + minGapMinutes);
    }

    @Override
    public boolean isValid(AuctionRequestDTO auctionRequest, ConstraintValidatorContext context) {
        System.out.println("🔍 AuctionTimeValidator is running!");

        if (auctionRequest == null) return true;

        LocalDateTime start = auctionRequest.getStartTime();
        LocalDateTime end = auctionRequest.getEndTime();

        if (start == null || end == null) return true;

        if (end.isAfter(start.plusMinutes(minGapMinutes))) return true;

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(
                "Auction end time must be at least " + minGapMinutes + " minutes after start time"
        ).addPropertyNode("auctionTimeError").addConstraintViolation();

        return false;
    }
}

