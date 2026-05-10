package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.servisklimat.api.dto.supplier.CreateSupplierRequest;
import ru.servisklimat.api.dto.supplier.SupplierDto;
import ru.servisklimat.api.dto.supplier.UpdateSupplierRequest;
import ru.servisklimat.domain.model.Supplier;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SupplierMapper {

    SupplierDto toDto(Supplier supplier);

    Supplier toEntity(CreateSupplierRequest request);

    void updateEntity(UpdateSupplierRequest request, @MappingTarget Supplier supplier);
}
