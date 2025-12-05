import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import VolunteerNavBar from './VolunteerNavBar';

const Layout = () => {
    const { role } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen flex flex-col">
            {role === 'BENEVOLE' ? <VolunteerNavBar /> : <Navbar />}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
