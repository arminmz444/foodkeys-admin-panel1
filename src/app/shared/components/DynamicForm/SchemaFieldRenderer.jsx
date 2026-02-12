import { useMemo } from 'react';
import {
    StringField,
    UrlField,
    EmailField,
    ColorField,
    NumberField,
    EnumField,
    BooleanField,
    ArrayField,
    ObjectField,
    DateField,
    FileUploadField,
} from './fields';

/**
 * Schema Field Renderer
 * 
 * Routes field rendering to the appropriate component based on renderType.
 * Handles nested objects and arrays recursively.
 */
function SchemaFieldRenderer({ 
    field, 
    control, 
    errors,
    disabled = false,
    configSection, // Config section for file uploads
    setValue,
}) {
    // Get the error for this specific field
    const getFieldError = useMemo(() => {
        if (!errors || !field?.path) return undefined;
        
        const parts = field.path.split('.');
        let current = errors;
        
        for (const part of parts) {
            // Handle array indices
            if (/^\d+$/.test(part)) {
                if (Array.isArray(current)) {
                    current = current[parseInt(part, 10)];
                } else if (current && current[part]) {
                    current = current[part];
                } else {
                    return undefined;
                }
            } else if (current && current[part]) {
                current = current[part];
            } else {
                return undefined;
            }
        }
        
        return current;
    }, [errors, field?.path]);

    if (!field) {
        return null;
    }

    const commonProps = {
        field,
        control,
        error: getFieldError,
        errors, // Pass full errors for nested components
        disabled,
        configSection, // Pass config section for file uploads
        setValue,
        FieldRenderer: SchemaFieldRenderer, // Pass self for recursive rendering
    };

    // Route to appropriate component based on renderType
    switch (field.renderType) {
        case 'string':
        case 'textarea':
            return <StringField {...commonProps} />;
            
        case 'url':
            return <UrlField {...commonProps} />;
            
        case 'email':
            return <EmailField {...commonProps} />;
            
        case 'color':
            return <ColorField {...commonProps} />;
            
        case 'number':
            return <NumberField {...commonProps} />;
            
        case 'enum':
            return <EnumField {...commonProps} />;
            
        case 'boolean':
            return <BooleanField {...commonProps} />;
            
        case 'array':
            return <ArrayField {...commonProps} />;
            
        case 'object':
            return <ObjectField {...commonProps} />;
            
        case 'date':
        case 'datetime':
            return <DateField {...commonProps} />;
            
        case 'file':
            return <FileUploadField {...commonProps} />;
            
        default:
            // Default to string field
            return <StringField {...commonProps} />;
    }
}

export default SchemaFieldRenderer;
