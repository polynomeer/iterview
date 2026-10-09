package com.example.interviewplatform.common.ratelimit

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class RateLimitWebConfig(
    private val requestRateLimitInterceptor: RequestRateLimitInterceptor,
) : WebMvcConfigurer {
    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(requestRateLimitInterceptor).addPathPatterns("/api/**")
    }
}
