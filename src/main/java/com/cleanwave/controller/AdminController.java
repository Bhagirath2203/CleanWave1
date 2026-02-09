package com.cleanwave.controller;

import com.cleanwave.model.Report;
import com.cleanwave.model.RoleRequest;
import com.cleanwave.model.User;
import com.cleanwave.service.RoleRequestService;
import com.cleanwave.service.ReportService;
import com.cleanwave.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private RoleRequestService roleRequestService;
    
    @GetMapping("/reports")
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }
    
    @GetMapping("/workers")
    public ResponseEntity<List<User>> getAllWorkers() {
        return ResponseEntity.ok(userService.getAllWorkers());
    }

    @GetMapping("/worker-requests")
    public ResponseEntity<List<RoleRequest>> getPendingWorkerRequests() {
        return ResponseEntity.ok(roleRequestService.getPendingWorkerRequests());
    }
    
    @PutMapping("/reports/{id}/assign")
    public ResponseEntity<?> assignWorker(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String workerId = body.get("workerId");
            Report report = reportService.assignWorker(id, workerId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/workers/{id}")
    public ResponseEntity<Void> deleteWorker(@PathVariable String id) {
        userService.deleteWorker(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/worker-requests/{id}/approve")
    public ResponseEntity<Void> approveWorkerRequest(@PathVariable String id) {
        roleRequestService.approveWorkerRequest(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/worker-requests/{id}/reject")
    public ResponseEntity<Void> rejectWorkerRequest(@PathVariable String id) {
        roleRequestService.rejectWorkerRequest(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/reports/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            Report report = reportService.updateStatus(id, status);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
