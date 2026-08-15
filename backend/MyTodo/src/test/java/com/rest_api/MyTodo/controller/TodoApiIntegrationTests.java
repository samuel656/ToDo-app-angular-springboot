package com.rest_api.MyTodo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rest_api.MyTodo.model.Todo;
import com.rest_api.MyTodo.repo.TodoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TodoApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void clearDatabase() {
        todoRepository.deleteAll();
    }

    @Test
    void helloWorldEndpointsReturnExpectedMessages() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string("welcome to spring"));

        mockMvc.perform(get("/hello-world-bean"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hello from Bean"));

        mockMvc.perform(get("/hello-world-bean/path/Ada"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hello Ada"));
    }

    @Test
    void todoCrudEndpointsCreateReadUpdateAndDeleteTodos() throws Exception {
        String newTodo = """
                {"description":"Write API tests","target":1767225600000,"done":false}
                """;

        String createResponse = mockMvc.perform(post("/users/alice/list-todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newTodo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.description").value("Write API tests"))
                .andExpect(jsonPath("$.done").value(false))
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(get("/users/alice/list-todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(id));

        mockMvc.perform(get("/users/alice/list-todos/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Write API tests"));

        String updatedTodo = """
                {"id":%d,"username":"alice","description":"API tests complete","target":1767225600000,"done":true}
                """.formatted(id);
        mockMvc.perform(put("/users/alice/list-todos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedTodo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("API tests complete"))
                .andExpect(jsonPath("$.done").value(true));

        mockMvc.perform(delete("/users/alice/list-todos/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/users/alice/list-todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void listTodosReturnsOnlyTheRequestedUsersTodos() throws Exception {
        todoRepository.save(new Todo(0, "alice", "Alice task", new Date(), false));
        todoRepository.save(new Todo(0, "bob", "Bob task", new Date(), false));

        mockMvc.perform(get("/users/alice/list-todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username").value("alice"))
                .andExpect(jsonPath("$[0].description").value("Alice task"));
    }
}
