package com.cleanwave.repository;

import com.cleanwave.model.RoleRequest;
import com.cleanwave.model.RoleRequest.Status;
import com.cleanwave.security.Roles;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRequestRepository extends MongoRepository<RoleRequest, String> {

    List<RoleRequest> findByRequestedRoleAndStatus(Roles role, Status status);

    boolean existsByEmailAndStatus(String email, Status status);
}

