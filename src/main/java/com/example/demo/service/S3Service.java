package com.example.demo.service;

import com.example.demo.model.FileMetadata;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.core.ResponseInputStream;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {
    private final S3Client s3Client;
    
    @Value("${aws.s3.bucketName}")
    private String bucketName;
    
    public FileMetadata uploadFile(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        String s3Key = UUID.randomUUID().toString() + "_" + fileName;
        
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType(file.getContentType())
                .build();
                
        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        
        FileMetadata metadata = new FileMetadata();
        metadata.setFileName(fileName);
        metadata.setOssKey(s3Key); // Keeping ossKey field name for compatibility
        metadata.setContentType(file.getContentType());
        metadata.setFileSize(file.getSize());
        metadata.setUploadTime(LocalDateTime.now());
        metadata.setUrl(generateUrl(s3Key));
        
        return metadata;
    }
    
    public byte[] downloadFile(String s3Key) throws IOException {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();
                
        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(getObjectRequest);
        return response.readAllBytes();
    }
    
    public void deleteFile(String s3Key) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();
                
        s3Client.deleteObject(deleteObjectRequest);
    }
    
    private String generateUrl(String s3Key) {
        GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .build();
        return s3Client.utilities().getUrl(getUrlRequest).toString();
    }
}
