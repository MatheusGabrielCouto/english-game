export const extractJsonObject = (raw: string): unknown => {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1]?.trim() ?? trimmed

  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) {
    throw new Error('JSON não encontrado na resposta')
  }

  return JSON.parse(candidate.slice(start, end + 1))
}
