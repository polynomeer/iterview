package com.example.interviewplatform.user.repository

import com.example.interviewplatform.support.ApiIntegrationTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

@ApiIntegrationTest
class CompanyRepositoryIntegrationTest {
    @Autowired
    private lateinit var companyRepository: CompanyRepository

    @Test
    fun `findAllByOrderByNameAsc returns seeded reference companies`() {
        val companies = companyRepository.findAllByOrderByNameAsc()

        assertTrue(companies.size >= 4)
        assertEquals("Amazon", companies.first().name)
    }
}
