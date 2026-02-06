package src.main.java.com.cleanwave.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import src.main.java.com.cleanwave.model.Report;
import src.main.java.com.cleanwave.model.Report.ReportStatus;

import java.util.List;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByStatus(ReportStatus status);
    List<Report> findByBy(String by);
    List<Report> findByAssignedToId(String workerId);
    List<Report> findByCategory(String category);
}
