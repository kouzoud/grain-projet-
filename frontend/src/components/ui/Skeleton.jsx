import React from 'react';

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
