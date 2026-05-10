package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import ru.servisklimat.api.dto.refrigerant.*;
import ru.servisklimat.domain.model.RefrigerantCylinder;
import ru.servisklimat.domain.model.RefrigerantLog;
import ru.servisklimat.domain.model.RefrigerantType;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RefrigerantMapper {

    RefrigerantTypeDto toDto(RefrigerantType entity);

    List<RefrigerantTypeDto> toTypeDtoList(List<RefrigerantType> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    RefrigerantType toEntity(CreateRefrigerantTypeRequest request);

    RefrigerantCylinderDto toDto(RefrigerantCylinder entity);

    List<RefrigerantCylinderDto> toCylinderDtoList(List<RefrigerantCylinder> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    RefrigerantCylinder toEntity(CreateCylinderRequest request);

    RefrigerantLogDto toDto(RefrigerantLog entity);

    List<RefrigerantLogDto> toLogDtoList(List<RefrigerantLog> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    RefrigerantLog toEntity(CreateRefrigerantLogRequest request);
}
