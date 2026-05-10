package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.servisklimat.api.dto.brand.BrandDto;
import ru.servisklimat.api.dto.brand.CreateBrandRequest;
import ru.servisklimat.api.dto.brand.UpdateBrandRequest;
import ru.servisklimat.domain.model.Brand;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BrandMapper {

    BrandDto toDto(Brand brand);

    Brand toEntity(CreateBrandRequest request);

    void updateEntity(UpdateBrandRequest request, @MappingTarget Brand brand);
}
