package ru.servisklimat.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.minio.MinioClient;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import ru.servisklimat.api.dto.client.ClientDto;
import ru.servisklimat.api.dto.client.CreateClientRequest;
import ru.servisklimat.domain.model.enums.ClientType;
import ru.servisklimat.domain.service.ClientService;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClientControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    ClientService clientService;

    @MockBean
    JwtDecoder jwtDecoder;

    @MockBean
    MinioClient minioClient;

    @MockBean
    ConnectionFactory connectionFactory;

    @MockBean
    RedisConnectionFactory redisConnectionFactory;

    @Test
    @WithMockUser
    void testGetAll_returns200() throws Exception {
        ClientDto dto = new ClientDto(
                UUID.randomUUID(), ClientType.INDIVIDUAL, "Иван Иванов",
                null, null, null, null, "+79001234567", null, null,
                null, null, null, 100, null, true, null, null);

        when(clientService.findAll(any())).thenReturn(
                new PageImpl<>(List.of(dto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Иван Иванов"));
    }

    @Test
    @WithMockUser
    void testGetById_returns404_whenNotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(clientService.findById(id)).thenThrow(
                new EntityNotFoundException("Client not found with id: " + id));

        mockMvc.perform(get("/api/v1/clients/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void testCreate_returns201() throws Exception {
        CreateClientRequest request = new CreateClientRequest(
                ClientType.INDIVIDUAL, "Новый Клиент", null, null,
                null, null, "+79009998877", null, null, null, null, null, null);

        ClientDto dto = new ClientDto(
                UUID.randomUUID(), ClientType.INDIVIDUAL, "Новый Клиент",
                null, null, null, null, "+79009998877", null, null,
                null, null, null, 100, null, true, null, null);

        when(clientService.create(any(CreateClientRequest.class))).thenReturn(dto);

        mockMvc.perform(post("/api/v1/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Новый Клиент"));
    }
}
