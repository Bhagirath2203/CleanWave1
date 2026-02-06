package com.cleanwave.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "reports")
public class Report {
    @Id
    private String id;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private String category;
    
    private String description;
    
    private Location location;
    
    private String imageDataUrl;
    
    private String by; // Reporter username.email
    
    private ReportStatus status = ReportStatus.OPEN;
    
    private LocalDateTime resolvedAt;
    
    private AssignedWorker assignedTo;
    
    private LocalDateTime updatedAt;
    
    public enum ReportStatus {
        OPEN("Open"),
        IN_PROGRESS("In Progress"),
        CLOSED("Closed");
        
        private String displayName;
        
        ReportStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
