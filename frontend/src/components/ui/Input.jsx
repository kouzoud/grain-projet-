import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ className, error, ...props }, ref) => {
    return (
        <div className="w-full">
            <input
                ref={ref}
                className={twMerge(
                    clsx(
                        'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
                        'bg-white border-secondary-light text-secondary placeholder-gray-400',
                        'focus:border-primary focus:ring-primary/20',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                        className
                    )
                )}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
