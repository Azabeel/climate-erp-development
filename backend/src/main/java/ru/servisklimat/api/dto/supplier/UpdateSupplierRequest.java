package ru.servisklimat.api.dto.supplier;

public record UpdateSupplierRequest(
        String name,
        String phone,
        String email,
        String address,
        String contactPerson,
        String notes,
        Boolean isActive
) {}
