package src.main.java.com.cleanwave.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import src.main.java.com.cleanwave.dto.ReportRequest;
import src.main.java.com.cleanwave.model.AssignedWorker;
import src.main.java.com.cleanwave.model.Report;
import src.main.java.com.cleanwave.model.User;
import src.main.java.com.cleanwave.repository.ReportRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    public Report createReport(ReportRequest request, String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        
        Report report = new Report();
        report.setCategory(request.getCategory());
        report.setDescription(request.getDescription());
        report.setLocation(request.getLocation());
        report.setImageDataUrl(request.getImageDataUrl());
        report.setBy(user.getEmail());
        report.setStatus(Report.ReportStatus.OPEN);
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        
        report = reportRepository.save(report);
        
        // Send email notification
        emailService.sendComplaintSubmittedEmail(user.getEmail(), report.getId());
        
        return report;
    }
    
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }
    
    public List<Report> getReportsByUser(String email) {
        return reportRepository.findByBy(email);
    }
    
    public List<Report> getReportsByWorker(String workerId) {
        return reportRepository.findByAssignedToId(workerId);
    }
    
    public Report getReportById(String id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }
    
    public Report assignWorker(String reportId, String workerId) {
        Report report = getReportById(reportId);
        User worker = userService.getUserByEmail(workerId);
        
        if (worker.getRole() != User.UserRole.WORKER) {
            throw new RuntimeException("User is not a worker");
        }
        
        AssignedWorker assignedWorker = new AssignedWorker();
        assignedWorker.setId(worker.getId());
        assignedWorker.setName(worker.getUsername());
        
        report.setAssignedTo(assignedWorker);
        report.setStatus(Report.ReportStatus.IN_PROGRESS);
        report.setUpdatedAt(LocalDateTime.now());
        
        report = reportRepository.save(report);
        
        // Send email notifications
        emailService.sendComplaintAssignedEmail(report.getBy(), reportId, worker.getUsername());
        emailService.sendWorkerAssignmentEmail(worker.getEmail(), reportId, report.getCategory());
        
        return report;
    }
    
    public Report updateStatus(String reportId, String status) {
        Report report = getReportById(reportId);
        
        Report.ReportStatus newStatus;
        try {
            newStatus = Report.ReportStatus.valueOf(status.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status");
        }
        
        report.setStatus(newStatus);
        report.setUpdatedAt(LocalDateTime.now());
        
        if (newStatus == Report.ReportStatus.CLOSED) {
            report.setResolvedAt(LocalDateTime.now());
        }
        
        report = reportRepository.save(report);
        
        // Send email notification
        emailService.sendComplaintStatusUpdateEmail(report.getBy(), reportId, newStatus.getDisplayName());
        
        return report;
    }
    
    public void deleteReport(String id) {
        reportRepository.deleteById(id);
    }
}
