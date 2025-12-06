import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ 
    className, 
    error, 
    label,
    helpText,
    required = false,
    disabled = false,
    leftIcon,
    rightIcon,
    id,
    ...props 
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
        <div className="w-full">
            {label && (
                <label 
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1" aria-label="requis">*</span>}
                </label>
            )}
            
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                
                <input
                    ref={ref}
                    id={inputId}
                    disabled={disabled}
                    aria-invalid={hasError}
                    aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
                    className={twMerge(
                        clsx(
                            'w-full px-4 py-2.5 border rounded-lg transition-all duration-200',
                            'bg-white dark:bg-gray-800',
                            'text-gray-900 dark:text-white',
                            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-offset-0',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            hasError
                                ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-cyan-500 focus:border-cyan-500',
                            disabled && 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900',
                            className
                        )
                    )}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error && (
                <p 
                    id={`${inputId}-error`}
                    className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    role="alert"
                >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error?.message || error}
                </p>
            )}

            {!error && helpText && (
                <p 
                    id={`${inputId}-help`}
                    className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
                >
                    {helpText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    className: PropTypes.string,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    label: PropTypes.string,
    helpText: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    id: PropTypes.string
};

export default Input;
