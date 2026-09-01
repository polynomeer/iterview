package com.example.interviewplatform.common.logging

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class RequestIdFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val requestId = request.getHeader(HEADER_NAME)
            ?.takeIf { REQUEST_ID_PATTERN.matches(it) }
            ?: UUID.randomUUID().toString()

        request.setAttribute(REQUEST_ID_ATTRIBUTE, requestId)
        response.setHeader(HEADER_NAME, requestId)
        MDC.put(MDC_KEY, requestId)
        try {
            filterChain.doFilter(request, response)
        } finally {
            MDC.remove(MDC_KEY)
        }
    }

    companion object {
        const val HEADER_NAME = "X-Request-Id"
        const val REQUEST_ID_ATTRIBUTE = "iterview.requestId"
        const val MDC_KEY = "requestId"

        private val REQUEST_ID_PATTERN = Regex("[A-Za-z0-9][A-Za-z0-9_-]{7,63}")
    }
}
