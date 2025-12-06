package com.solidarlink.backend.repository;

import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.entity.User;
import com.solidarlink.backend.enums.CasCategorie;
import com.solidarlink.backend.enums.CasStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CasHumanitaireRepository extends JpaRepository<CasHumanitaire, Long> {
    
    // ========== PAGINATED METHODS (NEW) ==========
    Page<CasHumanitaire> findByAuthor(User author, Pageable pageable);

    Page<CasHumanitaire> findByVolunteer(User volunteer, Pageable pageable);

    Page<CasHumanitaire> findByStatus(CasStatut status, Pageable pageable);
    
    Page<CasHumanitaire> findByStatusAndCategorie(CasStatut status, CasCategorie categorie, Pageable pageable);
    
    Page<CasHumanitaire> findByCategorie(CasCategorie categorie, Pageable pageable);

    // ========== NON-PAGINATED (Keep for backward compatibility) ==========
    List<CasHumanitaire> findByAuthor(User author);

    List<CasHumanitaire> findByVolunteer(User volunteer);

    List<CasHumanitaire> findByStatus(CasStatut status);

    List<CasHumanitaire> findTop3ByStatusOrderByUpdatedAtDesc(CasStatut status);

    @Query(value = "SELECT * FROM cas_humanitaire c WHERE ST_DWithin(c.location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), :radius)", nativeQuery = true)
    List<CasHumanitaire> findNearbyCases(@Param("latitude") double latitude, @Param("longitude") double longitude,
            @Param("radius") double radius);

    // ========== VIEWPORT-BASED QUERIES (PostGIS ST_Within) ==========
    @Query(value = """
        SELECT c.* FROM cas_humanitaire c 
        WHERE c.location && ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
        AND ST_Within(c.location, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))
        """, 
        countQuery = """
        SELECT COUNT(*) FROM cas_humanitaire c 
        WHERE c.location && ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
        AND ST_Within(c.location, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))
        """,
        nativeQuery = true)
    Page<CasHumanitaire> findWithinViewport(
        @Param("minLon") double minLon, 
        @Param("minLat") double minLat,
        @Param("maxLon") double maxLon, 
        @Param("maxLat") double maxLat,
        Pageable pageable);

    @Query(value = """
        SELECT c.* FROM cas_humanitaire c 
        WHERE c.location && ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
        AND ST_Within(c.location, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))
        AND CAST(c.status AS text) = :status
        ORDER BY c.created_at DESC
        """, 
        countQuery = """
        SELECT COUNT(*) FROM cas_humanitaire c 
        WHERE c.location && ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326)
        AND ST_Within(c.location, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))
        AND CAST(c.status AS text) = :status
        """,
        nativeQuery = true)
    Page<CasHumanitaire> findWithinViewportAndStatus(
        @Param("minLon") double minLon, 
        @Param("minLat") double minLat,
        @Param("maxLon") double maxLon, 
        @Param("maxLat") double maxLat,
        @Param("status") String status,
        Pageable pageable);

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
