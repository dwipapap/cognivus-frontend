import { describe, expect, it } from 'vitest'
import { getAverageScore } from '../formatters'

describe('getAverageScore', () => {
  it('averages all score fields and ignores missing scores', () => {
    expect(getAverageScore({
      listening_score: 100,
      speaking_score: 100,
      reading_score: 100,
      writing_score: 100,
      grammar_score: null,
      vocabulary_score: undefined
    })).toBe(100)

    expect(getAverageScore({
      listening_score: 60,
      speaking_score: 70,
      reading_score: 80,
      writing_score: 90,
      grammar_score: 100,
      vocabulary_score: 50
    })).toBe(75)
  })
})
