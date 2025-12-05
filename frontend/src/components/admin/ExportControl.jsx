import React, { useState } from 'react';
import { Download, Loader, FileText } from 'lucide-react';
import api from '../../services/api';

const ExportControl = () => {
    const [isExportingCsv, setIsExportingCsv] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    const downloadReport = async (type) => {
        const isPdf = type === 'pdf';
        const setLoading = isPdf ? setIsExportingPdf : setIsExportingCsv;
        const endpoint = isPdf ? '/admin/reports/cases/pdf' : '/admin/reports/cases/csv';
        const extension = isPdf ? 'pdf' : 'csv';

        setLoading(true);
        try {
            const response = await api.get(endpoint, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rapport_solidarlink_${new Date().toISOString().slice(0, 10)}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erreur téléchargement", error);
            alert("Erreur lors du téléchargement du rapport.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => downloadReport('csv')}
                disabled={isExportingCsv || isExportingPdf}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/10 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exporter en CSV"
            >
                {isExportingCsv ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="font-medium text-sm hidden sm:inline">CSV</span>
            </button>
            <button
                onClick={() => downloadReport('pdf')}
                disabled={isExportingCsv || isExportingPdf}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exporter en PDF"
            >
                {isExportingPdf ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span className="font-medium text-sm hidden sm:inline">PDF</span>
            </button>
        </div>
    );
};

export default ExportControl;
