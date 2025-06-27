package entity;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "user")
public class User implements Serializable{
    
    @Id
    @Column(name = "email", length = 100, nullable = false)
    private String email;
    
    @Column(name = "name", length = 45, nullable = false)
    private String name;
    
    @Column(name = "password", length = 20, nullable = false)
    private String password;
    
    @Column(name = "registered_date_time", nullable = false)
    private Date registered_date_time; 

    public User() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Date getRegistered_date_time() {
        return registered_date_time;
    }

    public void setRegistered_date_time(Date registered_date_time) {
        this.registered_date_time = registered_date_time;
    }
    
}
