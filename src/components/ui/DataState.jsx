export default function DataState({ loading, error, children }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-4 py-3 text-sm text-red-400">
        Error: {error}
      </div>
    )
  }
  return children
}
