package com.example.user.Dtos;

import com.example.user.model.Role;
import java.util.Set;

public class RoleUpdateRequest {
    private Set<Role> roles;

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
}
