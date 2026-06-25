import { describe, expect, it } from 'vitest'
import {
  createCsvContent,
  escapeCsvCell,
  sanitizeSpreadsheetCell
} from '../csv'

describe('CSV export utilities', () => {
  it.each([
    ['=SUM(1,1)', "'=SUM(1,1)"],
    ['+123', "'+123"],
    ['-10+20', "'-10+20"],
    ['@command', "'@command"],
    ['  =SUM(1,1)', "'  =SUM(1,1)"],
    ['safe value', 'safe value']
  ])('sanitizes spreadsheet formulas in %s', (input, expected) => {
    expect(sanitizeSpreadsheetCell(input)).toBe(expected)
  })

  it('escapes quotes and always wraps cells', () => {
    expect(escapeCsvCell('Student "A"')).toBe('"Student ""A"""')
  })

  it('creates an Excel-compatible UTF-8 CSV with CRLF rows', () => {
    expect(createCsvContent([
      ['Name', 'Amount'],
      ['Student A', 1000]
    ])).toBe('\uFEFF"Name","Amount"\r\n"Student A","1000"')
  })
})
