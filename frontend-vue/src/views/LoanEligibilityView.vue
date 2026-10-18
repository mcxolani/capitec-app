<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { BadgeCheck, Clock3, CreditCard, Info, Wallet } from '@lucide/vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import { useLoanStore } from '@/stores/loanStore'
import { formatCurrency } from '@/utils/currency'
import type {
  EligibilityPurpose,
  EligibilityRequest,
  EmploymentStatus,
  LoanPurpose,
  NumberRule,
} from '@/types/loan'

type FormState = {
  age: number | null
  employmentStatus: EmploymentStatus | null
  employmentDuration: number | null
  monthlyIncome: number | null
  monthlyExpenses: number | null
  existingDebt: number | null
  creditScore: number | null
  requestedAmount: number | null
  loanTerm: number | null
  loanPurpose: EligibilityPurpose | null
}

type FieldName = keyof FormState
type FormErrors = Partial<Record<FieldName, string>>

const loanStore = useLoanStore()
const personalLoan = computed(() =>
  loanStore.products.find((product) => product.id === 'personal_loan'),
)
const form = reactive<FormState>({
  age: null,
  employmentStatus: null,
  employmentDuration: null,
  monthlyIncome: null,
  monthlyExpenses: null,
  existingDebt: null,
  creditScore: null,
  requestedAmount: null,
  loanTerm: null,
  loanPurpose: null,
})
const errors = ref<FormErrors>({})
const submitted = ref(false)

const employmentLabels: Record<EmploymentStatus, string> = {
  employed: 'Employed',
  self_employed: 'Self-employed',
  unemployed: 'Unemployed',
  retired: 'Retired',
}

const purposeLabels: Record<LoanPurpose, string> = {
  debt_consolidation: 'Debt consolidation',
  home_improvement: 'Home improvement',
  education: 'Education',
  medical: 'Medical',
  other: 'Other',
  new_vehicle: 'New vehicle',
  used_vehicle: 'Used vehicle',
}

const employmentOptions = computed(() =>
  (loanStore.rules?.personalInfo.employmentStatus.options ?? []).map((value) => ({
    value,
    label: employmentLabels[value],
  })),
)

const purposeOptions = computed(() =>
  (personalLoan.value?.purposes ?? []).map((value) => ({ value, label: purposeLabels[value] })),
)

const needsEmploymentDuration = computed(
  () => form.employmentStatus === 'employed' || form.employmentStatus === 'self_employed',
)

function numberError(value: number | null, rule: NumberRule, wholeNumber = false) {
  if (value === null) return rule.required ? rule.errorMessage : ''
  if (wholeNumber && !Number.isInteger(value)) return rule.errorMessage
  if (rule.min !== undefined && value < rule.min) return rule.errorMessage
  if (rule.max !== undefined && value > rule.max) return rule.errorMessage
  return ''
}

function validateForm(): EligibilityRequest | null {
  const rules = loanStore.rules
  if (!rules) return null

  const nextErrors: FormErrors = {}
  const setError = (field: FieldName, message: string) => {
    if (message) nextErrors[field] = message
  }

  setError('age', numberError(form.age, rules.personalInfo.age, true))
  if (!form.employmentStatus) {
    setError('employmentStatus', rules.personalInfo.employmentStatus.errorMessage)
  }
  if (needsEmploymentDuration.value) {
    setError(
      'employmentDuration',
      numberError(form.employmentDuration, rules.personalInfo.employmentDuration, true),
    )
  }
  setError('monthlyIncome', numberError(form.monthlyIncome, rules.financialInfo.monthlyIncome))
  setError(
    'monthlyExpenses',
    numberError(form.monthlyExpenses, rules.financialInfo.monthlyExpenses),
  )
  if (form.existingDebt !== null && form.existingDebt < 0) {
    setError('existingDebt', 'Existing debt must be zero or more')
  }
  setError('creditScore', numberError(form.creditScore, rules.financialInfo.creditScore, true))
  setError('requestedAmount', numberError(form.requestedAmount, rules.loanDetails.requestedAmount))
  setError('loanTerm', numberError(form.loanTerm, rules.loanDetails.loanTerm, true))
  if (!form.loanPurpose) setError('loanPurpose', 'Please select a loan purpose')

  errors.value = nextErrors
  if (Object.keys(nextErrors).length > 0 || !form.employmentStatus || !form.loanPurpose) return null

  return {
    personalInfo: {
      age: form.age!,
      employmentStatus: form.employmentStatus,
      employmentDuration: needsEmploymentDuration.value ? (form.employmentDuration ?? 0) : 0,
    },
    financialInfo: {
      monthlyIncome: form.monthlyIncome!,
      monthlyExpenses: form.monthlyExpenses!,
      existingDebt: form.existingDebt ?? 0,
      ...(form.creditScore === null ? {} : { creditScore: form.creditScore }),
    },
    loanDetails: {
      requestedAmount: form.requestedAmount!,
      loanTerm: form.loanTerm!,
      loanPurpose: form.loanPurpose,
    },
  }
}

function submit() {
  submitted.value = true
  const request = validateForm()
  if (request) void loanStore.estimate(request)
}

watch(
  form,
  () => {
    if (submitted.value) {
      validateForm()
      loanStore.clearEstimate()
    }
  },
  { deep: true },
)

function displayLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

onMounted(() => loanStore.load())
</script>

<template>
  <section class="loan-view" aria-labelledby="loan-title">
    <header class="loan-view__heading">
      <p class="loan-view__eyebrow">Loan tools</p>
      <h1 id="loan-title">Loan eligibility simulator</h1>
      <p>See an estimate based on your income, expenses, and the amount you want to borrow.</p>
    </header>

    <div v-if="loanStore.loading" class="loan-view__loading" role="status">
      <ProgressSpinner aria-label="Loading loan simulator" />
      <span>Loading loan options…</span>
    </div>

    <div v-else-if="loanStore.loadError" class="loan-view__load-error">
      <Message severity="error" :closable="false">{{ loanStore.loadError }}</Message>
      <Button label="Try again" outlined @click="loanStore.load" />
    </div>

    <Message v-else-if="!personalLoan" severity="error" :closable="false">
      Personal loan information is currently unavailable.
    </Message>

    <template v-else>
      <Card class="loan-product">
        <template #content>
          <div class="loan-product__content">
            <span class="loan-product__icon"><CreditCard :size="24" aria-hidden="true" /></span>
            <div class="loan-product__copy">
              <p class="loan-view__eyebrow">Your selected product</p>
              <h2>{{ personalLoan.name }}</h2>
              <p>{{ personalLoan.description }}</p>
            </div>
            <div class="loan-product__terms">
              <span
                >{{ formatCurrency(personalLoan.minAmount) }}–{{
                  formatCurrency(personalLoan.maxAmount)
                }}</span
              >
              <span>{{ personalLoan.minTerm }}–{{ personalLoan.maxTerm }} months</span>
              <span
                >{{ personalLoan.interestRateRange.min }}%–{{ personalLoan.interestRateRange.max }}%
                interest</span
              >
            </div>
          </div>
        </template>
      </Card>

      <div class="loan-layout">
        <Card class="loan-form-card">
          <template #title>Tell us about your situation</template>
          <template #content>
            <form class="loan-form" @submit.prevent="submit">
              <fieldset class="loan-form__section">
                <legend>About you</legend>
                <div class="loan-fields">
                  <div class="loan-field">
                    <label for="loan-age">Age</label>
                    <InputNumber
                      v-model="form.age"
                      input-id="loan-age"
                      :min="loanStore.rules?.personalInfo.age.min"
                      :max="loanStore.rules?.personalInfo.age.max"
                      :use-grouping="false"
                      :min-fraction-digits="0"
                      :max-fraction-digits="0"
                      :invalid="Boolean(errors.age)"
                      aria-describedby="loan-age-error"
                    />
                    <small v-if="errors.age" id="loan-age-error" class="loan-field__error">
                      {{ errors.age }}
                    </small>
                  </div>

                  <div class="loan-field">
                    <label for="loan-employment">Employment status</label>
                    <Select
                      v-model="form.employmentStatus"
                      input-id="loan-employment"
                      :options="employmentOptions"
                      option-label="label"
                      option-value="value"
                      placeholder="Select status"
                      :invalid="Boolean(errors.employmentStatus)"
                      aria-describedby="loan-employment-error"
                    />
                    <small
                      v-if="errors.employmentStatus"
                      id="loan-employment-error"
                      class="loan-field__error"
                    >
                      {{ errors.employmentStatus }}
                    </small>
                  </div>

                  <div v-if="needsEmploymentDuration" class="loan-field">
                    <label for="loan-duration">Months in current employment</label>
                    <InputNumber
                      v-model="form.employmentDuration"
                      input-id="loan-duration"
                      :min="loanStore.rules?.personalInfo.employmentDuration.min"
                      :use-grouping="false"
                      :min-fraction-digits="0"
                      :max-fraction-digits="0"
                      :invalid="Boolean(errors.employmentDuration)"
                      aria-describedby="loan-duration-error"
                    />
                    <small
                      v-if="errors.employmentDuration"
                      id="loan-duration-error"
                      class="loan-field__error"
                    >
                      {{ errors.employmentDuration }}
                    </small>
                  </div>
                </div>
              </fieldset>

              <fieldset class="loan-form__section">
                <legend>Your finances</legend>
                <div class="loan-fields">
                  <div class="loan-field">
                    <label for="loan-income">Monthly income</label>
                    <InputNumber
                      v-model="form.monthlyIncome"
                      input-id="loan-income"
                      mode="currency"
                      currency="ZAR"
                      locale="en-ZA"
                      :min="loanStore.rules?.financialInfo.monthlyIncome.min"
                      :min-fraction-digits="0"
                      :max-fraction-digits="2"
                      :invalid="Boolean(errors.monthlyIncome)"
                      aria-describedby="loan-income-error"
                    />
                    <small
                      v-if="errors.monthlyIncome"
                      id="loan-income-error"
                      class="loan-field__error"
                    >
                      {{ errors.monthlyIncome }}
                    </small>
                  </div>

                  <div class="loan-field">
                    <label for="loan-expenses">Monthly expenses</label>
                    <InputNumber
                      v-model="form.monthlyExpenses"
                      input-id="loan-expenses"
                      mode="currency"
                      currency="ZAR"
                      locale="en-ZA"
                      :min="loanStore.rules?.financialInfo.monthlyExpenses.min"
                      :min-fraction-digits="0"
                      :max-fraction-digits="2"
                      :invalid="Boolean(errors.monthlyExpenses)"
                      aria-describedby="loan-expenses-error"
                    />
                    <small
                      v-if="errors.monthlyExpenses"
                      id="loan-expenses-error"
                      class="loan-field__error"
                    >
                      {{ errors.monthlyExpenses }}
                    </small>
                  </div>

                  <div class="loan-field">
                    <label for="loan-debt">Existing debt repayments <span>(optional)</span></label>
                    <InputNumber
                      v-model="form.existingDebt"
                      input-id="loan-debt"
                      mode="currency"
                      currency="ZAR"
                      locale="en-ZA"
                      :min="0"
                      :min-fraction-digits="0"
                      :max-fraction-digits="2"
                      :invalid="Boolean(errors.existingDebt)"
                      aria-describedby="loan-debt-error"
                    />
                    <small
                      v-if="errors.existingDebt"
                      id="loan-debt-error"
                      class="loan-field__error"
                    >
                      {{ errors.existingDebt }}
                    </small>
                  </div>

                  <div class="loan-field">
                    <label for="loan-credit-score">Credit score <span>(optional)</span></label>
                    <InputNumber
                      v-model="form.creditScore"
                      input-id="loan-credit-score"
                      :min="loanStore.rules?.financialInfo.creditScore.min"
                      :max="loanStore.rules?.financialInfo.creditScore.max"
                      :use-grouping="false"
                      :min-fraction-digits="0"
                      :max-fraction-digits="0"
                      :invalid="Boolean(errors.creditScore)"
                      aria-describedby="loan-credit-score-error"
                    />
                    <small
                      v-if="errors.creditScore"
                      id="loan-credit-score-error"
                      class="loan-field__error"
                    >
                      {{ errors.creditScore }}
                    </small>
                  </div>
                </div>
              </fieldset>

              <fieldset class="loan-form__section">
                <legend>The loan</legend>
                <div class="loan-fields">
                  <div class="loan-field">
                    <label for="loan-amount">Amount</label>
                    <InputNumber
                      v-model="form.requestedAmount"
                      input-id="loan-amount"
                      mode="currency"
                      currency="ZAR"
                      locale="en-ZA"
                      :min="loanStore.rules?.loanDetails.requestedAmount.min"
                      :max="loanStore.rules?.loanDetails.requestedAmount.max"
                      :min-fraction-digits="0"
                      :max-fraction-digits="2"
                      :invalid="Boolean(errors.requestedAmount)"
                      aria-describedby="loan-amount-error"
                    />
                    <small
                      v-if="errors.requestedAmount"
                      id="loan-amount-error"
                      class="loan-field__error"
                    >
                      {{ errors.requestedAmount }}
                    </small>
                  </div>

                  <div class="loan-field">
                    <label for="loan-term">Term</label>
                    <InputNumber
                      v-model="form.loanTerm"
                      input-id="loan-term"
                      suffix=" months"
                      :min="loanStore.rules?.loanDetails.loanTerm.min"
                      :max="loanStore.rules?.loanDetails.loanTerm.max"
                      :use-grouping="false"
                      :min-fraction-digits="0"
                      :max-fraction-digits="0"
                      :invalid="Boolean(errors.loanTerm)"
                      aria-describedby="loan-term-error"
                    />
                    <small v-if="errors.loanTerm" id="loan-term-error" class="loan-field__error">
                      {{ errors.loanTerm }}
                    </small>
                  </div>

                  <div class="loan-field">
                    <label for="loan-purpose">Purpose</label>
                    <Select
                      v-model="form.loanPurpose"
                      input-id="loan-purpose"
                      :options="purposeOptions"
                      option-label="label"
                      option-value="value"
                      placeholder="Select purpose"
                      :invalid="Boolean(errors.loanPurpose)"
                      aria-describedby="loan-purpose-error"
                    />
                    <small
                      v-if="errors.loanPurpose"
                      id="loan-purpose-error"
                      class="loan-field__error"
                    >
                      {{ errors.loanPurpose }}
                    </small>
                  </div>
                </div>
              </fieldset>

              <Button type="submit" :loading="loanStore.submitting">
                <BadgeCheck :size="17" aria-hidden="true" />
                Check eligibility
              </Button>
              <p class="loan-form__note">
                <Info :size="15" aria-hidden="true" /> This estimate uses demo data and won’t affect
                your credit record.
              </p>
            </form>
          </template>
        </Card>

        <aside class="loan-outcome" aria-live="polite">
          <Message v-if="loanStore.submitError" severity="error" :closable="false">
            {{ loanStore.submitError }}
          </Message>

          <template v-if="loanStore.result">
            <Card class="loan-result">
              <template #title>
                <span>Your estimate</span>
              </template>
              <template #content>
                <div
                  class="loan-result__status"
                  :class="{
                    'loan-result__status--eligible': loanStore.result.eligibilityResult.isEligible,
                    'loan-result__status--declined':
                      loanStore.result.recommendedLoan.recommendedAmount === 0,
                  }"
                >
                  <strong>
                    {{
                      loanStore.result.eligibilityResult.isEligible
                        ? 'Likely eligible'
                        : loanStore.result.recommendedLoan.recommendedAmount > 0
                          ? 'Suggested loan amount'
                          : 'Not eligible right now'
                    }}
                  </strong>
                  <p>{{ loanStore.result.eligibilityResult.decisionReason }}</p>
                </div>

                <div
                  v-if="loanStore.result.recommendedLoan.recommendedAmount > 0"
                  class="loan-result__figures"
                >
                  <div>
                    <span>Suggested amount</span>
                    <strong>{{
                      formatCurrency(loanStore.result.recommendedLoan.recommendedAmount)
                    }}</strong>
                  </div>
                  <div>
                    <span>Monthly repayment</span>
                    <strong>{{
                      formatCurrency(loanStore.result.recommendedLoan.monthlyPayment)
                    }}</strong>
                  </div>
                  <div>
                    <span>Interest rate</span>
                    <strong>{{ loanStore.result.recommendedLoan.interestRate }}% a year</strong>
                  </div>
                  <div>
                    <span>Total repayment</span>
                    <strong>{{
                      formatCurrency(loanStore.result.recommendedLoan.totalRepayment)
                    }}</strong>
                  </div>
                  <div>
                    <span>Maximum amount</span>
                    <strong>{{
                      formatCurrency(loanStore.result.recommendedLoan.maxAmount)
                    }}</strong>
                  </div>
                </div>

                <section class="loan-result__affordability" aria-labelledby="affordability-title">
                  <div class="loan-result__affordability-heading">
                    <h3 id="affordability-title">Affordability</h3>
                    <span>{{
                      displayLabel(loanStore.result.affordabilityAnalysis.affordabilityScore)
                    }}</span>
                  </div>
                  <ProgressBar :value="loanStore.result.eligibilityResult.approvalLikelihood" />
                  <p>
                    Estimated approval likelihood:
                    {{ loanStore.result.eligibilityResult.approvalLikelihood }}%
                  </p>
                  <dl>
                    <div>
                      <dt>Disposable income</dt>
                      <dd>
                        {{
                          formatCurrency(loanStore.result.affordabilityAnalysis.disposableIncome)
                        }}
                        / month
                      </dd>
                    </div>
                    <div>
                      <dt>Debt-to-income</dt>
                      <dd>{{ loanStore.result.affordabilityAnalysis.debtToIncomeRatio }}%</dd>
                    </div>
                    <div>
                      <dt>Risk category</dt>
                      <dd>{{ displayLabel(loanStore.result.eligibilityResult.riskCategory) }}</dd>
                    </div>
                  </dl>
                </section>
              </template>
            </Card>

            <Message v-if="loanStore.rateError" severity="warn" :closable="false">
              {{ loanStore.rateError }}
            </Message>

            <Card v-if="loanStore.rate" class="loan-schedule">
              <template #title>Repayment schedule</template>
              <template #content>
                <div class="loan-schedule__summary">
                  <span
                    ><Wallet :size="16" aria-hidden="true" />
                    {{ formatCurrency(loanStore.rate.totalInterest) }} total interest</span
                  >
                  <span
                    ><Clock3 :size="16" aria-hidden="true" />
                    {{ loanStore.rate.paymentSchedule.length }} monthly payments</span
                  >
                </div>
                <DataTable
                  :value="loanStore.rate.paymentSchedule"
                  size="small"
                  striped-rows
                  scrollable
                  scroll-height="18rem"
                >
                  <Column field="month" header="Month" />
                  <Column header="Payment">
                    <template #body="{ data }">{{ formatCurrency(data.payment) }}</template>
                  </Column>
                  <Column header="Interest">
                    <template #body="{ data }">{{ formatCurrency(data.interest) }}</template>
                  </Column>
                  <Column header="Balance">
                    <template #body="{ data }">{{ formatCurrency(data.balance) }}</template>
                  </Column>
                </DataTable>
              </template>
            </Card>

            <p class="loan-view__disclaimer">
              This is an estimate based on simulated data, not a credit decision or a loan offer.
            </p>
          </template>

          <Card v-else-if="!loanStore.submitError" class="loan-result-placeholder">
            <template #content>
              <span class="loan-result-placeholder__icon"
                ><Wallet :size="26" aria-hidden="true"
              /></span>
              <h2>Your estimate will appear here</h2>
              <p>
                Complete the form to see a suggested amount, monthly repayment, and affordability
                details.
              </p>
            </template>
          </Card>
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
.loan-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.loan-view__heading {
  max-width: 48rem;
  margin: 0 auto 0.5rem;
  text-align: center;
}

.loan-view__eyebrow {
  margin: 0 0 0.45rem;
  color: var(--color-blue);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.loan-view__heading h1 {
  margin: 0;
}

.loan-view__heading > p:last-child {
  margin: 0.65rem 0 0;
  color: var(--color-muted);
}

.loan-view__loading {
  display: flex;
  min-height: 20rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-muted);
}

.loan-view__load-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.loan-product.p-card,
.loan-form-card.p-card,
.loan-result.p-card,
.loan-schedule.p-card,
.loan-result-placeholder.p-card {
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 6px 20px rgb(32 49 59 / 5%);
}

.loan-product :deep(.p-card-body),
.loan-form-card :deep(.p-card-body),
.loan-result :deep(.p-card-body),
.loan-schedule :deep(.p-card-body),
.loan-result-placeholder :deep(.p-card-body) {
  padding: 1.25rem;
}

.loan-product :deep(.p-card-content),
.loan-form-card :deep(.p-card-content),
.loan-result :deep(.p-card-content),
.loan-schedule :deep(.p-card-content),
.loan-result-placeholder :deep(.p-card-content) {
  padding: 0;
}

.loan-product__content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.loan-product__icon,
.loan-result-placeholder__icon {
  display: flex;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  background: #edf3ff;
  color: var(--color-blue);
}

.loan-product__copy {
  min-width: 0;
  flex: 1 1 auto;
}

.loan-product__copy h2 {
  margin: 0;
  color: var(--color-blue-dark);
  font-size: 1.2rem;
}

.loan-product__copy p:last-child {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
  font-size: 0.86rem;
}

.loan-product__terms {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  color: var(--color-muted);
  font-size: 0.78rem;
}

.loan-product__terms span:first-child {
  color: var(--color-blue-dark);
  font-size: 0.9rem;
  font-weight: 800;
}

.loan-layout {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}

.loan-form-card {
  min-width: 0;
  flex: 1 1 58%;
}

.loan-form-card :deep(.p-card-title),
.loan-result :deep(.p-card-title),
.loan-schedule :deep(.p-card-title) {
  color: var(--color-blue-dark);
  font-size: 1.1rem;
}

.loan-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.loan-form__section {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.loan-form__section legend {
  width: 100%;
  margin-bottom: 0.75rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-blue-dark);
  font-size: 0.9rem;
  font-weight: 800;
}

.loan-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.loan-field {
  display: flex;
  min-width: 0;
  flex: 1 1 14rem;
  flex-direction: column;
  gap: 0.35rem;
}

.loan-field label {
  color: var(--color-ink);
  font-size: 0.84rem;
  font-weight: 700;
}

.loan-field label span {
  color: var(--color-muted);
  font-weight: 500;
}

.loan-field :deep(.p-inputnumber),
.loan-field :deep(.p-select) {
  width: 100%;
}

.loan-field :deep(.p-inputnumber-input) {
  width: 100%;
}

.loan-field__error {
  color: #b42332;
  font-size: 0.76rem;
}

.loan-form > :deep(.p-button) {
  min-height: 46px;
  align-self: flex-start;
  gap: 0.5rem;
  padding-inline: 1.2rem;
  border-radius: 12px;
}

.loan-form__note {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin: -0.6rem 0 0;
  color: var(--color-muted);
  font-size: 0.76rem;
}

.loan-form__note svg {
  flex: 0 0 auto;
  color: var(--color-blue);
}

.loan-outcome {
  display: flex;
  min-width: 0;
  flex: 1 1 42%;
  flex-direction: column;
  gap: 1rem;
}

.loan-result__status {
  padding: 0.9rem 1rem;
  border-radius: 14px;
  background: #fff7e8;
  color: #754600;
}

.loan-result__status--eligible {
  background: #edf8f1;
  color: #14643a;
}

.loan-result__status--declined {
  background: #fff0f1;
  color: #982431;
}

.loan-result__status strong {
  font-size: 1rem;
}

.loan-result__status p {
  margin: 0.35rem 0 0;
  font-size: 0.83rem;
}

.loan-result__figures {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.9rem;
}

.loan-result__figures > div {
  display: flex;
  min-width: 8rem;
  flex: 1 1 calc(50% - 0.65rem);
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--color-canvas);
}

.loan-result__figures span {
  color: var(--color-muted);
  font-size: 0.73rem;
}

.loan-result__figures strong {
  color: var(--color-blue-dark);
  font-size: 0.95rem;
}

.loan-result__affordability {
  margin-top: 1.1rem;
}

.loan-result__affordability-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
}

.loan-result__affordability-heading h3 {
  margin: 0;
  color: var(--color-blue-dark);
  font-size: 0.95rem;
}

.loan-result__affordability-heading span {
  color: var(--color-blue-dark);
  font-size: 0.8rem;
  font-weight: 750;
}

.loan-result__affordability > p {
  margin: 0.4rem 0 0.8rem;
  color: var(--color-muted);
  font-size: 0.77rem;
}

.loan-result__affordability dl {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0;
}

.loan-result__affordability dl > div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.8rem;
}

.loan-result__affordability dt {
  color: var(--color-muted);
}

.loan-result__affordability dd {
  margin: 0;
  color: var(--color-ink);
  font-weight: 700;
  text-align: right;
}

.loan-schedule__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-bottom: 0.8rem;
  color: var(--color-muted);
  font-size: 0.78rem;
}

.loan-schedule__summary span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.loan-schedule__summary svg {
  color: var(--color-blue);
}

.loan-view__disclaimer {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.76rem;
}

.loan-result-placeholder {
  min-height: 15rem;
}

.loan-result-placeholder :deep(.p-card-content) {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.7rem;
}

.loan-result-placeholder h2 {
  margin: 0;
  color: var(--color-blue-dark);
  font-size: 1.1rem;
}

.loan-result-placeholder p {
  max-width: 36ch;
  margin: 0;
  color: var(--color-muted);
  font-size: 0.86rem;
}

@media (max-width: 920px) {
  .loan-layout {
    flex-direction: column;
  }

  .loan-form-card,
  .loan-outcome {
    width: 100%;
    flex-basis: auto;
  }
}

@media (max-width: 620px) {
  .loan-product__content {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .loan-product__terms {
    width: 100%;
    flex-basis: 100%;
    align-items: flex-start;
    padding-left: 4rem;
  }

  .loan-form-card :deep(.p-card-body),
  .loan-result :deep(.p-card-body),
  .loan-schedule :deep(.p-card-body),
  .loan-product :deep(.p-card-body),
  .loan-result-placeholder :deep(.p-card-body) {
    padding: 1rem;
  }
}
</style>
