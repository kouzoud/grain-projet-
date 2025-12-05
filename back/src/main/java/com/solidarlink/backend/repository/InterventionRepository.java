package com.solidarlink.backend.repository;

import com.solidarlink.backend.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {
    List<Intervention> findByCasId(Long casId);

    List<Intervention> findByBenevoleId(Long benevoleId);
}
