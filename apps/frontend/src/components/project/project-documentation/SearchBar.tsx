import React from 'react'
import { Icon } from '@iconify/react'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative">
      <Icon
        icon="solar:magnifer-linear"
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
      />
      <input
        type="text"
        placeholder="Search endpoints..."
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}

export default SearchBar