package src.main.java.com.cleanwave.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private UserRole role = UserRole.CITIZEN;
    
    public enum UserRole {
        CITIZEN, WORKER, ADMIN
    }
}
