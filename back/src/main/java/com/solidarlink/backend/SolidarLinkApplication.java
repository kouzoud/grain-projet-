package com.solidarlink.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync // Active le support des méthodes asynchrones (@Async)
public class SolidarLinkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SolidarLinkApplication.class, args);
        System.out.println("******************************");
        System.out.println("******************************");
        System.out.println("SolidarLinkApplication started");
        System.out.println("******************************");
        System.out.println("******************************");

    }

}
