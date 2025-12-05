import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, variant = 'primary', isLoading, ...props }) => {
    const variants = {
        primary: 'bg-primary hover:bg-primary-dark text-white',
        secondary: 'bg-secondary hover:bg-secondary-light text-white',
        accent: 'bg-accent hover:bg-opacity-90 text-white',
        outline: 'border-2 border-primary text-primary hover:bg-primary/5',
    };

    return (
        <button
            className={twMerge(
                clsx(
                    'px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    className
                )
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {children}
        </button>
    );
};

export default Button;
