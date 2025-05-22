import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, loading }) => {
  const disablePrev = page <= 1 || totalPages === 0 || loading;
  const disableNext = page >= totalPages || totalPages === 0 || loading;

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-8 gap-2">
      <button
        className="px-2 py-1 rounded disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={disablePrev}
      >
        {'<'}
      </button>
      <span className="mx-2">{loading ? <span className="animate-pulse">...</span> : `${page} / ${totalPages}`}</span>
      <button
        className="px-2 py-1 rounded disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={disableNext}
      >
        {'>'}
      </button>
    </div>
  );
};

export default Pagination;
