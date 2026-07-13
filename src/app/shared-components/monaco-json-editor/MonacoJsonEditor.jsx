import SimpleCodeEditor from '../simple-code-editor/SimpleCodeEditor';

function MonacoJsonEditor({ value = '{}', onChange, height = 400, readOnly = false }) {
  return (
    <SimpleCodeEditor
      value={value}
      onChange={onChange}
      height={height}
      readOnly={readOnly}
    />
  );
}

export default MonacoJsonEditor;
