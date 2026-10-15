import { useGeolocation } from '@/hooks/useGeolocation'
import type { Origin } from '@/types/branch'

interface Props {
  onLocated: (origin: Origin) => void
}

export default function UseMyLocation({ onLocated }: Props) {
  const { locate, loading, error } = useGeolocation()

  const handleClick = async () => {
    const position = await locate()
    if (position) onLocated({ position, label: 'My location' })
  }

  return (
    <div className="use-my-location">
      <button
        type="button"
        className="btn use-my-location__btn"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Locating…' : 'Use my location'}
      </button>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
