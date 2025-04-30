package com.example.auction.validation;

import com.example.auction.dto.AuctionRequestDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;

public class AuctionDepositValidator implements ConstraintValidator<ValidAuctionDeposit, AuctionRequestDTO> {

    @Override
    public boolean isValid(AuctionRequestDTO dto, ConstraintValidatorContext context) {
        if (dto.getRequiresDeposit() != null && dto.getRequiresDeposit()) {
            if (dto.getSecurityDeposit() == null || dto.getSecurityDeposit().compareTo(BigDecimal.ZERO) <= 0) {
                return false;
            }
        }
        return true;
    }
}
