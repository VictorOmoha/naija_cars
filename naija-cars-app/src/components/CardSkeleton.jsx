const CardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl shadow-card overflow-hidden animate-pulse">
          <div className="h-56 bg-pearl-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-pearl-200 rounded w-3/4" />
            <div className="h-4 bg-pearl-200 rounded w-1/2" />
            <div className="flex gap-3">
              <div className="h-4 bg-pearl-200 rounded w-16" />
              <div className="h-4 bg-pearl-200 rounded w-16" />
              <div className="h-4 bg-pearl-200 rounded w-16" />
            </div>
            <div className="h-4 bg-pearl-200 rounded w-2/3" />
            <div className="border-t border-pearl-200 pt-3">
              <div className="h-6 bg-pearl-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
