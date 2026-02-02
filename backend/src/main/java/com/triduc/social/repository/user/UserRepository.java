package com.triduc.social.repository.user;

import com.triduc.social.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, String> {

}
