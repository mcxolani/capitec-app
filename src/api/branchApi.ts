import type { Branch } from '@/types/branch'

const HOURS = 'Mon–Fri 08:30–16:30 · Sat 08:30–12:30'

const BRANCHES: Branch[] = [
  {
    id: 'sandton-city',
    name: 'Sandton City',
    address: 'Sandton City, Rivonia Rd, Sandhurst',
    position: { lat: -26.1076, lng: 28.0567 },
    phone: '011 555 0101',
    hours: HOURS,
  },
  {
    id: 'rosebank',
    name: 'Rosebank',
    address: 'The Zone, Oxford Rd, Rosebank',
    position: { lat: -26.1457, lng: 28.0436 },
    phone: '011 555 0102',
    hours: HOURS,
  },
  {
    id: 'fourways',
    name: 'Fourways',
    address: 'Fourways Mall, Witkoppen Rd, Fourways',
    position: { lat: -26.023, lng: 28.007 },
    phone: '011 555 0103',
    hours: HOURS,
  },
  {
    id: 'randburg',
    name: 'Randburg',
    address: 'Randburg Waterfront, Republic Rd, Randburg',
    position: { lat: -26.094, lng: 28.0 },
    phone: '011 555 0104',
    hours: HOURS,
  },
  {
    id: 'braamfontein',
    name: 'Braamfontein',
    address: 'Jorissen St, Braamfontein',
    position: { lat: -26.1925, lng: 28.034 },
    phone: '011 555 0105',
    hours: HOURS,
  },
  {
    id: 'eastgate',
    name: 'Eastgate',
    address: 'Eastgate Shopping Centre, Bedfordview',
    position: { lat: -26.183, lng: 28.155 },
    phone: '011 555 0106',
    hours: HOURS,
  },
  {
    id: 'waterfall',
    name: 'Waterfall',
    address: 'Mall of Africa, Lone Creek Cres, Waterfall City',
    position: { lat: -26.0158, lng: 28.1099 },
    phone: '011 555 0107',
    hours: HOURS,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    address: 'Centurion Mall, Heuwel Rd, Centurion',
    position: { lat: -25.8603, lng: 28.1894 },
    phone: '012 555 0108',
    hours: HOURS,
  },
  {
    id: 'menlyn',
    name: 'Menlyn',
    address: 'Menlyn Park, Atterbury Rd, Pretoria',
    position: { lat: -25.784, lng: 28.2764 },
    phone: '012 555 0109',
    hours: HOURS,
  },
  {
    id: 'pretoria-cbd',
    name: 'Pretoria CBD',
    address: 'Church Square, Pretoria',
    position: { lat: -25.7461, lng: 28.1881 },
    phone: '012 555 0110',
    hours: HOURS,
  },
  {
    id: 'maponya',
    name: 'Maponya Mall',
    address: 'Maponya Mall, Klipspruit Valley Rd, Soweto',
    position: { lat: -26.257, lng: 27.909 },
    phone: '011 555 0111',
    hours: HOURS,
  },
  {
    id: 'boksburg',
    name: 'Boksburg',
    address: 'Boksburg Mall, Trichardts Rd, Boksburg',
    position: { lat: -26.212, lng: 28.251 },
    phone: '011 555 0112',
    hours: HOURS,
  },
]

export async function fetchBranches(): Promise<Branch[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return BRANCHES
}
