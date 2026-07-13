import { TextField } from '@mui/material';

function parseMinRows(height) {
  if (typeof height === 'number') {
    return Math.max(8, Math.floor(height / 22));
  }

  if (typeof height === 'string' && height.endsWith('px')) {
    return Math.max(8, Math.floor(parseInt(height, 10) / 22));
  }

  return 12;
}

function SimpleCodeEditor({
  value = '',
  onChange,
  height = '300px',
  readOnly = false,
  minRows,
  placeholder,
}) {
  return (
    <TextField
      multiline
      fullWidth
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange?.(event.target.value)}
      InputProps={{ readOnly }}
      minRows={minRows ?? parseMinRows(height)}
      sx={{
        '& textarea': {
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: 14,
          lineHeight: 1.5,
          direction: 'ltr',
        },
      }}
      spellCheck={false}
    />
  );
}

export default SimpleCodeEditor;
