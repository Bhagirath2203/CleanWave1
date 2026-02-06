package src.main.java.com.cleanwave.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import src.main.java.com.cleanwave.model.User;
import src.main.java.com.cleanwave.model.User.UserRole;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByRole(UserRole role);
    boolean existsByEmail(String email);
}
