import React from 'react';
import { Trophy, Star, Clock, Target, TrendingUp } from 'lucide-react';

const StatsWidget = ({ stats }) => {
    // Mock data if stats are missing
    const {
        level = 'Bronze',
        points = 120,
        nextLevelPoints = 200,
        missionsCompleted = 5,
        hoursVolunteered = 12,
        impactScore = 85
    } = stats || {};

    const progress = (points / nextLevelPoints) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Level & Progress */}
            <div className="md:col-span-1 bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={80} />
                </div>
                <div className="relative z-10">
                    <p className="text-primary-100 text-sm font-medium mb-1">Niveau Actuel</p>
                    <h3 className="text-2xl font-bold mb-4">{level}</h3>

                    <div className="mb-2 flex justify-between text-xs text-primary-100">
                        <span>{points} pts</span>
                        <span>{nextLevelPoints} pts</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                        <div
                            className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs mt-2 text-primary-100">
                        Plus que {nextLevelPoints - points} pts pour le niveau Argent !
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="md:col-span-3 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full mb-3">
                        <Target size={24} />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800">{missionsCompleted}</h4>
                    <p className="text-sm text-gray-500">Missions Réalisées</p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
                        <Clock size={24} />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800">{hoursVolunteered}h</h4>
                    <p className="text-sm text-gray-500">Heures de Bénévolat</p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full mb-3">
                        <TrendingUp size={24} />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800">{impactScore}</h4>
                    <p className="text-sm text-gray-500">Score d'Impact</p>
                </div>
            </div>
        </div>
    );
};

export default StatsWidget;
