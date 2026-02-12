import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import { Controller } from 'react-hook-form';

/**
 * Boolean Field Component
 * 
 * Renders a switch or checkbox for boolean values.
 */
function BooleanField({ 
    field: fieldDef, 
    control, 
    error,
    disabled = false,
    variant = 'switch', // 'switch' | 'checkbox'
}) {
    const { 
        key, 
        path, 
        title, 
        description, 
        isRequired,
    } = fieldDef;

    const name = path || key;

    const ControlComponent = variant === 'checkbox' ? Checkbox : Switch;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <FormControl error={!!error} disabled={disabled}>
                    <FormControlLabel
                        control={
                            <ControlComponent
                                checked={!!field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                disabled={disabled}
                                color="primary"
                            />
                        }
                        label={title}
                        labelPlacement="end"
                    />
                    {(error?.message || description) && (
                        <FormHelperText>{error?.message || description}</FormHelperText>
                    )}
                </FormControl>
            )}
        />
    );
}

export default BooleanField;
