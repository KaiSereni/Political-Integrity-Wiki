'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase-client'

interface SearchResult {
  id: string
  name: string
  status?: string
  locations?: string[]
}

export default function SearchBarClient({ defaultValue = '' }: { defaultValue?: string }) {
  const [searchQuery, setSearchQuery] = useState(defaultValue)
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const searchFn = httpsCallable<{ query: string }, { candidates: SearchResult[] }>(functions, 'search_candidates_fn')
        const result = await searchFn({ query: value })
        setResults(result.data.candidates)
        setShowResults(true)
      } catch (err) {
        console.error('Search failed:', err)
        setResults([])
      }
      setIsSearching(false)
    }, 300)
  }

  return (
    <>
      <input
        id="search-candidates"
        name="q"
        type="search"
        className="search-input"
        placeholder="Search by name, state, or region..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setShowResults(true)}
        aria-label="Search candidates"
        autoComplete="off"
      />
      {showResults && (
        <div className="search-results animate-fade-in">
          {isSearching && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching...
            </div>
          )}
          {!isSearching && results.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No candidates found
            </div>
          )}
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/candidate/${r.id}`}
              className="search-result-item"
              onClick={() => setShowResults(false)}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-secondary)',
              }}>
                {r.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {r.status?.replace('_', ' ') || 'Unknown status'}
                  {r.locations && r.locations.length > 0 && (
                    <> • {r.locations.join(', ')}</>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
