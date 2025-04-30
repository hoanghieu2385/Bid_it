package com.example.user.service;
import com.example.user.model.Bank;
import com.example.user.repository.BankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BankService {
    private final BankRepository bankRepository;

    public List<Bank> getAllBanks() {
        return bankRepository.findAll();
    }

    public Bank createBank(Bank bank) {
    if (bank.getName() == null || bank.getName().trim().isEmpty()) {
        throw new IllegalArgumentException("Bank name must not be empty.");
    }

    boolean exists = bankRepository.existsByNameIgnoreCase(bank.getName().trim());
    if (exists) {
        throw new IllegalArgumentException("Bank with this name already exists.");
    }

    return bankRepository.save(bank);
    }

    public Bank updateBank(Long id, Bank updatedBank) {
    Bank existing = bankRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Bank not found with id: " + id));

    String newName = updatedBank.getName();
    if (newName == null || newName.trim().isEmpty()) {
        throw new IllegalArgumentException("Bank name must not be empty.");
    }

    if (!existing.getName().equalsIgnoreCase(newName.trim()) && bankRepository.existsByNameIgnoreCase(newName.trim())) {
        throw new IllegalArgumentException("Another bank with this name already exists.");
    }

    existing.setName(newName.trim());
    return bankRepository.save(existing);
    }

    public void deleteBank(Long id) {
        if (!bankRepository.existsById(id)) {
            throw new IllegalArgumentException("Bank not found with id: " + id);
        }
        bankRepository.deleteById(id);
    }
}
