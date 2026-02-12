import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import _ from '@lodash';

import SchemaFieldRenderer from './SchemaFieldRenderer';
import { parseJsonSchema, generateDefaultValues } from '../../utils/jsonSchemaUtils/jsonSchemaParser';
import { buildZodSchema } from '../../utils/jsonSchemaUtils/zodSchemaBuilder';

/**
 * Dynamic Form Generator
 * 
 * Generates a complete form from JSON Schema with validation and submission handling.
 * 
 * @param {Object} props
 * @param {Object} props.schema - JSON Schema object
 * @param {Object} props.initialValues - Initial form values (config data)
 * @param {Function} props.onSubmit - Submit handler receiving form data
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.isLoading - Whether form is in loading state
 * @param {string} props.submitLabel - Label for submit button
 * @param {string} props.cancelLabel - Label for cancel button
 * @param {boolean} props.showHeader - Whether to show schema title/description
 * @param {boolean} props.disabled - Disable all form fields
 * @param {string} props.configSection - Config section name for file uploads
 */
function DynamicFormGenerator({
    schema,
    initialValues = {},
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel = 'ذخیره',
    cancelLabel = 'لغو',
    showHeader = true,
    disabled = false,
    className = '',
    configSection,
}) {
    // Parse the JSON Schema
    const parsedSchema = useMemo(() => {
        if (!schema) return null;
        try {
            return parseJsonSchema(typeof schema === 'string' ? JSON.parse(schema) : schema);
        } catch (e) {
            console.error('Error parsing schema:', e);
            return null;
        }
    }, [schema]);

    // Build Zod validation schema
    const zodSchema = useMemo(() => {
        if (!schema) return null;
        try {
            return buildZodSchema(schema);
        } catch (e) {
            console.error('Error building zod schema:', e);
            return null;
        }
    }, [schema]);

    // Generate default values from schema
    const schemaDefaults = useMemo(() => {
        if (!parsedSchema) return {};
        return generateDefaultValues(parsedSchema);
    }, [parsedSchema]);

    // Merge schema defaults with initial values
    const mergedDefaults = useMemo(() => _.merge({}, schemaDefaults, initialValues), [schemaDefaults, initialValues]);

    // Setup form
    const { 
        control, 
        handleSubmit, 
        formState, 
        reset,
        setValue,
    } = useForm({
        defaultValues: mergedDefaults,
        // Frontend validation disabled - backend will handle validation
        // resolver: zodSchema ? zodResolver(zodSchema) : undefined,
        mode: 'onChange',
    });

    const { errors, isDirty, isSubmitting } = formState;
    const lastResetValuesRef = useRef();
    
    // Watch ALL form values to detect changes (including programmatic ones)
    const watchedValues = useWatch({ control });
    
    // Determine if form has changes by comparing watched values to initial values
    // This works even for programmatic changes via setValue
    const hasChanges = useMemo(() => {
        if (!watchedValues || !lastResetValuesRef.current) {
            return isDirty;
        }
        return !_.isEqual(watchedValues, lastResetValuesRef.current);
    }, [watchedValues, isDirty]);

    // Reset only when incoming defaults truly change, to avoid clearing dirty state
    useEffect(() => {
        if (!mergedDefaults || Object.keys(mergedDefaults).length === 0) {
            return;
        }

        if (_.isEqual(lastResetValuesRef.current, mergedDefaults)) {
            return;
        }

        lastResetValuesRef.current = mergedDefaults;
        reset(mergedDefaults);
    }, [mergedDefaults, reset]);

    // Handle form submission
    const handleFormSubmit = async (data) => {
        if (onSubmit) {
            try {
                await onSubmit(data);
                // Update lastResetValuesRef to the submitted data so hasChanges becomes false
                lastResetValuesRef.current = data;
            } catch (e) {
                console.error('Form submission error:', e);
            }
        }
    };

    // Handle cancel/reset
    const handleCancel = () => {
        reset(mergedDefaults);
        lastResetValuesRef.current = mergedDefaults;
        if (onCancel) {
            onCancel();
        }
    };

    // Error state
    if (!schema) {
        return (
            <Alert severity="warning" className="m-16">
                اسکیما فرم تعریف نشده است.
            </Alert>
        );
    }

    if (!parsedSchema || !parsedSchema.fields || parsedSchema.fields.length === 0) {
        return (
            <Alert severity="info" className="m-16">
                هیچ فیلدی برای نمایش در این فرم وجود ندارد.
            </Alert>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                {/* Header */}
                {showHeader && (parsedSchema.title || parsedSchema.description) && (
                    <div className="mb-24">
                        {parsedSchema.title && (
                            <Typography className="text-xl font-semibold">
                                {parsedSchema.title}
                            </Typography>
                        )}
                        {parsedSchema.description && (
                            <Typography color="text.secondary" className="mt-4">
                                {parsedSchema.description}
                            </Typography>
                        )}
                    </div>
                )}

                {/* Form Fields */}
                <div className="space-y-24">
                    {parsedSchema.fields.map((field) => (
                        <div key={field.key} className="w-full">
                            {/* Simple fields render in a grid for better layout */}
                            {field.renderType !== 'array' && field.renderType !== 'object' && field.renderType !== 'file' ? (
                                <div className="grid gap-24 sm:grid-cols-2">
                                    <div className={
                                        field.renderType === 'textarea' 
                                            ? 'sm:col-span-2' 
                                            : ''
                                    }>
                                        <SchemaFieldRenderer
                                            field={field}
                                            control={control}
                                            errors={errors}
                                            disabled={disabled || isLoading}
                                            configSection={configSection}
                                            setValue={setValue}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <SchemaFieldRenderer
                                    field={field}
                                    control={control}
                                    errors={errors}
                                    disabled={disabled || isLoading}
                                    configSection={configSection}
                                    setValue={setValue}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Actions */}
                <Divider className="my-32" />
                
                <div className="flex items-center justify-end gap-12">
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={!hasChanges || isLoading || isSubmitting}
                        size="large"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        type="submit"
                        disabled={!hasChanges || isLoading || isSubmitting}
                        size="large"
                        startIcon={
                            (isLoading || isSubmitting) && (
                                <CircularProgress size={16} color="inherit" />
                            )
                        }
                    >
                        {isLoading || isSubmitting ? 'در حال ذخیره...' : submitLabel}
                    </Button>
                </div>

                {/* Debug: Show form errors in development */}
                {process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0 && (
                    <Alert severity="error" className="mt-16">
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(errors, null, 2)}
                        </pre>
                    </Alert>
                )}
            </form>
        </div>
    );
}

export default DynamicFormGenerator;
