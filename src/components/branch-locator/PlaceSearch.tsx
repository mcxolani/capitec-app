import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { useDebounce } from '@/hooks/useDebounce'
import type { Origin } from '@/types/branch'

interface Props {
  value: string
  onValueChange: (value: string) => void
  onSelect: (origin: Origin) => void
}

interface Suggestion {
  id: string
  text: string
  prediction: google.maps.places.PlacePrediction
}

export default function PlaceSearch({ value, onValueChange, onSelect }: Props) {
  const places = useMapsLibrary('places')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)

  const [term, setTerm] = useState('') // only set by typing, not by programmatic value changes
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)

  const debouncedTerm = useDebounce(term, 250)
  const visible = term.trim().length >= 3 ? suggestions : []

  useEffect(() => {
    if (!places || debouncedTerm.trim().length < 3) return
    let cancelled = false

    sessionRef.current ??= new places.AutocompleteSessionToken()

    places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: debouncedTerm,
      sessionToken: sessionRef.current,
      includedRegionCodes: ['za'],
    })
      .then(({ suggestions }) => {
        if (cancelled) return
        setSuggestions(
          suggestions.flatMap((s) =>
            s.placePrediction
              ? [
                  {
                    id: s.placePrediction.placeId,
                    text: s.placePrediction.text.toString(),
                    prediction: s.placePrediction,
                  },
                ]
              : [],
          ),
        )
        setActiveIndex(-1)
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })

    return () => {
      cancelled = true
    }
  }, [places, debouncedTerm])

  // close the dropdown when clicking outside the component
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const handleSelect = async (suggestion: Suggestion) => {
    setOpen(false)
    setSuggestions([])
    setTerm('')
    setError(null)
    onValueChange(suggestion.text)
    inputRef.current?.blur()

    try {
      const place = suggestion.prediction.toPlace()
      await place.fetchFields({ fields: ['location', 'formattedAddress'] })
      sessionRef.current = null // the session ends once place details are fetched
      if (!place.location) throw new Error('No location returned')

      onSelect({
        position: { lat: place.location.lat(), lng: place.location.lng() },
        label: place.formattedAddress ?? suggestion.text,
      })
    } catch {
      setError('Could not load that place. Try another search.')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!open || visible.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % visible.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? visible.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      void handleSelect(visible[activeIndex])
    }
  }

  return (
    <div className="place-search" ref={containerRef}>
      <label htmlFor="place-search-input" className="visually-hidden">
        Search for an address
      </label>
      <input
        id="place-search-input"
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open && visible.length > 0}
        aria-controls="place-search-list"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Search an address or suburb"
        disabled={!places}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value)
          setTerm(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {open && visible.length > 0 && (
        <ul id="place-search-list" role="listbox" className="place-search__list">
          {visible.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === activeIndex}
              className={
                i === activeIndex
                  ? 'place-search__option place-search__option--active'
                  : 'place-search__option'
              }
              onMouseDown={(e) => {
                e.preventDefault()
                void handleSelect(s)
              }}
            >
              {s.text}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
