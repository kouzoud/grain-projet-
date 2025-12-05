import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import VolunteerNavBar from './VolunteerNavBar';

const Layout = () => {
    const { role } = useSelector((state) => state.auth);
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-200 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {role === 'BENEVOLE' ? <VolunteerNavBar /> : <Navbar />}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
