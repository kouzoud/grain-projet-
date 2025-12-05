package com.solidarlink.backend.repository;

import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.CasStatut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CasHumanitaireRepository extends JpaRepository<CasHumanitaire, Long> {
    List<CasHumanitaire> findByAuthor(User author);

    List<CasHumanitaire> findByVolunteer(User volunteer);

    List<CasHumanitaire> findByStatus(CasStatut status);

    List<CasHumanitaire> findTop3ByStatusOrderByUpdatedAtDesc(CasStatut status);

    @Query(value = "SELECT * FROM cas_humanitaire c WHERE ST_DWithin(c.location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), :radius)", nativeQuery = true)
    List<CasHumanitaire> findNearbyCases(@Param("latitude") double latitude, @Param("longitude") double longitude,
            @Param("radius") double radius);

    // Explicit JPQL Counting Queries
    @Query("SELECT COUNT(c) FROM CasHumanitaire c WHERE c.status = 'EN_ATTENTE'")
    long countEnAttente();

    @Query("SELECT COUNT(c) FROM CasHumanitaire c WHERE c.status = 'VALIDE' OR c.status = 'EN_COURS'")
    long countEnCours();

    @Query("SELECT COUNT(c) FROM CasHumanitaire c WHERE c.status = 'RESOLU'")
    long countResolus();

    @Query("SELECT COUNT(c) FROM CasHumanitaire c WHERE c.status = 'REJETE'")
    long countRejetes();
}
