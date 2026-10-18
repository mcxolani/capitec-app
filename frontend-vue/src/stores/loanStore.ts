import { defineStore } from 'pinia'
import { ref } from 'vue'
import { calculateRate, checkEligibility, getLoanProducts, getValidationRules } from '@/api/loanApi'
import type {
  EligibilityRequest,
  EligibilityResponse,
  LoanProduct,
  RateResponse,
  ValidationRules,
} from '@/types/loan'

export const useLoanStore = defineStore('loan', () => {
  const products = ref<LoanProduct[]>([])
  const rules = ref<ValidationRules | null>(null)
  const result = ref<EligibilityResponse | null>(null)
  const rate = ref<RateResponse | null>(null)
  const loading = ref(true)
  const submitting = ref(false)
  const loadError = ref('')
  const submitError = ref('')
  const rateError = ref('')

  async function load() {
    loading.value = true
    loadError.value = ''

    try {
      const [loanProducts, validationRules] = await Promise.all([
        getLoanProducts(),
        getValidationRules(),
      ])
      products.value = loanProducts
      rules.value = validationRules
    } catch {
      loadError.value =
        'Could not load the loan simulator. Check that the Spring Boot API is running.'
    } finally {
      loading.value = false
    }
  }

  async function estimate(request: EligibilityRequest) {
    submitting.value = true
    submitError.value = ''
    rateError.value = ''
    result.value = null
    rate.value = null

    try {
      result.value = await checkEligibility(request)
      const amount = result.value.recommendedLoan.recommendedAmount

      if (amount > 0) {
        try {
          rate.value = await calculateRate({
            loanAmount: amount,
            loanTerm: request.loanDetails.loanTerm,
            creditScore: request.financialInfo.creditScore,
            loanType: 'personal_loan',
          })
        } catch {
          rateError.value = 'The repayment schedule could not be loaded.'
        }
      }
    } catch {
      submitError.value = 'Could not check eligibility. Please try again.'
    } finally {
      submitting.value = false
    }
  }

  function clearEstimate() {
    result.value = null
    rate.value = null
    submitError.value = ''
    rateError.value = ''
  }

  return {
    products,
    rules,
    result,
    rate,
    loading,
    submitting,
    loadError,
    submitError,
    rateError,
    load,
    estimate,
    clearEstimate,
  }
})
