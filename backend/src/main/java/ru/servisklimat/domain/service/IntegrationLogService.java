package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.IntegrationLog;
import ru.servisklimat.domain.repository.IntegrationLogRepository;

import java.time.ZonedDateTime;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class IntegrationLogService {

    private final IntegrationLogRepository integrationLogRepository;

    @Transactional
    public IntegrationLog logRequest(String service, String endpoint, String requestBody,
                                     String responseBody, boolean success, String errorMessage) {
        IntegrationLog entry = IntegrationLog.builder()
                .system(service)
                .direction("OUT")
                .documentType(endpoint)
                .requestPayload(requestBody)
                .responsePayload(responseBody)
                .status(success ? "SUCCESS" : "FAILED")
                .errorMessage(errorMessage)
                .completedAt(ZonedDateTime.now())
                .build();

        IntegrationLog saved = integrationLogRepository.save(entry);
        log.info("Integration log: service={}, success={}", service, success);
        return saved;
    }

    public Page<IntegrationLog> findRecent(Pageable pageable) {
        return integrationLogRepository.findAll(pageable);
    }

    public Page<IntegrationLog> findByService(String service, Pageable pageable) {
        return integrationLogRepository.findBySystem(service, pageable);
    }
}
