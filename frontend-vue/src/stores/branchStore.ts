import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBranches } from '@/api/branchApi'
import type { Branch } from '@/types/branch'

export const useBranchStore = defineStore('branches', () => {
  const branches = ref<Branch[]>([])
  const loading = ref(true)
  const error = ref('')

  async function loadBranches() {
    loading.value = true
    error.value = ''

    try {
      branches.value = await getBranches()
    } catch {
      error.value = 'Could not load branches. Check that the Spring Boot API is running.'
    } finally {
      loading.value = false
    }
  }

  return { branches, loading, error, loadBranches }
})
