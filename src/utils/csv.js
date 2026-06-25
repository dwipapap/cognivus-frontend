const FORMULA_PREFIX_PATTERN = /^[\t\r ]*[=+\-@]/

export const sanitizeSpreadsheetCell = (value) => {
  const text = value == null ? '' : String(value)
  return FORMULA_PREFIX_PATTERN.test(text) ? `'${text}` : text
}

export const escapeCsvCell = (value) => {
  const sanitized = sanitizeSpreadsheetCell(value)
  return `"${sanitized.replaceAll('"', '""')}"`
}

export const createCsvContent = (rows) => {
  return `\uFEFF${rows
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n')}`
}
