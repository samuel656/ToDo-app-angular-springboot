package com.rest_api.MyTodo.repo;

import com.rest_api.MyTodo.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@Repository
public interface TodoRepository extends JpaRepository<Todo,Long> {
    List<Todo> findByUsername(String username);
}
