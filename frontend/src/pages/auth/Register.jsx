import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Heart, Mail, Phone, Lock, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import FloatingLabelInput from '../../components/ui/FloatingLabelInput';
import Button from '../../components/ui/Button';
import PasswordStrengthMeter from './components/PasswordStrengthMeter';
import FileUpload from './components/FileUpload';

const Register = () => {
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center border border-gray-100"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Inscription réussie !</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                        Votre demande a bien été prise en compte.
                        <br />
                        Un email de confirmation a été envoyé.
                    </p>
                    <div className="bg-blue-50 p-6 rounded-xl mb-8 text-left border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <ShieldCheck size={18} /> Prochaine étape
                        </h4>
                        <p className="text-blue-800 text-sm">
                            Votre compte est en attente de validation par nos équipes. Vous recevrez une notification dès que votre accès sera activé.
                        </p>
                    </div>
                    <Button onClick={() => navigate('/')} variant="primary" className="w-full py-4 text-lg">
                        Retour à l'accueil
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full space-y-8"
            >
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Rejoignez <span className="text-primary">SolidarLink</span>
                    </h1>
                    <p className="text-lg text-gray-600">
                        La plateforme d'entraide citoyenne nouvelle génération
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
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
                                    : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-4 rounded-full mb-4 ${role === 'CITIZEN' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <User size={32} />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${role === 'CITIZEN' ? 'text-primary' : 'text-gray-600'}`}>Citoyen</h3>
                                <p className="text-sm text-center text-gray-500">Je souhaite signaler des besoins et demander de l'aide</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setRole('VOLUNTEER')}
                                className={`flex-1 flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${role === 'VOLUNTEER'
                                    ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                                    : 'border-gray-100 hover:border-accent/30 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`p-4 rounded-full mb-4 ${role === 'VOLUNTEER' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Heart size={32} />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${role === 'VOLUNTEER' ? 'text-accent' : 'text-gray-600'}`}>Bénévole</h3>
                                <p className="text-sm text-center text-gray-500">Je souhaite offrir mon aide et mes compétences</p>
                            </motion.button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <ShieldCheck className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-8">
                            {/* Section 1: Identity */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">1</span>
                                    Informations Personnelles
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FloatingLabelInput
                                        id="firstName"
                                        label="Prénom"
                                        icon={<User size={20} />}
                                        role={role}
                                        {...register('firstName', { required: 'Le prénom est requis' })}
                                        error={errors.firstName}
                                    />
                                    <FloatingLabelInput
                                        id="lastName"
                                        label="Nom"
                                        icon={<User size={20} />}
                                        role={role}
                                        {...register('lastName', { required: 'Le nom est requis' })}
                                        error={errors.lastName}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                    <FloatingLabelInput
                                        id="email"
                                        label="Email"
                                        type="email"
                                        icon={<Mail size={20} />}
                                        role={role}
                                        {...register('email', {
                                            required: 'L\'email est requis',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Adresse email invalide'
                                            }
                                        })}
                                        error={errors.email}
                                    />
                                    <FloatingLabelInput
                                        id="phone"
                                        label="Téléphone"
                                        type="tel"
                                        icon={<Phone size={20} />}
                                        role={role}
                                        {...register('phone', {
                                            required: 'Le téléphone est requis',
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
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">2</span>
                                    Sécurité
                                </h3>
                                <div className="max-w-md">
                                    <FloatingLabelInput
                                        id="password"
                                        label="Mot de passe"
                                        type="password"
                                        icon={<Lock size={20} />}
                                        role={role}
                                        {...register('password', {
                                            required: 'Le mot de passe est requis',
                                            minLength: { value: 8, message: 'Min 8 caractères' },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                message: 'Trop faible'
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
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 pt-4 border-t border-gray-100">
                                            <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">3</span>
                                            Profil Bénévole
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-6 rounded-xl border border-accent/10">
                                            <FloatingLabelInput
                                                id="skills"
                                                label="Vos Compétences"
                                                role={role}
                                                {...register('skills', { required: 'Veuillez indiquer vos compétences' })}
                                                error={errors.skills}
                                                className="bg-white"
                                            />
                                            <FloatingLabelInput
                                                id="availability"
                                                label="Vos Disponibilités"
                                                role={role}
                                                {...register('availability', { required: 'Veuillez indiquer vos disponibilités' })}
                                                error={errors.availability}
                                                className="bg-white"
                                            />
                                        </div>
                                    </motion.section>
                                )}
                            </AnimatePresence>

                            {/* Section 4: Verification */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">{role === 'VOLUNTEER' ? '4' : '3'}</span>
                                    Vérification d'identité
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Pour garantir la confiance au sein de la communauté, nous vérifions l'identité de chaque membre.
                                </p>
                                <FileUpload
                                    register={register}
                                    name="document"
                                    label="Pièce d'identité (CNI ou Passeport)"
                                    error={errors.document}
                                />
                            </section>

                            <div className="pt-6 border-t border-gray-100">
                                <Button
                                    type="submit"
                                    className="w-full py-4 text-lg shadow-lg hover:shadow-xl transition-all"
                                    isLoading={isLoading}
                                    variant={role === 'VOLUNTEER' ? 'accent' : 'primary'}
                                >
                                    {isLoading ? 'Création du compte...' : `S'inscrire en tant que ${role === 'CITIZEN' ? 'Citoyen' : 'Bénévole'}`}
                                    {!isLoading && <ArrowRight className="ml-2 inline-block" size={20} />}
                                </Button>
                            </div>
                        </form>
                    </div>
                    <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
                        <p className="text-gray-600">
                            Déjà membre ?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
