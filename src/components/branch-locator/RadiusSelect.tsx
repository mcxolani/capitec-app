const OPTIONS = [1, 5, 10, 25, 50]

interface Props {
  value: number
  onChange: (km: number) => void
}

export default function RadiusSelect({ value, onChange }: Props) {
  return (
    <label className="radius">
      <span>Radius</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {OPTIONS.map((km) => (
          <option key={km} value={km}>
            {km} km
          </option>
        ))}
      </select>
    </label>
  )
}
