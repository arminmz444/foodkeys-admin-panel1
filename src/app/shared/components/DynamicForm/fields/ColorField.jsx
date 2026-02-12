import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Controller } from 'react-hook-form';
import { AiOutlineBgColors } from 'react-icons/ai';

/**
 * Color Field Component
 * 
 * Renders a color picker with hex input.
 */
function ColorField({ 
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
                <div className="relative w-full">
                    <input
                        className="absolute z-10 border-0 left-0 top-0 translate-x-1/2 translate-y-1/3 w-28 h-28 rounded-lg cursor-pointer"
                        type="color"
                        value={field.value || '#ffffff'}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={disabled}
                    />
                    <TextField
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        label={title}
                        placeholder="#FFFFFF"
                        error={!!error}
                        helperText={error?.message || description || 'فرمت: #FFFFFF یا #FFF'}
                        variant="outlined"
                        required={isRequired}
                        fullWidth
                        disabled={disabled}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AiOutlineBgColors size={18} className="text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>
            )}
        />
    );
}

export default ColorField;
