'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from '@/components/svgs';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  baseUrl,
  className = '' 
}) => {
  const getPageUrl = (page: number) => {
    return page === 1 ? baseUrl : `${baseUrl}?page=${page}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <Link key={1} href={getPageUrl(1)} className="pagination-number">
          1
        </Link>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link
          key={i}
          href={getPageUrl(i)}
          className={`pagination-number ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </Link>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <Link key={totalPages} href={getPageUrl(totalPages)} className="pagination-number">
          {totalPages}
        </Link>
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`crypto-pagination ${className}`}>
      <style jsx global>{`
        .crypto-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin: 40px 0;
          font-family: 'Roboto', sans-serif;
        }

        .pagination-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          padding: 0 12px;
          background: #fff;
          border: 1px solid #e0e0e0;
          color: #333;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          border-radius: 3px;
        }

        .pagination-number:hover {
          background: #4db2ec;
          border-color: #4db2ec;
          color: #fff;
        }

        .pagination-number.active {
          background: #4db2ec;
          border-color: #4db2ec;
          color: #fff;
          cursor: default;
          pointer-events: none;
        }

        .pagination-dots {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
          color: #999;
          font-size: 14px;
        }

        .pagination-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #fff;
          border: 1px solid #e0e0e0;
          color: #666;
          text-decoration: none;
          font-size: 12px;
          transition: all 0.2s ease;
          border-radius: 3px;
        }

        .pagination-arrow:hover:not(.disabled) {
          background: #4db2ec;
          border-color: #4db2ec;
          color: #fff;
        }

        .pagination-arrow.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .pagination-arrow svg {
          width: 16px;
          height: 16px;
        }
      `}</style>

      {/* Previous button */}
      {currentPage > 1 ? (
        <Link 
          href={getPageUrl(currentPage - 1)} 
          className="pagination-arrow"
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Link>
      ) : (
        <span className="pagination-arrow disabled" aria-label="Previous page">
          <ChevronLeft />
        </span>
      )}

      {/* Page numbers */}
      {renderPageNumbers()}

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link 
          href={getPageUrl(currentPage + 1)} 
          className="pagination-arrow"
          aria-label="Next page"
        >
          <ChevronRight />
        </Link>
      ) : (
        <span className="pagination-arrow disabled" aria-label="Next page">
          <ChevronRight />
        </span>
      )}
    </div>
  );
};

export default Pagination;