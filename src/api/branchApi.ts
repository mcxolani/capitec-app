import type { Branch } from '@/types/branch'
import { requestJson } from './request'

export function fetchBranches(): Promise<Branch[]> {
  return requestJson('/api/branches')
}
