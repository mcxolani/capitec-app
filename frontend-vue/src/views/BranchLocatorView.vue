<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowUpRight, Clock3, LocateFixed, MapPin, Navigation, Phone, Search } from '@lucide/vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import BranchMap from '@/components/branch-locator/BranchMap.vue'
import { findAddress } from '@/api/locationApi'
import { useBranchStore } from '@/stores/branchStore'
import { distanceInKm } from '@/utils/distance'
import type { BranchSearchResult, Location } from '@/types/branch'

const branchStore = useBranchStore()
const searchText = ref('')
const searchError = ref('')
const searchLoading = ref(false)
const locationLoading = ref(false)
const origin = ref<Location | null>(null)
const radiusKm = ref<number | null>(25)
const selectedBranchId = ref<string | null>(null)
const mapCenter = ref({ lat: -29.2, lng: 24.5 })
const mapZoom = ref(5)

const radiusOptions = [
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 25 km', value: 25 },
  { label: 'Within 50 km', value: 50 },
  { label: 'Any distance', value: null },
]

const visibleBranches = computed<BranchSearchResult[]>(() => {
  const branches = branchStore.branches.map((branch) => ({
    ...branch,
    distanceKm: origin.value ? distanceInKm(origin.value.position, branch.position) : null,
  }))

  if (!origin.value) return branches

  branches.sort((left, right) => (left.distanceKm ?? 0) - (right.distanceKm ?? 0))

  const maxDistance = radiusKm.value
  if (maxDistance === null) return branches

  return branches.filter((branch) => branch.distanceKm !== null && branch.distanceKm <= maxDistance)
})

const selectedBranch = computed(
  () =>
    visibleBranches.value.find((branch) => branch.id === selectedBranchId.value) ??
    (origin.value ? (visibleBranches.value[0] ?? null) : null),
)

function formatDistance(distance: number | null) {
  return distance === null ? '' : `${distance.toFixed(1)} km away`
}

function updateOrigin(location: Location) {
  origin.value = location
  searchText.value = location.label
  searchError.value = ''
  selectedBranchId.value = null
  mapCenter.value = location.position
  mapZoom.value = 10
}

async function searchAddress() {
  const query = searchText.value.trim()
  if (!query) return

  searchLoading.value = true
  searchError.value = ''

  try {
    updateOrigin(await findAddress(query))
  } catch (error) {
    searchError.value =
      error instanceof Error ? error.message : 'Could not find that address. Try another search.'
  } finally {
    searchLoading.value = false
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    searchError.value = 'Location is not available in this browser.'
    return
  }

  locationLoading.value = true
  searchError.value = ''

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      updateOrigin({
        label: 'Your current location',
        position: { lat: coords.latitude, lng: coords.longitude },
      })
      locationLoading.value = false
    },
    () => {
      searchError.value =
        'Could not get your location. Check your browser permissions and try again.'
      locationLoading.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 },
  )
}

function selectBranch(id: string) {
  const branch = visibleBranches.value.find((item) => item.id === id)
  if (!branch) return

  selectedBranchId.value = id
  mapCenter.value = branch.position
  mapZoom.value = 14
}

function directionsUrl(branch: BranchSearchResult) {
  const destination = `${branch.position.lat},${branch.position.lng}`
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`
}

onMounted(() => branchStore.loadBranches())
</script>

<template>
  <section class="branch-view" aria-labelledby="branch-title">
    <header class="branch-view__heading">
      <p class="branch-view__eyebrow">Branch finder</p>
      <h1 id="branch-title">Find your nearest branch</h1>
      <p>Search by address or use your location to see nearby branches on the map.</p>
    </header>

    <form class="branch-search" role="search" @submit.prevent="searchAddress">
      <label class="branch-search__field" for="branch-address">
        <Search :size="19" aria-hidden="true" />
        <InputText
          id="branch-address"
          v-model="searchText"
          placeholder="Enter a suburb, city or address"
          autocomplete="street-address"
        />
      </label>
      <Button type="submit" :disabled="!searchText.trim()" :loading="searchLoading">
        Search area
      </Button>
      <span class="branch-search__divider" aria-hidden="true">or</span>
      <Button
        type="button"
        severity="secondary"
        outlined
        :loading="locationLoading"
        @click="useMyLocation"
      >
        <LocateFixed :size="17" aria-hidden="true" />
        Use my location
      </Button>
    </form>

    <Message v-if="searchError" severity="error" :closable="false" class="branch-view__message">
      {{ searchError }}
    </Message>
    <Message
      v-if="branchStore.error"
      severity="error"
      :closable="false"
      class="branch-view__message"
    >
      {{ branchStore.error }}
    </Message>

    <div v-if="branchStore.loading" class="branch-view__loading" role="status">
      <ProgressSpinner aria-label="Loading branches" />
      <span>Loading branches…</span>
    </div>

    <div v-else class="branch-locator">
      <aside class="branch-locator__sidebar" aria-label="Branch search results">
        <div class="branch-results__heading">
          <div>
            <p class="branch-view__eyebrow">{{ origin ? 'Nearest branches' : 'Our branches' }}</p>
            <h2>{{ origin ? 'Branches near you' : 'Browse all branches' }}</h2>
          </div>
          <Select
            v-model="radiusKm"
            :options="radiusOptions"
            option-label="label"
            option-value="value"
            :disabled="!origin"
            aria-label="Maximum distance"
            class="branch-results__radius"
          />
        </div>

        <p v-if="origin" class="branch-results__origin">
          <MapPin :size="16" aria-hidden="true" />
          {{ origin.label }}
        </p>
        <p class="branch-results__count" aria-live="polite">
          {{ visibleBranches.length }} {{ visibleBranches.length === 1 ? 'branch' : 'branches' }}
          {{ origin && radiusKm !== null ? `within ${radiusKm} km` : 'shown on the map' }}
        </p>

        <p v-if="visibleBranches.length === 0" class="branch-results__empty">
          No branches found in this area. Try a larger distance or another location.
        </p>

        <ul v-else class="branch-results__list">
          <li v-for="branch in visibleBranches" :key="branch.id" class="branch-results__item">
            <button
              type="button"
              class="branch-result"
              :class="{ 'branch-result--selected': branch.id === selectedBranch?.id }"
              :aria-pressed="branch.id === selectedBranch?.id"
              :aria-expanded="branch.id === selectedBranch?.id"
              :aria-controls="`branch-details-${branch.id}`"
              @click="selectBranch(branch.id)"
            >
              <span class="branch-result__topline">
                <strong>{{ branch.name }}</strong>
                <span v-if="branch.distanceKm !== null" class="branch-result__distance">
                  {{ formatDistance(branch.distanceKm) }}
                </span>
              </span>
              <span class="branch-result__address">{{ branch.address }}</span>
            </button>

            <div
              v-if="branch.id === selectedBranch?.id"
              :id="`branch-details-${branch.id}`"
              class="branch-result__details"
            >
              <p class="branch-result__hours">
                <Clock3 :size="15" aria-hidden="true" /> {{ branch.hours }}
              </p>
              <p class="branch-result__phone">
                <Phone :size="15" aria-hidden="true" />
                <a :href="`tel:${branch.phone}`">{{ branch.phone }}</a>
              </p>
              <p v-if="branch.distanceKm !== null" class="branch-result__distance-row">
                <Navigation :size="15" aria-hidden="true" /> {{ formatDistance(branch.distanceKm) }}
              </p>
              <a
                class="branch-result__directions"
                :href="directionsUrl(branch)"
                target="_blank"
                rel="noreferrer"
              >
                Get directions <ArrowUpRight :size="15" aria-hidden="true" />
              </a>
            </div>
          </li>
        </ul>
      </aside>

      <BranchMap
        :branches="visibleBranches"
        :center="mapCenter"
        :zoom="mapZoom"
        :origin="origin"
        :radius-km="radiusKm"
        :selected-branch-id="selectedBranch?.id ?? null"
        @select-branch="selectBranch"
      />
    </div>

    <p class="branch-view__map-credit">
      Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>.
      Address search uses OpenStreetMap Nominatim.
    </p>
  </section>
</template>

<style scoped>
.branch-view__heading {
  max-width: 48rem;
  margin: 0 auto 1.75rem;
  text-align: center;
}

.branch-view__eyebrow {
  margin: 0 0 0.5rem;
  color: var(--color-blue);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.branch-view h1,
.branch-results__heading h2 {
  margin: 0;
  color: var(--color-blue-dark);
}

.branch-view__heading > p:last-child {
  margin: 0.7rem 0 0;
  color: var(--color-muted);
}

.branch-search {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 26px rgb(32 49 59 / 5%);
}

.branch-search__field {
  display: flex;
  min-width: 12rem;
  flex: 1 1 22rem;
  align-items: center;
  gap: 0.65rem;
  padding-left: 0.65rem;
  color: var(--color-muted);
}

.branch-search__field :deep(.p-inputtext) {
  width: 100%;
  border: 0;
  box-shadow: none;
}

.branch-search__divider {
  color: var(--color-muted);
  font-size: 0.8rem;
}

.branch-search :deep(.p-button) {
  min-height: 44px;
  gap: 0.5rem;
  border-radius: 12px;
  white-space: nowrap;
}

.branch-view__message {
  margin-bottom: 1rem;
}

.branch-view__loading {
  display: flex;
  min-height: 24rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-muted);
}

.branch-locator {
  display: flex;
  align-items: stretch;
  gap: 1rem;
}

.branch-locator__sidebar {
  display: flex;
  width: min(100%, 25rem);
  max-height: 36rem;
  flex: 0 0 25rem;
  flex-direction: column;
  gap: 0.75rem;
}

.branch-results__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
}

.branch-results__heading h2 {
  font-size: 1.2rem;
}

.branch-results__radius {
  max-width: 10rem;
  flex: 0 0 10rem;
}

.branch-results__origin,
.branch-results__count {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 0.82rem;
}

.branch-results__origin svg {
  flex: 0 0 auto;
  color: var(--color-blue);
}

.branch-results__list {
  display: flex;
  min-height: 5rem;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0.55rem;
  overflow-y: auto;
  margin: 0;
  padding: 0 0.2rem 0 0;
  list-style: none;
}

.branch-results__item {
  display: flex;
  flex-direction: column;
}

.branch-result {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: #fff;
  color: var(--color-ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease;
}

.branch-result:hover,
.branch-result--selected {
  border-color: var(--color-blue);
  background: #f6f9ff;
}

.branch-result__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
}

.branch-result__topline strong {
  color: var(--color-blue-dark);
  font-size: 0.92rem;
}

.branch-result__distance {
  flex: 0 0 auto;
  color: var(--color-blue-dark);
  font-size: 0.76rem;
  font-weight: 750;
}

.branch-result__address,
.branch-result__hours,
.branch-result__phone,
.branch-result__distance-row {
  color: var(--color-muted);
  font-size: 0.78rem;
}

.branch-result__hours,
.branch-result__phone,
.branch-result__distance-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
}

.branch-result--selected {
  border-radius: 14px 14px 0 0;
}

.branch-result__details {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: -1px;
  padding: 0.7rem 0.9rem 0.85rem;
  border: 1px solid var(--color-blue);
  border-top: 0;
  border-radius: 0 0 14px 14px;
  background: #f6f9ff;
}

.branch-result__hours svg,
.branch-result__phone svg,
.branch-result__distance-row svg {
  flex: 0 0 auto;
  color: var(--color-blue);
}

.branch-result__phone a,
.branch-result__directions {
  color: var(--color-blue-dark);
  font-weight: 750;
  text-decoration: none;
}

.branch-result__directions {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.35rem;
  font-size: 0.8rem;
}

.branch-result__phone a:hover,
.branch-result__directions:hover {
  text-decoration: underline;
}

.branch-results__empty {
  margin: 0;
  padding: 1.25rem;
  border-radius: 14px;
  background: var(--color-canvas);
  color: var(--color-muted);
  font-size: 0.9rem;
}

.branch-view__map-credit {
  margin: 0.65rem 0 0;
  color: var(--color-muted);
  font-size: 0.72rem;
  text-align: right;
}

.branch-view__map-credit a {
  color: inherit;
}

@media (max-width: 940px) {
  .branch-locator__sidebar {
    flex-basis: 21rem;
    width: 21rem;
  }
}

@media (max-width: 760px) {
  .branch-search {
    flex-wrap: wrap;
  }

  .branch-search__field {
    flex-basis: 100%;
    min-height: 42px;
  }

  .branch-search > :deep(.p-button) {
    flex: 1 1 auto;
    justify-content: center;
  }

  .branch-search__divider {
    display: none;
  }

  .branch-locator {
    flex-direction: column-reverse;
  }

  .branch-locator__sidebar {
    width: 100%;
    max-height: none;
    flex-basis: auto;
  }

  .branch-results__list {
    max-height: 25rem;
  }

  .branch-view__map-credit {
    text-align: left;
  }
}
</style>
