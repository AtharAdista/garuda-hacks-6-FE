import type { CultureEntry } from "@/interfaces/cultureentry-type";

export default function CultureEntryList({
  entries,
  onEntryClick,
}: {
  entries: CultureEntry[];
  onEntryClick?: (entry: CultureEntry) => void;
}) {
  if (!entries.length) {
    return (
      <div className="text-gray-500 text-center py-8">
        Tidak ada entri budaya.
      </div>
    );
  }
  return (
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onEntryClick?.(entry)}
          className="bg-white rounded-xl shadow p-4 flex flex-col"
        >
          {entry.image ? (
            <img
              src={entry.image}
              alt={entry.title}
              className="rounded-lg h-40 object-cover mb-3"
            />
          ) : (
            <div className="h-40 bg-green-400 rounded-lg flex items-center justify-center text-5xl text-white mb-3">
              {/* Icon fallback */}
              {entry.type === "Tarian"
                ? "💃"
                : entry.type === "Musik dan Lagu"
                ? "🎵"
                : "📖"}
            </div>
          )}
          <div className="font-bold text-lg mb-1">{entry.title}</div>
          <div className="flex gap-2 mb-1">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
              {entry.type}
            </span>
            <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">
              {entry.province}
            </span>
          </div>
          <div className="text-gray-600 text-sm mb-2 line-clamp-3">
            {entry.description}
          </div>
          {entry.author && (
            <div className="text-xs text-gray-500 mt-auto">
              👤 {entry.author}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
