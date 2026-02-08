package com.cleanwave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import com.cleanwave.model.Location;

@Data
public class ReportRequest {
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;
    
    @NotNull(message = "Location is required")
    private Location location;
    
    @Size(max = 7000000, message = "Image too large (max 5MB)")
    private String imageDataUrl;
}
