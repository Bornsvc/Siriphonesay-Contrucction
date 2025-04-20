'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Maximum number of page buttons to show
    const edgePages = 1; // Number of pages to always show at the start and end
    const middlePages = maxVisiblePages - (edgePages * 2) - 2; // -2 for the ellipsis

    // Always show first page
    pages.push(1);

    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      for (let i = 2; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end of middle section
      let middleStart = Math.max(2, currentPage - Math.floor(middlePages / 2));
      let middleEnd = Math.min(totalPages - 1, middleStart + middlePages - 1);

      // Adjust if we're near the end
      if (middleEnd >= totalPages - edgePages) {
        middleEnd = totalPages - edgePages - 1;
        middleStart = middleEnd - middlePages + 1;
      }

      // Adjust if we're near the start
      if (middleStart <= edgePages + 1) {
        middleStart = edgePages + 1;
        middleEnd = middleStart + middlePages - 1;
      }

      // Add ellipsis and middle pages
      if (middleStart > 2) pages.push(-1); // First ellipsis
      for (let i = middleStart; i <= middleEnd; i++) {
        pages.push(i);
      }
      if (middleEnd < totalPages - 1) pages.push(-1); // Second ellipsis
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-full border transition-all duration-300
          ${currentPage === 1
            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
            : 'text-amber-600 border-amber-600 hover:bg-amber-100'}
          flex items-center gap-1`}
      >
        ← Prev
      </button>
  
      {getPageNumbers().map((pageNum, index) => (
        pageNum === -1 ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
        ) : (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
              ${pageNum === currentPage
                ? 'bg-amber-500 text-white font-bold'
                : 'text-gray-700 hover:bg-amber-100'}`}
          >
            {pageNum}
          </button>
        )
      ))}
  
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-full border transition-all duration-300
          ${currentPage === totalPages
            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
            : 'text-amber-600 border-amber-600 hover:bg-amber-100'}
          flex items-center gap-1`}
      >
        Next →
      </button>
    </div>
  );
  
}