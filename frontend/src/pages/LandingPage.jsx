import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, HeartHandshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import publicService from '../services/publicService';

// Components
import HeroSection from '../components/landing/HeroSection';
import ImpactSection from '../components/landing/ImpactSection';
import LatestMissions from '../components/landing/LatestMissions';
import FeaturesSection from '../components/landing/FeaturesSection';

const LandingPage = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [successStories, setSuccessStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const casesData = await publicService.getLatestResolvedCases();
                setSuccessStories(casesData);
            } catch (error) {
                console.error("Failed to load landing page data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-page font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
            <HeroSection />
            <ImpactSection />
            <LatestMissions successStories={successStories} />
            <FeaturesSection />

            {/* Pied de Page (Footer) - To be refactored later if needed */}
            <footer className="bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-slate-300 py-16 border-t border-gray-200 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                Link<span className="text-cyan-600 dark:text-cyan-400">2</span>Act
                            </h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                                {t('footer.description')}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-gray-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-sm">{t('footer.platform')}</h4>
                            <ul className="space-y-4">
                                <li><Link to="/register" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t('footer.howItWorks')}</Link></li>
                                <li><Link to="/register" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t('footer.becomeVolunteer')}</Link></li>
                                <li><Link to="/register" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t('footer.requestHelp')}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-gray-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-sm">{t('footer.legal')}</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t('footer.terms')}</a></li>
                                <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t('footer.privacy')}</a></li>
                                <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t('footer.cookies')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-gray-900 dark:text-white font-bold mb-6 uppercase tracking-wider text-sm">{t('footer.contact')}</h4>
                            <ul className="space-y-4">
                                <li>contact@link2act.org</li>
                                <li>+33 1 23 45 67 89</li>
                                <li className="flex gap-4 mt-4">
                                    {/* Social Icons Placeholder */}
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all cursor-pointer">
                                        <span className="font-bold">fb</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all cursor-pointer">
                                        <span className="font-bold">tw</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all cursor-pointer">
                                        <span className="font-bold">in</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-200 dark:border-slate-800 text-center text-gray-500 dark:text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Link2Act. {t('footer.madeWith')} <Heart className="w-4 h-4 inline text-red-500 mx-1" /> {t('footer.forCommunity')}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
