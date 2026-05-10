package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.servisklimat.api.dto.contact.ContactDto;
import ru.servisklimat.api.dto.contact.CreateContactRequest;
import ru.servisklimat.domain.model.Contact;

@Mapper(componentModel = "spring")
public interface ContactMapper {

    @Mapping(source = "client.id", target = "clientId")
    ContactDto toDto(Contact contact);

    Contact toEntity(CreateContactRequest request);
}
