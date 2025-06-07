package com.rest_api.MyTodo.controller;

import com.rest_api.MyTodo.model.HelloWorldBean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class HelloWorldController {
    @GetMapping("/")
    public String HelloWorld()
    {
        return "welcome to spring";
    }

    @GetMapping("hello-world-bean")
    public HelloWorldBean hello()
    {
        return new HelloWorldBean("Hello from Bean");
    }
    // path variable is used to retrive the value from the uri
    @GetMapping("hello-world-bean/path/{name}")
    public HelloWorldBean hello(@PathVariable String name)
    {
        return new HelloWorldBean("Hello "+name);
    }
}
