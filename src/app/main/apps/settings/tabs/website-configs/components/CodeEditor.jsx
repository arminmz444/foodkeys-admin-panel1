import SimpleCodeEditor from '@/app/shared-components/simple-code-editor/SimpleCodeEditor';

function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '300px',
  readOnly = false,
}) {
  return (
    <SimpleCodeEditor
      value={value}
      onChange={onChange}
      height={height}
      readOnly={readOnly}
      placeholder={language === 'json' ? '{ }' : ''}
    />
  );
}

export default CodeEditor;
