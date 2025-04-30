package com.example.auction.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = AuctionDepositValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAuctionDeposit {
    String message() default "Security deposit must be greater than 0 if deposit is required.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
