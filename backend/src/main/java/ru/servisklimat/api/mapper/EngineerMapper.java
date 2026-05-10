package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.servisklimat.api.dto.engineer.CertificationDto;
import ru.servisklimat.api.dto.engineer.CreateCertificationRequest;
import ru.servisklimat.api.dto.engineer.CreateEngineerRequest;
import ru.servisklimat.api.dto.engineer.EngineerDto;
import ru.servisklimat.api.dto.engineer.UpdateEngineerRequest;
import ru.servisklimat.domain.model.Engineer;
import ru.servisklimat.domain.model.EngineerCertification;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface EngineerMapper {

    EngineerDto toDto(Engineer engineer);

    Engineer toEntity(CreateEngineerRequest request);

    void updateEntity(UpdateEngineerRequest request, @MappingTarget Engineer engineer);

    @Mapping(source = "engineer.id", target = "engineerId")
    @Mapping(source = "brand.id", target = "brandId")
    CertificationDto toCertificationDto(EngineerCertification certification);

    @Mapping(target = "engineer", ignore = true)
    @Mapping(target = "brand", ignore = true)
    EngineerCertification toCertificationEntity(CreateCertificationRequest request);
}
