import { useNavigate } from 'react-router-dom'
import { Group, Button } from '@ui8kit/core'
import { useState } from 'react'

export function SearchBar({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial)
  const nav = useNavigate()
  const go = () => nav(`/search?q=${encodeURIComponent(q)}`)
  return (
    <Group gap="sm" align="center">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') go() }}
        placeholder="input text..."
        aria-label="Search"
        data-class="search-input"
        className="p-2 text-sm text-foreground rounded-lg border border-input bg-input focus:outline-none focus:ring focus:ring-primary"
      />
      <Button onClick={go}>Search</Button>
    </Group>
  )
}


