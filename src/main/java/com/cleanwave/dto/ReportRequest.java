package src.main.java.com.cleanwave.dto;

import lombok.Data;
import src.main.java.com.cleanwave.model.Location;

@Data
public class ReportRequest {
    private String category;
    private String description;
    private Location location;
    private String imageDataUrl;
}
