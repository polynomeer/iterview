package com.example.interviewplatform.common.security

import com.example.interviewplatform.auth.security.AuthTokenFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.Customizer
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val authTokenFilter: AuthTokenFilter,
    private val authenticationEntryPoint: ApiAuthenticationEntryPoint,
    private val accessDeniedHandler: ApiAccessDeniedHandler,
) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors(Customizer.withDefaults())
            .formLogin { it.disable() }
            .httpBasic { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .exceptionHandling {
                it.authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler)
            }
            .authorizeHttpRequests {
                it
                    .requestMatchers(
                        "/api/me/**",
                        "/api/resumes/**",
                        "/api/resume-versions/**",
                        "/api/skills/**",
                        "/api/interview-sessions/**",
                        "/api/interview-records/**",
                        "/api/questions/*/answers/**",
                        "/api/answer-attempts/**",
                        "/api/home/**",
                        "/api/daily-cards/**",
                        "/api/review-queue/**",
                        "/api/archive/**",
                        "/api/feed/**",
                        "/api/auth/me",
                        "/api/job-postings/**",
                    ).authenticated()
                    .requestMatchers("/api/questions/resume-based").authenticated()
                    .requestMatchers(
                        HttpMethod.POST,
                        "/api/questions/*/reference-answers",
                        "/api/questions/*/learning-materials",
                    ).authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/health", "/uploads/profile-images/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/signup", "/api/auth/login").permitAll()
                    .requestMatchers(
                        HttpMethod.GET,
                        "/api/questions",
                        "/api/questions/*",
                        "/api/questions/*/reference-answers",
                        "/api/questions/*/learning-materials",
                        "/api/questions/*/tree",
                        "/api/questions/*/recommended-followups",
                    ).permitAll()
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                    .anyRequest().denyAll()
            }
            .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
