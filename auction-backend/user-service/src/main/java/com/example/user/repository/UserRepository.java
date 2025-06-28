package com.example.user.repository;

import com.example.user.model.CitizenIdStatus;
import com.example.user.model.Role;
import com.example.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    List<User> findByCitizenIdStatus(CitizenIdStatus status);


    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(Role role);
    @Query("SELECT u FROM User u WHERE u.citizenIdStatus = 'PENDING'")
    List<User> findAllPendingVerification();

}