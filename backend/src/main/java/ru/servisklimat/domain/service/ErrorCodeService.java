package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.ErrorCode;
import ru.servisklimat.domain.repository.ErrorCodeRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ErrorCodeService {

    private final ErrorCodeRepository errorCodeRepository;

    public ErrorCode findByCode(String code) {
        return errorCodeRepository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Error code not found: " + code));
    }

    public ErrorCode findById(UUID id) {
        return errorCodeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Error code not found: " + id));
    }

    public Page<ErrorCode> search(String query, Pageable pageable) {
        return errorCodeRepository.searchByCodeOrDescription(query, pageable);
    }
}
