import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Controller } from 'react-hook-form';
import { MdEmail } from 'react-icons/md';

/**
 * Email Field Component
 * 
 * Renders an email input with validation.
 */
function EmailField({ 
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
                    type="email"
                    label={title}
                    placeholder={description || 'example@domain.com'}
                    error={!!error}
                    helperText={error?.message || description}
                    variant="outlined"
                    required={isRequired}
                    fullWidth
                    disabled={disabled}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MdEmail size={18} className="text-gray-400" />
                            </InputAdornment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default EmailField;
