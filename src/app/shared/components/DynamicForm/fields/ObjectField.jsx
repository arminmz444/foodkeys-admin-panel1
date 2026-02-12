import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * Object Field Component
 * 
 * Renders a nested object with its properties.
 * Uses an accordion or fieldset layout.
 */
function ObjectField({ 
    field: fieldDef, 
    control, 
    errors,
    disabled = false,
    configSection, // Config section for file uploads
    setValue,
    FieldRenderer, // SchemaFieldRenderer component passed as prop
    variant = 'accordion', // 'accordion' | 'fieldset' | 'inline'
}) {
    const { 
        key, 
        path, 
        title, 
        description, 
        isRequired,
        properties = [],
    } = fieldDef;

    const name = path || key;

    // Get nested errors for this object
    const getNestedErrors = () => {
        if (!errors || !name) return {};
        
        const parts = name.split('.');
        let current = errors;
        
        for (const part of parts) {
            if (current && current[part]) {
                current = current[part];
            } else {
                return {};
            }
        }
        
        return current || {};
    };

    const nestedErrors = getNestedErrors();

    const renderFields = () => (
        <div className="space-y-20">
            {properties.map((prop) => {
                const fieldPath = `${name}.${prop.key}`;
                
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
            })}
        </div>
    );

    // Inline variant - no wrapper
    if (variant === 'inline') {
        return (
            <div className="w-full">
                {title && (
                    <Typography className="text-base font-medium mb-16">
                        {title}
                        {isRequired && <span className="text-red-500 mr-1">*</span>}
                    </Typography>
                )}
                {renderFields()}
            </div>
        );
    }

    // Fieldset variant - simple border
    if (variant === 'fieldset') {
        return (
            <Paper elevation={0} className="border rounded-lg p-20">
                <Typography className="text-base font-medium mb-16">
                    {title}
                    {isRequired && <span className="text-red-500 mr-1">*</span>}
                </Typography>
                {description && (
                    <Typography variant="caption" color="text.secondary" className="mb-16 block">
                        {description}
                    </Typography>
                )}
                {renderFields()}
            </Paper>
        );
    }

    // Accordion variant (default)
    return (
        <Accordion defaultExpanded elevation={0} className="border rounded-lg">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
            </AccordionSummary>
            <AccordionDetails>
                {renderFields()}
            </AccordionDetails>
        </Accordion>
    );
}

export default ObjectField;
