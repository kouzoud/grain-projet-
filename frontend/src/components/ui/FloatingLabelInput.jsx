import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FloatingLabelInput = ({
    id,           // ID unique pour l'input
    label,        // Texte du label (ex: "Prénom")
    type = "text", // Type d'input (text, email, password, tel)
    value,        // Valeur contrôlée
    onChange,     // Handler onChange
    icon,         // Composant Lucide-React (optionnel)
    error,        // Message d'erreur (optionnel)
    className,    // Classes CSS additionnelles
    role = 'CITIZEN', // 'CITIZEN' ou 'VOLUNTEER'
    ...props      // Autres props HTML
}) => {
    // État pour savoir si l'input est focus
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Le label doit flotter si : focus OU valeur présente
    const shouldFloat = isFocused || (value && value.length > 0);

    // Définition des couleurs selon le rôle
    const isVolunteer = role === 'VOLUNTEER';
    const activeColorClass = isVolunteer ? 'text-accent border-accent focus:border-accent' : 'text-primary border-primary focus:border-primary';
    const labelColorClass = error ? 'text-red-500' : (shouldFloat ? (isVolunteer ? 'text-accent' : 'text-primary') : 'text-gray-500');
    const borderColorClass = error ? 'border-red-500 focus:border-red-600' : (isFocused ? (isVolunteer ? 'border-accent' : 'border-primary') : 'border-gray-200');

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="relative mb-4">
            <div className="relative">
                {/* Icône à gauche (optionnelle) */}
                {icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 z-10 ${error ? 'text-red-400' : (isFocused ? (isVolunteer ? 'text-accent' : 'text-primary') : 'text-gray-400')}`}>
                        {icon}
                    </div>
                )}

                {/* Input avec padding dynamique */}
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
            w-full
            ${icon ? 'pl-12' : 'pl-4'}
            ${type === 'password' ? 'pr-12' : 'pr-4'}
            ${shouldFloat ? 'pt-6 pb-2' : 'pt-4 pb-4'}
            text-gray-900
            bg-gray-50
            border-2
            rounded-xl
            outline-none
            transition-all
            duration-200
            ${borderColorClass}
            ${className || ''}
          `}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...props}
                />

                {/* Label flottant avec animation */}
                <label
                    htmlFor={id}
                    className={`
            absolute
            ${icon ? 'left-12' : 'left-4'}
            transition-all
            duration-200
            pointer-events-none
            ${shouldFloat
                            ? `top-2 text-xs font-medium ${labelColorClass}`
                            : 'top-1/2 -translate-y-1/2 text-base text-gray-500'
                        }
          `}
                >
                    {label}
                </label>

                {/* Bouton Voir/Masquer pour mot de passe */}
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>

            {/* Message d'erreur */}
            {error && (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
                >
                    <span>•</span>
                    {error.message || error}
                </p>
            )}
        </div>
    );
};

export default FloatingLabelInput;
