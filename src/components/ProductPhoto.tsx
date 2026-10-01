import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ProductPhotoProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

/** Render a product image or a calm accessible placeholder when no image is available. */
export function ProductPhoto({ src, alt, className = '', loading = 'lazy' }: ProductPhotoProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className={`product-image-placeholder ${className}`} role="img" aria-label={alt || 'Product image unavailable'}>
        <ImageIcon size={25} strokeWidth={1.2} aria-hidden="true" />
        <span>Image coming soon</span>
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} loading={loading} onError={() => setFailed(true)} />;
}
