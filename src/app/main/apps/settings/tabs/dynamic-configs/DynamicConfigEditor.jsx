import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DynamicFormGenerator } from '@/app/shared/components/DynamicForm';
import {
    useGetConfigByNameQuery,
    useGetConfigSchemaQuery,
    useUpdateConfigByNameMutation,
} from '../../api/dynamicConfigApi';

/**
 * Dynamic Config Editor
 * 
 * Fetches config and schema, renders dynamic form, handles updates.
 * Can be used standalone with route params or embedded with props.
 */
function DynamicConfigEditor({ 
    // If used as embedded component, pass config directly
    config: propConfig = null,
    onBack = null,
    onSaveSuccess = null,
}) {
    const { configName } = useParams();
    const navigate = useNavigate();
    
    // Determine which config to use
    const configIdentifier = propConfig?.name || configName;
    const schemaId = propConfig?.schemaId;

    // State for snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Fetch config data
    const {
        data: configResponse,
        isLoading: configLoading,
        error: configError,
        refetch: refetchConfig,
    } = useGetConfigByNameQuery(configIdentifier, {
        skip: !configIdentifier,
    });

    // Extract config envelope
    const configObject = configResponse?.data || {};
    const resolvedSchemaId = schemaId || configObject?.schemaId;

    // Fetch schema
    const {
        data: schemaResponse,
        isLoading: schemaLoading,
        error: schemaError,
    } = useGetConfigSchemaQuery(resolvedSchemaId, {
        skip: !resolvedSchemaId,
    });

    // Extract schema - it might be nested in data or directly returned
    const schema = schemaResponse?.data?.schema || schemaResponse?.schema || schemaResponse?.data || schemaResponse;

    // Extract config values robustly across response shapes
    const configData = useMemo(() => {
        const nestedData = configObject?.data;
        if (typeof nestedData === 'string') {
            try {
                const parsed = JSON.parse(nestedData);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    return parsed;
                }
            } catch {
                // Ignore and continue with fallback extraction
            }
        }
        if (nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData)) {
            return nestedData;
        }

        const metadataFields = new Set([
            'name',
            'data',
            'displayName',
            'schemaId',
            'createdAt',
            'updatedAt',
            'category',
            'description',
            'type',
        ]);

        const stripped = Object.fromEntries(
            Object.entries(configObject || {}).filter(([key]) => !metadataFields.has(key))
        );

        return Object.keys(stripped).length > 0 ? stripped : {};
    }, [configObject]);

    // Update mutation
    const [updateConfig, { isLoading: updateLoading }] = useUpdateConfigByNameMutation();
    // Handle form submission
    const handleSubmit = async (formData) => {
        try {
            await updateConfig({
                name: configIdentifier,
                configData: {
                    schemaId: resolvedSchemaId,
                    configData: formData,
                },
            }).unwrap();

            setSnackbar({
                open: true,
                message: 'پیکربندی با موفقیت ذخیره شد',
                severity: 'success',
            });

            // Refetch to get updated data
            refetchConfig();

            // Call success callback if provided
            if (onSaveSuccess) {
                onSaveSuccess(formData);
            }
        } catch (error) {
            console.error('Error updating config:', error);
            setSnackbar({
                open: true,
                message: error?.data?.message || 'خطا در ذخیره پیکربندی',
                severity: 'error',
            });
        }
    };

    // Handle back navigation
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/apps/settings/dynamic-configs');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        // Form reset is handled internally by DynamicFormGenerator
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // Loading state
    if (configLoading || schemaLoading) {
        return <FuseLoading />;
    }

    // Error state
    if (configError || schemaError) {
        return (
            <div className="p-24">
                <Alert severity="error" className="mb-16">
                    {configError 
                        ? `خطا در بارگذاری پیکربندی: ${configError.data?.message || 'خطای ناشناخته'}`
                        : `خطا در بارگذاری اسکیما: ${schemaError.data?.message || 'خطای ناشناخته'}`
                    }
                </Alert>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<FuseSvgIcon>heroicons-outline:arrow-right</FuseSvgIcon>}
                >
                    بازگشت
                </Button>
            </div>
        );
    }

    // No schema available
    if (!schema) {
        return (
            <div className="p-24">
                <Alert severity="warning" className="mb-16">
                    اسکیمای این پیکربندی یافت نشد. لطفاً ابتدا اسکیما را تعریف کنید.
                </Alert>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<FuseSvgIcon>heroicons-outline:arrow-right</FuseSvgIcon>}
                >
                    بازگشت
                </Button>
            </div>
        );
    }

    // Get display name
    const displayName = propConfig?.displayName || configObject?.displayName || configIdentifier;
    const description = propConfig?.description || configObject?.description;
    
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            {/* Header */}
            <Box className="mb-24">
                {/* Breadcrumbs */}
                <Breadcrumbs className="mb-8">
                    <Link
                        component="button"
                        underline="hover"
                        color="inherit"
                        onClick={handleBack}
                        className="flex items-center gap-4 cursor-pointer"
                    >
                        <FuseSvgIcon size={16}>heroicons-outline:cog</FuseSvgIcon>
                        پیکربندی‌ها
                    </Link>
                    <Typography color="text.primary">{displayName}</Typography>
                </Breadcrumbs>

                {/* Title & Back Button */}
                <div className="flex items-center gap-16">
                    <Button
                        variant="text"
                        onClick={handleBack}
                        startIcon={<FuseSvgIcon>heroicons-outline:arrow-right</FuseSvgIcon>}
                        className="min-w-0 px-8"
                    >
                        بازگشت
                    </Button>
                    <div>
                        <Typography variant="h5" className="font-semibold">
                            {displayName}
                        </Typography>
                        {description && (
                            <Typography color="text.secondary" variant="body2">
                                {description}
                            </Typography>
                        )}
                    </div>
                </div>
            </Box>

            {/* Dynamic Form */}
            <Box className="max-w-4xl">
                <DynamicFormGenerator
                    schema={schema}
                    initialValues={configData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateLoading}
                    showHeader={false}
                    submitLabel="ذخیره تغییرات"
                    cancelLabel="بازنشانی"
                    configSection={configIdentifier}
                />
            </Box>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ zIndex: 9999 }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ minWidth: '300px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </motion.div>
    );
}

export default DynamicConfigEditor;
