export default function ResumesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-100" />
      </div>

      {/* Grid */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-100" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-8 flex-1 animate-pulse rounded-xl bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
