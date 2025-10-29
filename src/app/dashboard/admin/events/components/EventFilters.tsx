import { Search, Filter, X } from "lucide-react"
import { useState } from "react"

interface EventFiltersProps {
  filters: any
  onFiltersChange: (filters: any) => void
  events: any[]
}

export default function EventFilters({ filters, onFiltersChange, events }: EventFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const eventTypes = Array.from(new Set(events.map(e => e.event_type).filter(Boolean)))
  const eventModes = Array.from(new Set(events.map(e => e.event_mode).filter(Boolean)))
  const statuses = ['all', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled']

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      event_type: '',
      event_mode: '',
      date_range: { start: null, end: null }
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.event_type || filters.event_mode || filters.date_range.start || filters.date_range.end

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced</span>
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status}
            </option>
          ))}
        </select>

        {/* Event Type */}
        <select
          value={filters.event_type}
          onChange={(e) => updateFilter('event_type', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Event Types</option>
          {eventTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Event Mode */}
        <select
          value={filters.event_mode}
          onChange={(e) => updateFilter('event_mode', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Modes</option>
          {eventModes.map(mode => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.date_range.start ? filters.date_range.start.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('date_range', {
                  ...filters.date_range,
                  start: e.target.value ? new Date(e.target.value) : null
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={filters.date_range.end ? filters.date_range.end.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('date_range', {
                  ...filters.date_range,
                  end: e.target.value ? new Date(e.target.value) : null
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}