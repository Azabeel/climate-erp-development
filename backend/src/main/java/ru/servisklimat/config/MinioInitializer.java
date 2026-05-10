package ru.servisklimat.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MinioInitializer {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    @Bean
    public ApplicationRunner createBuckets() {
        return args -> {
            List<String> buckets = List.of(
                minioProperties.getBucket().getPhotos(),
                minioProperties.getBucket().getDocuments(),
                minioProperties.getBucket().getManuals()
            );
            for (String bucket : buckets) {
                ensureBucketExists(bucket);
            }
        };
    }

    private void ensureBucketExists(String bucketName) {
        try {
            boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build()
            );
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("MinIO bucket created: {}", bucketName);
            } else {
                log.debug("MinIO bucket already exists: {}", bucketName);
            }
        } catch (Exception e) {
            log.warn("Could not ensure MinIO bucket '{}': {}", bucketName, e.getMessage());
        }
    }
}
