package com.example.user.controller;
import com.example.user.model.Bank;
import com.example.user.service.BankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/banks")
@RequiredArgsConstructor
public class BankController {
    private final BankService bankService;

    @GetMapping
    public ResponseEntity<List<Bank>> getAllBanks() {
        return ResponseEntity.ok(bankService.getAllBanks());
    }

    @PostMapping
    public ResponseEntity<?> createBank(@RequestBody Bank bank) {
        try {
            Bank saved = bankService.createBank(bank);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Unexpected error: " + e.getMessage());
        }
    }

}
