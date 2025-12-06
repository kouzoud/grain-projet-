import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PasswordStrengthMeter = ({ password }) => {
    const { t } = useTranslation();
    
    const criteria = [
        { label: t('auth.register.passwordCriteria.minLength') || "8 caractères min.", valid: password?.length >= 8 },
        { label: t('auth.register.passwordCriteria.uppercase') || "1 majuscule", valid: /[A-Z]/.test(password || "") },
        { label: t('auth.register.passwordCriteria.number') || "1 chiffre", valid: /[0-9]/.test(password || "") },
        { label: t('auth.register.passwordCriteria.special') || "1 caractère spécial", valid: /[^A-Za-z0-9]/.test(password || "") },
    ];

    const validCount = criteria.filter(c => c.valid).length;
    const strength = (validCount / criteria.length) * 100;

    const getColor = () => {
        if (strength <= 25) return "bg-red-500";
        if (strength <= 50) return "bg-orange-500";
        if (strength <= 75) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getLabel = () => {
        if (strength === 0) return t('auth.register.passwordStrength.empty') || "Vide";
        if (strength <= 25) return t('auth.register.passwordStrength.weak') || "Faible";
        if (strength <= 50) return t('auth.register.passwordStrength.medium') || "Moyen";
        if (strength <= 75) return t('auth.register.passwordStrength.good') || "Bon";
        return t('auth.register.passwordStrength.excellent') || "Excellent";
    };

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>{t('auth.register.passwordStrengthLabel') || "Force du mot de passe"}</span>
                <span className="font-medium">{getLabel()}</span>
            </div>

            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${getColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${strength}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <div className="grid grid-cols-2 gap-1 mt-2">
                {criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                        {c.valid ? (
                            <Check size={12} className="text-green-500" />
                        ) : (
                            <div className="w-3 h-3 rounded-full border border-gray-300" />
                        )}
                        <span className={c.valid ? "text-green-700" : "text-gray-400"}>
                            {c.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
