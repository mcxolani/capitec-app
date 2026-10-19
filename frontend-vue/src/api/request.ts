export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, options)

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}
