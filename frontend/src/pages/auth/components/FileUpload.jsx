import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ register, name, error, label, accept = "image/*,.pdf" }) => {
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState("");

    // We need to hook into the register's onChange to handle preview
    const { onChange, ref, ...rest } = register(name);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        }
        onChange(e);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        // Note: Programmatically setting files on input is tricky with React Hook Form
        // Ideally we'd use a more complex setup, but for now we'll rely on the click-to-upload
        // or just visual feedback for drag (users will likely click)
        // To fully support drop, we'd need to use setValue from useForm context
        const fileInput = document.getElementById(name);
        if (fileInput && e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            // Trigger change event manually
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
            </label>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
                    ${error ? 'border-red-300 bg-red-50' :
                        isDragging ? 'border-primary bg-primary/5 scale-[1.01]' :
                            preview || fileName ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}
                `}
            >
                <input
                    type="file"
                    id={name}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept={accept}
                    onChange={handleFileChange}
                    ref={ref}
                    {...rest}
                />

                <AnimatePresence mode="wait">
                    {fileName ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center"
                        >
                            {preview ? (
                                <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <CheckCircle className="text-white w-8 h-8 drop-shadow-md" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                    <FileText size={32} />
                                </div>
                            )}
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{fileName}</p>
                            <p className="text-xs text-green-600 mt-1">Fichier sélectionné</p>
                            <p className="text-xs text-gray-400 mt-2">Cliquez pour changer</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center py-4"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDragging ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                <Upload size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                                <span className="text-primary">Cliquez pour uploader</span> ou glissez le fichier
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG ou PDF (Max 5MB)
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1"
                >
                    <span>•</span> {error.message || error}
                </motion.p>
            )}
        </div>
    );
};

export default FileUpload;
