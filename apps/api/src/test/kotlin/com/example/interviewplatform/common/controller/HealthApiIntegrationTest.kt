package com.example.interviewplatform.common.controller

import com.example.interviewplatform.support.ApiIntegrationTest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@ApiIntegrationTest
class HealthApiIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `liveness and readiness endpoints are public and report healthy dependencies`() {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ok"))

        mockMvc.perform(get("/api/health/live"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("alive"))

        mockMvc.perform(get("/api/health/ready"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ready"))
            .andExpect(jsonPath("$.database").value("up"))
    }
}
