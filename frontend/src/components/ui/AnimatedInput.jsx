import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const AnimatedInput = forwardRef(({
    label,
    icon: Icon,
    error,
    className,
    type = "text",
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const handleBlur = (e) => {
        setIsFocused(false);
        setHasValue(e.target.value.length > 0);
        if (props.onBlur) props.onBlur(e);
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);
    };

    const handleChange = (e) => {
        setHasValue(e.target.value.length > 0);
        if (props.onChange) props.onChange(e);
    };

    return (
        <div className="relative mb-4">
            <div className={twMerge(
                clsx(
                    "relative flex items-center border-2 rounded-xl transition-all duration-200 bg-white",
                    error ? "border-red-500 bg-red-50" : isFocused ? "border-primary ring-4 ring-primary/10" : "border-gray-200 hover:border-gray-300",
                    className
                )
            )}>
                {Icon && (
                    <div className={clsx(
                        "pl-4 transition-colors duration-200",
                        error ? "text-red-400" : isFocused ? "text-primary" : "text-gray-400"
                    )}>
                        <Icon size={20} />
                    </div>
                )}

                <div className="relative flex-1">
                    <input
                        ref={ref}
                        type={type}
                        className={clsx(
                            "w-full px-4 py-3.5 bg-transparent outline-none text-gray-700 font-medium",
                            "placeholder-transparent" // Hide default placeholder to use custom label
                        )}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        {...props}
                    />

                    <motion.label
                        initial={false}
                        animate={{
                            y: isFocused || hasValue || props.value ? -24 : 0,
                            x: isFocused || hasValue || props.value ? (Icon ? -28 : -10) : 0,
                            scale: isFocused || hasValue || props.value ? 0.85 : 1,
                        }}
                        className={clsx(
                            "absolute left-4 top-3.5 pointer-events-none transition-colors duration-200",
                            error ? "text-red-500" : isFocused ? "text-primary font-semibold" : "text-gray-500"
                        )}
                    >
                        {label}
                    </motion.label>
                </div>
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-5 left-1 text-xs font-medium text-red-500 flex items-center gap-1"
                >
                    <span>•</span> {error.message || error}
                </motion.p>
            )}
        </div>
    );
});

AnimatedInput.displayName = 'AnimatedInput';

export default AnimatedInput;
