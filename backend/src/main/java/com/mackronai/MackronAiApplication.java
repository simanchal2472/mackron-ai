package com.mackronai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MackronAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(MackronAiApplication.class, args);
    }
}
