import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Pagination navigation components
const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

interface AgentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

const AgentPagination: React.FC<AgentPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
}) => {
  // Handle previous page click
  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Handle next page click
  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of page range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 2) {
        end = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed before middle pages
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed after middle pages
      if (end < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Pagination>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <a
            href="#"
            onClick={handlePrevClick}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              currentPage === 1 && "pointer-events-none opacity-50"
            )}
            aria-disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </PaginationItem>

        {showPageNumbers ? (
          getPageNumbers().map((page, i) => (
            <PaginationItem key={`page-${i}`}>
              {page < 0 ? (
                <span className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
                  …
                </span>
              ) : (
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))
        ) : (
          <PaginationItem>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              Page <span className="text-foreground font-medium">{currentPage}</span> of{" "}
              <span className="text-foreground font-medium">{totalPages}</span>
            </span>
          </PaginationItem>
        )}

        <PaginationItem>
          <a
            href="#"
            onClick={handleNextClick}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              currentPage === totalPages && "pointer-events-none opacity-50"
            )}
            aria-disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default AgentPagination; 