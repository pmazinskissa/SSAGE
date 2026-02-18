import { useMemo } from 'react';
import { Play } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface VideoEmbedProps {
  url: string;
  title?: string;
  caption?: string;
}

function toEmbedUrl(url: string): string {
  // YouTube — use privacy-enhanced domain and pass origin
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    const origin = encodeURIComponent(window.location.origin);
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?origin=${origin}&rel=0`;
  }

  // Vimeo
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/)(\d+)/
  );
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Already an embed or other URL
  return url;
}

export default function VideoEmbed({ url, title, caption }: VideoEmbedProps) {
  const embedUrl = useMemo(() => toEmbedUrl(url), [url]);

  return (
    <ScrollReveal>
      <div className="my-8" data-print-video data-video-url={url}>
        {title && (
          <div className="flex items-center gap-2 mb-3">
            <Play size={18} className="text-primary" />
            <span className="text-sm font-semibold text-text-primary">{title}</span>
          </div>
        )}

        {/* Responsive 16:9 container */}
        <div className="relative w-full overflow-hidden rounded-card border border-border shadow-elevation-1" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title={title || 'Video'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        {caption && (
          <p className="mt-2 text-xs text-text-secondary text-center italic">
            {caption}
          </p>
        )}

        {/* Print-only: show URL text */}
        <p className="hidden print:block mt-2 text-xs text-text-secondary">
          Video: {url}
        </p>
      </div>
    </ScrollReveal>
  );
}
