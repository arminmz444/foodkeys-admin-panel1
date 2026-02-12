import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { MdRefresh } from 'react-icons/md';
import { useGetAllConfigsQuery } from '../../api/dynamicConfigApi';
import DynamicConfigList from './DynamicConfigList';
import DynamicConfigEditor from './DynamicConfigEditor';

/**
 * Dynamic Config Page
 * 
 * Main entry point for dynamic configuration management.
 * Shows list view or editor view based on selection.
 */
function DynamicConfigPage() {
    // Selected config for editing
    const [selectedConfig, setSelectedConfig] = useState(null);

    // Fetch all configs
    const {
        data: configsResponse,
        isLoading,
        error,
        refetch,
    } = useGetAllConfigsQuery();

    // Extract configs array from response
    const configs = configsResponse?.data?.data || configsResponse || [];

    // Handle config selection
    const handleConfigClick = useCallback((config) => {
        setSelectedConfig(config);
    }, []);

    // Handle back to list
    const handleBack = useCallback(() => {
        setSelectedConfig(null);
    }, []);

    // Handle successful save
    const handleSaveSuccess = useCallback(() => {
        // Optionally refetch configs to update any metadata
        refetch();
    }, [refetch]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    return (
        <div className="w-full h-full">
            <AnimatePresence mode="wait">
                {selectedConfig ? (
                    // Editor View
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <DynamicConfigEditor
                            config={selectedConfig}
                            onBack={handleBack}
                            onSaveSuccess={handleSaveSuccess}
                        />
                    </motion.div>
                ) : (
                    // List View
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {/* Header */}
                        <Box className="mb-24">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Typography variant="h5" className="font-semibold">
                                        پیکربندی‌های سایت
                                    </Typography>
                                    <Typography color="text.secondary" variant="body2">
                                        مدیریت و ویرایش تنظیمات مختلف سیستم
                                    </Typography>
                                </div>
                                <Tooltip title="بارگذاری مجدد">
                                    <IconButton
                                        onClick={handleRefresh}
                                        disabled={isLoading}
                                    >
                                        <MdRefresh 
                                            size={24} 
                                            className={isLoading ? 'animate-spin' : ''} 
                                        />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </Box>

                        {/* Config List */}
                        <DynamicConfigList
                            configs={configs}
                            isLoading={isLoading}
                            error={error}
                            onConfigClick={handleConfigClick}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default DynamicConfigPage;
