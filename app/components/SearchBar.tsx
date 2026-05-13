import SearchBarClient from './SearchBarClient'

export default function SearchBar({ className = '', defaultValue = '' }: { className?: string; defaultValue?: string }) {
  return (
    <form action="/search" method="GET" className={`search-wrapper ${className}`}>
      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <SearchBarClient defaultValue={defaultValue} />
      <noscript>
        <button type="submit" className="btn btn-primary btn-sm" style={{ marginLeft: '0.5rem' }}>Search</button>
      </noscript>
    </form>
  )
}
