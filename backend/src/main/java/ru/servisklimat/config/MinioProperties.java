package ru.servisklimat.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "minio")
public class MinioProperties {

    private String url;
    private String accessKey;
    private String secretKey;
    private Bucket bucket = new Bucket();

    @Data
    public static class Bucket {
        private String photos = "work-order-photos";
        private String documents = "documents";
        private String manuals = "manuals";
    }
}
