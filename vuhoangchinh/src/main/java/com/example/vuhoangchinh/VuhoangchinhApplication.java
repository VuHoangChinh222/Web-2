package com.example.vuhoangchinh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class VuhoangchinhApplication {

	public static void main(String[] args) {
		SpringApplication.run(VuhoangchinhApplication.class, args);
	}

}
