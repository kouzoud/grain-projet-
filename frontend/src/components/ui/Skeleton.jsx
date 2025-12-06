import React from 'react';
import PropTypes from 'prop-types';

const Skeleton = ({ className, variant = 'default', ...props }) => {
    const baseClasses = 'animate-pulse rounded-md';
    
    const variantClasses = {
        default: 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer',
        dark: 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer',
        light: 'bg-gray-100',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{
                animation: 'shimmer 2s ease-in-out infinite',
            }}
            {...props}
        />
    );
};

Skeleton.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'dark', 'light'])
};

// Skeleton presets for common use cases
export const RequestCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
    <Skeleton className="h-48 rounded-none" />
    <div className="p-6 space-y-4">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex items-center gap-4 pt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="h-32 rounded-2xl" />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
    <div className="p-6 space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  </div>
);

TableSkeleton.propTypes = {
  rows: PropTypes.number
};

export const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

// Add shimmer animation via inline style since we can't modify tailwind config here
const style = document.createElement('style');
style.textContent = `
    @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    .animate-shimmer {
        animation: shimmer 2s ease-in-out infinite;
    }
`;
if (typeof document !== 'undefined' && !document.querySelector('#skeleton-styles')) {
    style.id = 'skeleton-styles';
    document.head.appendChild(style);
}

export default Skeleton;
