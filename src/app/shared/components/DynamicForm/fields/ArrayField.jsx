import { useFieldArray } from 'react-hook-form';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import { MdDelete, MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { getDefaultValueForField } from '../../../utils/jsonSchemaUtils/jsonSchemaParser';

// Import SchemaFieldRenderer dynamically to avoid circular dependency
// This will be passed as a prop

/**
 * Array Field Component
 * 
 * Renders a dynamic array of items with add/remove functionality.
 * Supports arrays of primitives and objects.
 */
function ArrayField({ 
    field: fieldDef, 
    control, 
    errors,
    disabled = false,
    configSection, // Config section for file uploads
    setValue,
    FieldRenderer, // SchemaFieldRenderer component passed as prop
}) {
    const { 
        key, 
        path, 
        title, 
        description, 
        isRequired,
        items,
        minItems,
        maxItems,
    } = fieldDef;

    const name = path || key;
    const [expandedItems, setExpandedItems] = useState({});

    const { fields, append, remove } = useFieldArray({
        control,
        name,
    });

    const toggleItem = (index) => {
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleAdd = () => {
        if (maxItems && fields.length >= maxItems) return;

        // Generate default value based on item schema
        let defaultValue;
        if (items?.type === 'object' && items?.properties) {
            defaultValue = {};
            items.properties.forEach(prop => {
                defaultValue[prop.key] = getDefaultValueForField(prop);
            });
        } else {
            defaultValue = getDefaultValueForField({ type: items?.type });
        }

        append(defaultValue);
        // Expand newly added item
        setExpandedItems(prev => ({
            ...prev,
            [fields.length]: true,
        }));
    };

    const handleRemove = (index) => {
        if (minItems && fields.length <= minItems) return;
        remove(index);
    };

    const canAdd = !maxItems || fields.length < maxItems;
    const canRemove = !minItems || fields.length > minItems;

    // Check if items are objects (complex) or primitives (simple)
    const isObjectArray = items?.type === 'object' && items?.properties;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-16">
                <div>
                    <Typography className="text-base font-medium">
                        {title}
                        {isRequired && <span className="text-red-500 mr-1">*</span>}
                    </Typography>
                    {description && (
                        <Typography variant="caption" color="text.secondary">
                            {description}
                        </Typography>
                    )}
                </div>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={handleAdd}
                    disabled={disabled || !canAdd}
                    startIcon={<MdAdd />}
                >
                    افزودن
                </Button>
            </div>

            <div className="space-y-16">
                {fields.map((field, index) => (
                    <Paper
                        key={field.id}
                        elevation={0}
                        className="border rounded-lg overflow-hidden"
                    >
                        <div 
                            className="flex items-center justify-between px-16 py-12 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                            onClick={() => isObjectArray && toggleItem(index)}
                        >
                            <div className="flex items-center gap-8">
                                {isObjectArray && (
                                    <IconButton size="small" className="p-4">
                                        {expandedItems[index] !== false ? <MdExpandLess /> : <MdExpandMore />}
                                    </IconButton>
                                )}
                                <Typography className="text-sm font-medium">
                                    {title} {index + 1}
                                </Typography>
                            </div>
                            <IconButton
                                color="error"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(index);
                                }}
                                disabled={disabled || !canRemove}
                            >
                                <MdDelete size={18} />
                            </IconButton>
                        </div>

                        <Collapse in={isObjectArray ? expandedItems[index] !== false : true}>
                            <div className="p-16 space-y-16">
                                {isObjectArray ? (
                                    // Render object properties
                                    items.properties.map((prop) => {
                                        const fieldPath = `${name}.${index}.${prop.key}`;
                                        const fieldError = errors?.[name]?.[index]?.[prop.key];
                                        
                                        return FieldRenderer ? (
                                            <FieldRenderer
                                                key={prop.key}
                                                field={{
                                                    ...prop,
                                                    path: fieldPath,
                                                }}
                                                control={control}
                                                errors={errors}
                                                disabled={disabled}
                                                configSection={configSection}
                                                setValue={setValue}
                                            />
                                        ) : null;
                                    })
                                ) : (
                                    // Render simple array item
                                    FieldRenderer && (
                                        <FieldRenderer
                                            field={{
                                                ...items,
                                                key: `${index}`,
                                                path: `${name}.${index}`,
                                                title: `${title} ${index + 1}`,
                                            }}
                                            control={control}
                                            errors={errors}
                                            disabled={disabled}
                                            configSection={configSection}
                                            setValue={setValue}
                                        />
                                    )
                                )}
                            </div>
                        </Collapse>
                    </Paper>
                ))}

                {fields.length === 0 && (
                    <Paper
                        elevation={0}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-32 text-center"
                    >
                        <FuseSvgIcon className="text-gray-400 mb-8" size={32}>
                            heroicons-outline:collection
                        </FuseSvgIcon>
                        <Typography color="text.secondary">
                            هیچ آیتمی وجود ندارد. برای شروع روی دکمه "افزودن" کلیک کنید.
                        </Typography>
                    </Paper>
                )}
            </div>

            {/* Array-level error */}
            {errors?.[name]?.message && (
                <Typography color="error" variant="caption" className="mt-8 block">
                    {errors[name].message}
                </Typography>
            )}
        </div>
    );
}

export default ArrayField;
