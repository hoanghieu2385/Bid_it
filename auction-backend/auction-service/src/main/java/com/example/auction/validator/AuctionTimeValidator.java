package com.example.auction.validator;

import com.example.auction.dto.AuctionRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class AuctionTimeValidator implements ConstraintValidator<ValidAuctionTime, AuctionRequestDTO> {

    private long minGapMinutes;

    @Override
    public void initialize(ValidAuctionTime constraintAnnotation) {
        this.minGapMinutes = constraintAnnotation.minGapMinutes();
    }

    @Override
    public boolean isValid(AuctionRequestDTO auctionRequest, ConstraintValidatorContext context) {
        if (auctionRequest == null) {
            return true; // handled by @NotNull elsewhere
        }
        if (auctionRequest.getStartTime() == null || auctionRequest.getEndTime() == null) {
            return true; // Let @NotNull annotations handle these cases
        }
        // Ensure that endTime is after startTime plus the minimum gap
        return auctionRequest.getEndTime().isAfter(auctionRequest.getStartTime().plusMinutes(minGapMinutes));
    }
}
