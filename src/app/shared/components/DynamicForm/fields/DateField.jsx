import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Controller } from 'react-hook-form';
import { MdDateRange } from 'react-icons/md';

/**
 * Date Field Component
 * 
 * Renders a date input.
 */
function DateField({ 
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
        renderType,
    } = fieldDef;

    const name = path || key;
    const inputType = renderType === 'datetime' ? 'datetime-local' : 'date';

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <TextField
                    {...field}
                    value={field.value ?? ''}
                    type={inputType}
                    label={title}
                    error={!!error}
                    helperText={error?.message || description}
                    variant="outlined"
                    required={isRequired}
                    fullWidth
                    disabled={disabled}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MdDateRange size={18} className="text-gray-400" />
                            </InputAdornment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default DateField;
