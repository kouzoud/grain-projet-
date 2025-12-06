import React, { useRef } from 'react';
import { Shield, MapPin, Users } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const FeatureCard = ({ icon, title, description, delay }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useMotionTemplate`calc(${mouseYSpring} * -0.5deg)`;
    const rotateY = useMotionTemplate`calc(${mouseXSpring} * 0.5deg)`;

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 20);
        y.set(yPct * 20);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5, delay: delay }}
            className="relative p-8 rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 hover:border-cyan-500/30 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-300 group perspective-1000"
        >
            <div
                style={{ transform: "translateZ(50px)" }}
                className="bg-gray-100 dark:bg-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-6 transition-transform group-hover:bg-cyan-500/20 shadow-lg shadow-cyan-500/5"
            >
                {icon}
            </div>
            <h3 style={{ transform: "translateZ(30px)" }} className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">{title}</h3>
            <p style={{ transform: "translateZ(20px)" }} className="text-gray-600 dark:text-slate-400 leading-relaxed text-center">{description}</p>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl"></div>
        </motion.div>
    );
};

const FeaturesSection = () => {
    const { t } = useTranslation();
    
    return (
        <section className="py-24 bg-gray-50 dark:bg-black relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 dark:from-slate-900/20 via-transparent dark:via-black to-transparent dark:to-black"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        {t('landing.features.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 dark:text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        {t('landing.features.subtitle')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    <FeatureCard
                        icon={<Shield className="w-12 h-12 text-cyan-400" />}
                        title={t('landing.features.secure.title')}
                        description={t('landing.features.secure.description')}
                        delay={0}
                    />
                    <FeatureCard
                        icon={<MapPin className="w-12 h-12 text-purple-400" />}
                        title={t('landing.features.geolocation.title')}
                        description={t('landing.features.geolocation.description')}
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<Users className="w-12 h-12 text-green-400" />}
                        title={t('landing.features.community.title')}
                        description={t('landing.features.community.description')}
                        delay={0.4}
                    />
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
