export default function Loading() {
  return (
    <main className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-100">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-700 border-t-amber-500" />

        <p className="text-sm uppercase tracking-[0.3em] text-stone-400">
          Burnishing Edges...
        </p>
      </div>
    </main>
  );
}
