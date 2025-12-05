import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, HeartHandshake } from 'lucide-react';
import publicService from '../services/publicService';

// Components
import HeroSection from '../components/landing/HeroSection';
import ImpactSection from '../components/landing/ImpactSection';
import LatestMissions from '../components/landing/LatestMissions';
import FeaturesSection from '../components/landing/FeaturesSection';

const LandingPage = () => {
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
        <div className="min-h-screen bg-page font-sans">
            <HeroSection />
            <ImpactSection />
            <LatestMissions successStories={successStories} />
            <FeaturesSection />

            {/* Pied de Page (Footer) - To be refactored later if needed */}
            <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                Link<span className="text-cyan-400">2</span>Act
                            </h3>
                            <p className="text-slate-400 leading-relaxed">
                                La plateforme d'entraide citoyenne nouvelle génération. Connectez-vous, aidez, partagez.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Plateforme</h4>
                            <ul className="space-y-4">
                                <li><Link to="/register" className="hover:text-cyan-400 transition-colors">Comment ça marche</Link></li>
                                <li><Link to="/register" className="hover:text-cyan-400 transition-colors">Devenir Bénévole</Link></li>
                                <li><Link to="/register" className="hover:text-cyan-400 transition-colors">Demander de l'aide</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Légal</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Conditions d'utilisation</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Politique de confidentialité</a></li>
                                <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookies</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact</h4>
                            <ul className="space-y-4">
                                <li>contact@link2act.org</li>
                                <li>+33 1 23 45 67 89</li>
                                <li className="flex gap-4 mt-4">
                                    {/* Social Icons Placeholder */}
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all cursor-pointer">
                                        <span className="font-bold">fb</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all cursor-pointer">
                                        <span className="font-bold">tw</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all cursor-pointer">
                                        <span className="font-bold">in</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Link2Act. Fait avec <Heart className="w-4 h-4 inline text-red-500 mx-1" /> pour la communauté.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
