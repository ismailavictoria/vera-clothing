import { Heart } from 'lucide-react';
import { useWishlist } from '../features/wishlist/WishlistContext';

export function WishlistButton({ productId, className = '' }: { productId: string; className?: string }) {
  const wishlist = useWishlist();
  const saved = wishlist.has(productId);
  return (
    <button
      type="button"
      className={`icon-button heart-button ${saved ? 'is-saved' : ''} ${className}`}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={saved}
      onClick={() => wishlist.toggle(productId)}
    >
      <Heart size={18} strokeWidth={1.6} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
