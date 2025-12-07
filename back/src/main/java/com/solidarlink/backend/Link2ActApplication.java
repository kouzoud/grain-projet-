package com.solidarlink.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync // Active le support des méthodes asynchrones (@Async)
public class Link2ActApplication {

    public static void main(String[] args) {
        SpringApplication.run(Link2ActApplication.class, args);
        System.out.println("******************************");
        System.out.println("******************************");
        System.out.println("Link2Act Application started");
        System.out.println("******************************");
        System.out.println("******************************");

    }

}
