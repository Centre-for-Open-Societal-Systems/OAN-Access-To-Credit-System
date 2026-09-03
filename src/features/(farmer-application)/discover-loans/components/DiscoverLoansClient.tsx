'use client';

import CatalogBrowser, { type CatalogCardControls } from '@/components/loan-catalog/CatalogBrowser';
import CatalogCard from '@/components/loan-catalog/CatalogCard';
import type { CatalogProduct } from '@/types/loan-catalog';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import { getCatalog, removeBookmark, saveBookmark } from '../../api/farmerApi';

export default function DiscoverLoansClient() {
  // Rethrows: the card renders the new state optimistically and needs to know
  // when the write failed so it can put the bookmark back rather than keep
  // showing a save that never happened.
  const handleBookmarkToggle = useCallback(
    async (product: CatalogProduct, isCurrentlyBookmarked: boolean) => {
      if (isCurrentlyBookmarked) {
        await removeBookmark(product.name);
      } else {
        await saveBookmark(product.name);
      }
    },
    []
  );

  const renderCard = useCallback(
    (product: CatalogProduct, controls: CatalogCardControls) => (
      <CatalogCard
        key={product.name}
        product={product}
        {...(controls.onBookmarkToggle ? { onBookmarkToggle: controls.onBookmarkToggle } : {})}
        actions={
          <Link
            href={`/discover-loans/apply/${product.name}`}
            className="w-full bg-[#16A34A] hover:bg-green-700 !text-white font-bold py-2.5 px-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
          >
            Apply Now <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />
    ),
    []
  );

  return (
    <CatalogBrowser
      fetchProducts={getCatalog}
      renderCard={renderCard}
      onBookmarkToggle={handleBookmarkToggle}
    />
  );
}
