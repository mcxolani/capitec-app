<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  LCircle,
  LCircleMarker,
  LMap,
  LPopup,
  LTileLayer,
  LTooltip,
} from '@vue-leaflet/vue-leaflet'
import type { BranchSearchResult, Location, Position } from '@/types/branch'

const props = defineProps<{
  branches: BranchSearchResult[]
  center: Position
  zoom: number
  origin: Location | null
  radiusKm: number | null
  selectedBranchId: string | null
}>()

const emit = defineEmits<{
  selectBranch: [id: string]
}>()

const mapCenter = ref<[number, number]>([props.center.lat, props.center.lng])
const mapZoom = ref(props.zoom)
const tileUrl =
  import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution =
  import.meta.env.VITE_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>'

watch(
  () => props.center,
  (center) => (mapCenter.value = [center.lat, center.lng]),
)
watch(
  () => props.zoom,
  (zoom) => (mapZoom.value = zoom),
)
</script>

<template>
  <div class="branch-map" role="region" aria-label="Map of bank branches">
    <LMap v-model:zoom="mapZoom" v-model:center="mapCenter" :use-global-leaflet="false">
      <LTileLayer :url="tileUrl" :attribution="tileAttribution" :max-zoom="19" />

      <LCircle
        v-if="origin && radiusKm"
        :lat-lng="[origin.position.lat, origin.position.lng]"
        :radius="radiusKm * 1000"
        color="#2463eb"
        fill-color="#2463eb"
        :fill-opacity="0.08"
        :weight="2"
      />

      <LCircleMarker
        v-if="origin"
        :lat-lng="[origin.position.lat, origin.position.lng]"
        :radius="8"
        color="#ffffff"
        fill-color="#2463eb"
        :weight="3"
        :fill-opacity="1"
      >
        <LTooltip>{{ origin.label }}</LTooltip>
      </LCircleMarker>

      <LCircleMarker
        v-for="branch in branches"
        :key="branch.id"
        :lat-lng="[branch.position.lat, branch.position.lng]"
        :radius="branch.id === selectedBranchId ? 10 : 7"
        :color="branch.id === selectedBranchId ? '#ffffff' : '#003da6'"
        :fill-color="branch.id === selectedBranchId ? '#e42234' : '#2463eb'"
        :weight="branch.id === selectedBranchId ? 3 : 2"
        :fill-opacity="1"
        @click="emit('selectBranch', branch.id)"
      >
        <LTooltip>{{ branch.name }}</LTooltip>
        <LPopup>
          <strong>{{ branch.name }}</strong>
          <p>{{ branch.address }}</p>
          <a :href="`tel:${branch.phone}`">{{ branch.phone }}</a>
        </LPopup>
      </LCircleMarker>
    </LMap>
  </div>
</template>

<style scoped>
.branch-map {
  min-height: 34rem;
  flex: 1 1 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: #e9eff7;
}

.branch-map :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  min-height: 34rem;
  font-family: var(--font-sans);
}

.branch-map :deep(.leaflet-popup-content p) {
  margin: 0.5rem 0;
}

.branch-map :deep(.leaflet-popup-content a) {
  color: var(--color-blue-dark);
  font-weight: 700;
}

@media (max-width: 760px) {
  .branch-map,
  .branch-map :deep(.leaflet-container) {
    min-height: 24rem;
  }
}
</style>
