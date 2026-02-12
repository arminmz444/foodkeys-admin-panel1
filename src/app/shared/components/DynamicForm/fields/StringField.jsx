import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Controller } from 'react-hook-form';
import { LuText } from 'react-icons/lu';

/**
 * String Field Component
 * 
 * Renders a text input or textarea based on field configuration.
 */
function StringField({ 
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
        maxLength,
        minLength,
    } = fieldDef;

    const isTextarea = renderType === 'textarea';
    const name = path || key;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <TextField
                    {...field}
                    value={field.value ?? ''}
                    label={title}
                    placeholder={description || `${title} را وارد کنید`}
                    error={!!error}
                    helperText={error?.message || description}
                    variant="outlined"
                    required={isRequired}
                    fullWidth
                    disabled={disabled}
                    multiline={isTextarea}
                    minRows={isTextarea ? 3 : undefined}
                    maxRows={isTextarea ? 10 : undefined}
                    inputProps={{
                        maxLength: maxLength,
                        minLength: minLength,
                    }}
                    InputProps={{
                        className: isTextarea ? 'max-h-min h-min items-start' : undefined,
                        startAdornment: !isTextarea ? (
                            <InputAdornment position="start">
                                <LuText size={18} className="text-gray-400" />
                            </InputAdornment>
                        ) : undefined,
                    }}
                />
            )}
        />
    );
}

export default StringField;
