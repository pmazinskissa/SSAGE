export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-white/40 backdrop-blur-sm" data-print-hide>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-center gap-2 text-xs text-text-secondary">
        <span>&copy; Powered by</span>
        <a href="https://www.ssaandco.com" target="_blank" rel="noopener noreferrer">
          <img
            src="/assets/ssa-header-logo.jpg"
            alt="SSA & Co"
            className="h-5 opacity-70 hover:opacity-100 transition-opacity"
          />
        </a>
      </div>
    </footer>
  );
}
