package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.api.dto.engineer.CertificationDto;
import ru.servisklimat.api.dto.engineer.CreateCertificationRequest;
import ru.servisklimat.api.dto.engineer.CreateEngineerRequest;
import ru.servisklimat.api.dto.engineer.EngineerDto;
import ru.servisklimat.api.dto.engineer.UpdateEngineerRequest;
import ru.servisklimat.api.mapper.EngineerMapper;
import jakarta.persistence.EntityNotFoundException;
import ru.servisklimat.domain.model.Brand;
import ru.servisklimat.domain.model.Engineer;
import ru.servisklimat.domain.model.EngineerCertification;
import ru.servisklimat.domain.repository.BrandRepository;
import ru.servisklimat.domain.repository.EngineerCertificationRepository;
import ru.servisklimat.domain.repository.EngineerRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EngineerService {

    private final EngineerRepository engineerRepository;
    private final EngineerCertificationRepository certificationRepository;
    private final BrandRepository brandRepository;
    private final EngineerMapper engineerMapper;

    public Page<EngineerDto> findAll(Pageable pageable) {
        return engineerRepository.findByIsActiveTrue(pageable).map(engineerMapper::toDto);
    }

    public EngineerDto findById(UUID id) {
        return engineerMapper.toDto(getOrThrow(id));
    }

    @Transactional
    public EngineerDto create(CreateEngineerRequest request) {
        Engineer engineer = engineerMapper.toEntity(request);
        return engineerMapper.toDto(engineerRepository.save(engineer));
    }

    @Transactional
    public EngineerDto update(UUID id, UpdateEngineerRequest request) {
        Engineer engineer = getOrThrow(id);
        engineerMapper.updateEntity(request, engineer);
        return engineerMapper.toDto(engineerRepository.save(engineer));
    }

    public List<CertificationDto> getCertifications(UUID engineerId) {
        getOrThrow(engineerId);
        return certificationRepository.findByEngineerId(engineerId)
                .stream()
                .map(engineerMapper::toCertificationDto)
                .toList();
    }

    @Transactional
    public CertificationDto addCertification(UUID engineerId, CreateCertificationRequest request) {
        Engineer engineer = getOrThrow(engineerId);
        EngineerCertification cert = engineerMapper.toCertificationEntity(request);
        cert.setEngineer(engineer);

        if (request.brandId() != null) {
            Brand brand = brandRepository.findById(request.brandId())
                    .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + request.brandId()));
            cert.setBrand(brand);
        }

        return engineerMapper.toCertificationDto(certificationRepository.save(cert));
    }

    public List<EngineerDto> findAvailable() {
        return engineerRepository.findByIsActiveTrueAndUseInAutoSchedulerTrue()
                .stream()
                .map(engineerMapper::toDto)
                .toList();
    }

    private Engineer getOrThrow(UUID id) {
        return engineerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Engineer not found with id: " + id));
    }
}
