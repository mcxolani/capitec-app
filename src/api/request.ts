export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)

  if (!response.ok) throw new Error(`Request failed: ${response.status}`)

  return response.json()
}
