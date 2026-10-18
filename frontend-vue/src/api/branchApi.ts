import { request } from './request'
import type { Branch } from '@/types/branch'

export function getBranches() {
  return request<Branch[]>('/api/branches')
}
