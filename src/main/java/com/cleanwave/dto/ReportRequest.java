package com.cleanwave.dto;

import com.cleanwave.model.Location;

public class ReportRequest {

    private String category;
    private String description;
    private Location location;
    private String imageDataUrl;

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public String getImageDataUrl() { return imageDataUrl; }
    public void setImageDataUrl(String imageDataUrl) { this.imageDataUrl = imageDataUrl; }
}
