import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Controller } from 'react-hook-form';
import { LuHash } from 'react-icons/lu';

/**
 * Number/Integer Field Component
 * 
 * Renders a number input with validation for min/max values.
 */
function NumberField({ 
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
        minimum,
        maximum,
        type,
    } = fieldDef;

    const name = path || key;
    const isInteger = type === 'integer';

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <TextField
                    {...field}
                    value={field.value ?? ''}
                    type="number"
                    label={title}
                    placeholder={description || (isInteger ? 'عدد صحیح وارد کنید' : 'عدد وارد کنید')}
                    error={!!error}
                    helperText={error?.message || description}
                    variant="outlined"
                    required={isRequired}
                    fullWidth
                    disabled={disabled}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                            field.onChange(0);
                        } else {
                            field.onChange(isInteger ? parseInt(value, 10) : parseFloat(value));
                        }
                    }}
                    inputProps={{
                        min: minimum,
                        max: maximum,
                        step: isInteger ? 1 : 'any',
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LuHash size={18} className="text-gray-400" />
                            </InputAdornment>
                        ),
                    }}
                />
            )}
        />
    );
}

export default NumberField;
