"use client"

import { Search } from "lucide-react"
import { useState } from "react"

type Props = {
  onQueryChange?: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ onQueryChange, placeholder = "Search anything..." }: Props) {
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchValue)
    // Add your search logic here
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="glass-morphism relative flex items-center gap-3 rounded-2xl px-6 py-4 transition-all duration-300 hover:shadow-glass-hover focus-within:shadow-glass-focus focus-within:border-white/30">
        <Search className="h-5 w-5 text-white/70 flex-shrink-0" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            const v = e.target.value
            setSearchValue(v)
            onQueryChange?.(v)
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-base"
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => {
              setSearchValue("")
              onQueryChange?.("")
            }}
            className="text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}