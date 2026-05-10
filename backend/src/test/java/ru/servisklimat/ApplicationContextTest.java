package ru.servisklimat;

import io.minio.MinioClient;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class ApplicationContextTest {

    @MockBean
    JwtDecoder jwtDecoder;

    @MockBean
    MinioClient minioClient;

    @MockBean
    ConnectionFactory connectionFactory;

    @MockBean
    RedisConnectionFactory redisConnectionFactory;

    @Test
    void contextLoads() {
        // Verifies that the Spring application context starts successfully
        // with all beans configured (security, JPA, scheduling)
    }
}
