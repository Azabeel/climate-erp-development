package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.ErrorCode;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ErrorCodeRepository extends JpaRepository<ErrorCode, UUID> {

    Optional<ErrorCode> findByCode(String code);

    Optional<ErrorCode> findByBrandIdAndCode(UUID brandId, String code);

    @Query("SELECT e FROM ErrorCode e WHERE LOWER(e.code) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(e.displayText) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<ErrorCode> searchByCodeOrDescription(@Param("query") String query, Pageable pageable);
}
