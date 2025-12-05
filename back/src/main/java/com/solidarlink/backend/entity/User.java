package com.solidarlink.backend.entity;

import com.solidarlink.backend.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_user")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;

    @Column(unique = true)
    private String email;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;
    private String telephone;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Volunteer specific fields
    private String competences;
    private String disponibilite;
    private String zoneAction;

    private String documentUrl;
    private String documentType;

    @Builder.Default
    private boolean isValidated = false; // By default, users need validation (especially volunteers)

    @Builder.Default
    private boolean isBanned = false;

    private String avatarUrl;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isBanned;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true; // Or use isValidated if you want to block login until validation
    }

    // Gamification & Stats
    @Builder.Default
    private Integer points = 0;

    @Builder.Default
    private String level = "Bronze";

    @Builder.Default
    private Integer missionsCompleted = 0;

    @Builder.Default
    private Integer hoursVolunteered = 0;

    public void addPoints(int amount) {
        this.points += amount;
        updateLevel();
    }

    private void updateLevel() {
        if (this.points >= 1000)
            this.level = "Platine";
        else if (this.points >= 500)
            this.level = "Or";
        else if (this.points >= 200)
            this.level = "Argent";
        else
            this.level = "Bronze";
    }
}
