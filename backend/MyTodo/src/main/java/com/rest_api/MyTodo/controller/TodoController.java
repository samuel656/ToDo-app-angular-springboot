package com.rest_api.MyTodo.controller;

import com.rest_api.MyTodo.model.Todo;
import com.rest_api.MyTodo.repo.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class TodoController {

    @Autowired
    private TodoRepository todoRepo;

    @GetMapping("/users/{username}/list-todos")
    public List<Todo> getALlTodos(@PathVariable String username) {
        return todoRepo.findByUsername(username);
    }

    @GetMapping("/users/{username}/list-todos/{id}")
    public Optional<Todo> getTodoById(@PathVariable String username, @PathVariable long id) {
        return todoRepo.findById(id);
    }

    @DeleteMapping("/users/{username}/list-todos/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable String username, @PathVariable long id) {
        todoRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("users/{username}/list-todos/{id}")
    public ResponseEntity<Todo> updateTodo(@RequestBody Todo todo,
                                           @PathVariable String username,
                                           @PathVariable long id) {
        Todo updatedTodo = todoRepo.save(todo);
        return new ResponseEntity<Todo>(updatedTodo, HttpStatus.OK);
    }

    @PostMapping("users/{username}/list-todos")
    public ResponseEntity<Todo> createTodo(@RequestBody Todo todo,
                                           @PathVariable String username){
        todo.setUsername(username);
        Todo createdTodo = todoRepo.save(todo);
        return new ResponseEntity<>(createdTodo, HttpStatus.CREATED);
    }

    @GetMapping("/test")
    public List<Todo> test() {
        return todoRepo.findByUsername("samuel");
    }

}