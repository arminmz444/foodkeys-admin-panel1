import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Controller } from 'react-hook-form';
import { LuLink } from 'react-icons/lu';

/**
 * URL Field Component
 * 
 * Renders a URL input with link icon and validation.
 */
function UrlField({ 
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
    } = fieldDef;

    const name = path || key;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <TextField
                    {...field}
                    value={field.value ?? ''}
                    type="url"
                    label={title}
                    placeholder={description || 'https://example.com'}
                    error={!!error}
                    helperText={error?.message || description}
                    variant="outlined"
                    required={isRequired}
                    fullWidth
                    disabled={disabled}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LuLink size={18} className="text-gray-400" />
                            </InputAdornment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default UrlField;
