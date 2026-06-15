
export default function Footer() {
  return (
    <footer className="border-t border-(--hestia-border) bg-(--hestia-sidebar)">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between w-full">
          <div className="flex flex-col gap-2">
            <span className="font-newsreader text-2xl font-bold text-(--hestia-accent) italic">
              HestIA
            </span>
                <p className="text-sm text-(--hestia-muted) max-w-xs leading-relaxed">
                  La chispa que convierte ingredientes en recetas
                </p>
          </div>
                <p className="text-xs text-(--hestia-muted)">
                  &copy; 2026 HestIA
                </p>
        </div>
      </div>
    </footer>
  )
}