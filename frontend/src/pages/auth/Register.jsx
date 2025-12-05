import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, Mail, Phone, Lock, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import Button from '../../components/ui/Button';
import PasswordStrengthMeter from './components/PasswordStrengthMeter';
import FileUpload from './components/FileUpload';
import ThemeToggle from '../../components/common/ThemeToggle';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        role,
        setRole,
        isLoading,
        error,
        isSuccess,
        register,
        onSubmit,
        errors,
        passwordValue
    } = useRegisterForm();

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-lg text-center border border-gray-100 dark:border-slate-700"
                >
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{t('auth.register.success')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg">
                        {t('auth.register.successMessage') || 'Votre demande a bien été prise en compte. Un email de confirmation a été envoyé.'}
                    </p>
                    <Button onClick={() => navigate('/')} variant="primary" className="w-full py-4 text-lg">
                        {t('common.back')}
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            {/* Theme & Language Toggle */}
            <div className="fixed top-4 right-4 rtl:right-auto rtl:left-4 z-50 flex items-center gap-2">
                <LanguageSwitcher variant="icon" />
                <ThemeToggle variant="icon" />
            </div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full space-y-8"
            >
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                        {t('auth.register.subtitle').split('SolidarLink')[0]} <span className="text-primary">SolidarLink</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        {t('hero.badge')}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
                    <div className="p-8 md:p-12">
                        {/* Role Selection */}
                        <div className="flex flex-col sm:flex-row gap-6 mb-10 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setRole('CITIZEN')}
                                className={`flex-1 flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${role === 'CITIZEN'
                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                    : 'border-gray-100 dark:border-slate-600 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <div className={`p-4 rounded-full mb-4 ${role === 'CITIZEN' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                                    <User size={32} />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${role === 'CITIZEN' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>{t('auth.register.citizen')}</h3>
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400">{t('auth.register.citizenDesc')}</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setRole('VOLUNTEER')}
                                className={`flex-1 flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${role === 'VOLUNTEER'
                                    ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                                    : 'border-gray-100 dark:border-slate-600 hover:border-accent/30 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <div className={`p-4 rounded-full mb-4 ${role === 'VOLUNTEER' ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                                    <Heart size={32} />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${role === 'VOLUNTEER' ? 'text-accent' : 'text-gray-600 dark:text-gray-300'}`}>{t('auth.register.volunteer')}</h3>
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400">{t('auth.register.volunteerDesc')}</p>
                            </motion.button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 dark:bg-red-900/20 border-l-4 rtl:border-l-0 rtl:border-r-4 border-red-500 p-4 rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg mb-8"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <ShieldCheck className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div className="ml-3 rtl:ml-0 rtl:mr-3">
                                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-8">
                            {/* Section 1: Identity */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">1</span>
                                    {t('auth.register.firstName').includes('Prénom') ? 'Informations Personnelles' : 'المعلومات الشخصية'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FloatingLabelInput
                                        id="firstName"
                                        label={t('auth.register.firstName')}
                                        icon={<User size={20} />}
                                        role={role}
                                        {...register('firstName', { required: t('auth.errors.emailRequired') })}
                                        error={errors.firstName}
                                    />
                                    <FloatingLabelInput
                                        id="lastName"
                                        label={t('auth.register.lastName')}
                                        icon={<User size={20} />}
                                        role={role}
                                        {...register('lastName', { required: t('auth.errors.emailRequired') })}
                                        error={errors.lastName}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                    <FloatingLabelInput
                                        id="email"
                                        label={t('auth.register.email')}
                                        type="email"
                                        icon={<Mail size={20} />}
                                        role={role}
                                        {...register('email', {
                                            required: t('auth.errors.emailRequired'),
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: t('auth.errors.emailInvalid')
                                            }
                                        })}
                                        error={errors.email}
                                    />
                                    <FloatingLabelInput
                                        id="phone"
                                        label={t('auth.register.phone')}
                                        type="tel"
                                        icon={<Phone size={20} />}
                                        role={role}
                                        {...register('phone', {
                                            required: t('auth.validation.required'),
                                            pattern: {
                                                value: /^(0[1-9])[0-9]{8}$/,
                                                message: 'Format invalide (ex: 0612345678)'
                                            }
                                        })}
                                        error={errors.phone}
                                    />
                                </div>
                            </section>

                            {/* Section 2: Security */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">2</span>
                                    {t('auth.register.password').includes('Mot') ? 'Sécurité' : 'الأمان'}
                                </h3>
                                <div className="max-w-md">
                                    <FloatingLabelInput
                                        id="password"
                                        label={t('auth.register.password')}
                                        type="password"
                                        icon={<Lock size={20} />}
                                        role={role}
                                        {...register('password', {
                                            required: t('auth.errors.passwordRequired'),
                                            minLength: { value: 8, message: t('auth.errors.weakPassword') },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                message: t('auth.errors.weakPassword')
                                            }
                                        })}
                                        error={errors.password}
                                    />
                                    <PasswordStrengthMeter password={passwordValue} />
                                </div>
                            </section>

                            {/* Section 3: Volunteer Specifics */}
                            <AnimatePresence>
                                {role === 'VOLUNTEER' && (
                                    <motion.section
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                                            <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">3</span>
                                            {t('dashboard.volunteer.title')}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-6 rounded-xl border border-accent/10">
                                            <FloatingLabelInput
                                                id="skills"
                                                label={t('profile.skills') || 'Compétences'}
                                                role={role}
                                                {...register('skills', { required: t('auth.validation.required') })}
                                                error={errors.skills}
                                                className="bg-white dark:bg-slate-800"
                                            />
                                            <FloatingLabelInput
                                                id="availability"
                                                label={t('profile.availability') || 'Disponibilités'}
                                                role={role}
                                                {...register('availability', { required: t('auth.validation.required') })}
                                                error={errors.availability}
                                                className="bg-white dark:bg-slate-800"
                                            />
                                        </div>
                                    </motion.section>
                                )}
                            </AnimatePresence>

                            {/* Section 4: Verification */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                                    <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">{role === 'VOLUNTEER' ? '4' : '3'}</span>
                                    {t('profile.verification') || 'Vérification d\'identité'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    {t('profile.verificationDesc') || 'Pour garantir la confiance au sein de la communauté, nous vérifions l\'identité de chaque membre.'}
                                </p>
                                <FileUpload
                                    register={register}
                                    name="document"
                                    label={t('profile.idDocument') || 'Pièce d\'identité'}
                                    error={errors.document}
                                />
                            </section>

                            <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
                                <Button
                                    type="submit"
                                    className="w-full py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                                    isLoading={isLoading}
                                    variant={role === 'VOLUNTEER' ? 'accent' : 'primary'}
                                >
                                    {isLoading ? t('common.loading') : t('auth.register.submit')}
                                    {!isLoading && <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 inline-block rtl:rotate-180" size={20} />}
                                </Button>
                            </div>
                        </form>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800/50 px-8 py-6 text-center border-t border-gray-100 dark:border-slate-700">
                        <p className="text-gray-600 dark:text-gray-300">
                            {t('auth.register.hasAccount')}{' '}
                            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                                {t('auth.register.login')}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
