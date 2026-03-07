import { useState } from 'react'

export default function TopNav({ signOut }) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 bg-surface-200/90 backdrop-blur-md border-b border-surface-300/50 sticky top-0 z-30">
      {/* Search / command bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div
          className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-100 border transition-all ${
            searchFocused ? 'border-accent-blue/50 ring-1 ring-accent-blue/20' : 'border-transparent'
          }`}
        >
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-300 text-surface-500 text-xs font-mono">
            ⌘K
          </kbd>
          <input
            type="text"
            placeholder="Search or run a command..."
            className="flex-1 bg-transparent text-sm text-surface-800 placeholder:text-surface-500 outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Quick add */}
        <button className="p-2 rounded-lg text-surface-500 hover:bg-surface-300 hover:text-surface-800 transition-colors" title="Quick add">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-surface-500 hover:bg-surface-300 hover:text-surface-800 transition-colors" title="Notifications">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-blue" />
        </button>
        {/* AI assistant */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-indigo/20 text-accent-indigo hover:bg-accent-indigo/30 transition-colors text-sm font-medium" title="AI Assistant">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="hidden sm:inline">AI</span>
        </button>
        {/* Profile */}
        <button className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center text-white text-sm font-semibold shadow-card" title="Profile">
          J
        </button>
        {/* Sign out */}
        <button
          onClick={signOut}
          className="ml-1 p-2 rounded-lg text-surface-500 hover:bg-surface-300 hover:text-surface-800 transition-colors"
          title="Sign out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
