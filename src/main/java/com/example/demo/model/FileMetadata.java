package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FileMetadata {
    private String fileName;
    private String ossKey;  // keeping the name for compatibility
    private String contentType;
    private Long fileSize;
    private LocalDateTime uploadTime;
    private String url;
}
