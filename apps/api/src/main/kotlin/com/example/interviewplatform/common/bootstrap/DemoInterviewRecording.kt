package com.example.interviewplatform.common.bootstrap

import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.PI
import kotlin.math.sin

/**
 * A synthetic recording for the local demo interview, so the review player can be tried without a real
 * upload. Each segment is a soft tone; interviewer and candidate turns use different pitches.
 */
internal object DemoInterviewRecording {
    const val SEGMENT_MS = 7_500L
    private const val SAMPLE_RATE = 8_000
    private const val AMPLITUDE = 2_500.0

    fun wav(segmentCount: Int): ByteArray {
        val samplesPerSegment = (SAMPLE_RATE * SEGMENT_MS / 1_000).toInt()
        val pcm = ByteBuffer.allocate(samplesPerSegment * segmentCount * 2).order(ByteOrder.LITTLE_ENDIAN)
        repeat(segmentCount) { segment ->
            val frequency = if (segment % 2 == 0) 220.0 else 330.0
            repeat(samplesPerSegment) { index ->
                pcm.putShort((AMPLITUDE * sin(2 * PI * frequency * index / SAMPLE_RATE)).toInt().toShort())
            }
        }
        return ByteArrayOutputStream().apply {
            write(header(pcm.capacity()))
            write(pcm.array())
        }.toByteArray()
    }

    private fun header(dataBytes: Int): ByteArray =
        ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN).apply {
            put("RIFF".toByteArray())
            putInt(36 + dataBytes)
            put("WAVE".toByteArray())
            put("fmt ".toByteArray())
            putInt(16)
            putShort(1) // PCM
            putShort(1) // mono
            putInt(SAMPLE_RATE)
            putInt(SAMPLE_RATE * 2)
            putShort(2)
            putShort(16)
            put("data".toByteArray())
            putInt(dataBytes)
        }.array()
}
