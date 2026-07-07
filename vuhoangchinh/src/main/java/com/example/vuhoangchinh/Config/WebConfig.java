package com.example.vuhoangchinh.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve absolute path to the project directory dynamically
        String userDir = System.getProperty("user.dir");
        
        // Support paths for running from workspace root (e.g. VS Code, multi-module)
        // or directly from the project directory.
        String srcPath = "file:" + userDir + "/src/main/resources/static/image/";
        String subProjectPath = "file:" + userDir + "/vuhoangchinh/src/main/resources/static/image/";
        
        registry.addResourceHandler("/image/**")
                .addResourceLocations(srcPath, subProjectPath, "classpath:/static/image/");
    }
}
