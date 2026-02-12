import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Controller } from 'react-hook-form';

/**
 * Enum/Select Field Component
 * 
 * Renders a dropdown select for enum values.
 */
function EnumField({ 
    field: fieldDef, 
    control, 
    error,
    disabled = false,
}) {
    const { 
        key, 
        path, 
        title, 
        description, 
        isRequired,
        enum: enumValues = [],
    } = fieldDef;

    const name = path || key;

    // Generate labels for enum values
    const getEnumLabel = (value) => {
        if (typeof value === 'boolean') {
            return value ? 'بله' : 'خیر';
        }
        if (typeof value === 'number') {
            return `گزینه ${value}`;
        }
        return String(value);
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <FormControl fullWidth error={!!error} required={isRequired} disabled={disabled}>
                    <InputLabel id={`${name}-label`}>{title}</InputLabel>
                    <Select
                        {...field}
                        value={field.value ?? ''}
                        labelId={`${name}-label`}
                        label={title}
                    >
                        {!isRequired && (
                            <MenuItem value="">
                                <em>انتخاب کنید</em>
                            </MenuItem>
                        )}
                        {enumValues.map((value, index) => (
                            <MenuItem key={index} value={value}>
                                {getEnumLabel(value)}
                            </MenuItem>
                        ))}
                    </Select>
                    {(error?.message || description) && (
                        <FormHelperText>{error?.message || description}</FormHelperText>
                    )}
                </FormControl>
            )}
        />
    );
}

export default EnumField;
