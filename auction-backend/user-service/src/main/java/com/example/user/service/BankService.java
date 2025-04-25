package com.example.user.service;

import com.example.user.model.Bank;
import com.example.user.repository.BankRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BankService {

    private final BankRepository bankRepository;

    // Constructor manually created to replace @RequiredArgsConstructor
    public BankService(BankRepository bankRepository) {
        this.bankRepository = bankRepository;
    }

    public List<Bank> getAllBanks() {
        return bankRepository.findAll();
    }
}
