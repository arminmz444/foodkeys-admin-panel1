// registerJsonSchema.js
import * as monaco from 'monaco-editor';

export function registerJsonSchema(schemaUri, schemaObject) {
	monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
		validate: true,
		schemas: [
			{
				uri: schemaUri, // "https://back.agfo.ir/service/schema/23"
				fileMatch: ['*'], // TODO: match only json files
				schema: schemaObject
			}
		]
	});
}
