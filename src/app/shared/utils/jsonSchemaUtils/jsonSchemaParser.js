/**
 * JSON Schema Parser Utility
 * 
 * Parses JSON Schema and extracts field definitions, validations, and messages.
 * Supports nested objects and arrays with recursive parsing.
 */

/**
 * Field types supported by the dynamic form
 */
export const FIELD_TYPES = {
    STRING: 'string',
    INTEGER: 'integer',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    ARRAY: 'array',
    OBJECT: 'object',
};

/**
 * Special field formats
 */
export const FIELD_FORMATS = {
    URI: 'uri',
    EMAIL: 'email',
    DATE: 'date',
    DATE_TIME: 'date-time',
    TIME: 'time',
};

/**
 * Color pattern regex for hex colors
 */
export const COLOR_PATTERN = /^#([A-Fa-f0-9]{3}){1,2}$/;

/**
 * Determines if a field is a color picker based on pattern
 * @param {object} schema - Field schema
 * @returns {boolean}
 */
export function isColorField(schema) {
    if (!schema?.pattern) return false;
    const patternStr = schema.pattern.toString();
    return patternStr.includes('#') && 
           (patternStr.includes('A-Fa-f0-9') || patternStr.includes('[0-9A-Fa-f]'));
}

/**
 * Determines if a field should be a textarea based on schema hints
 * @param {object} schema - Field schema
 * @param {string} key - Field key name
 * @returns {boolean}
 */
export function isTextareaField(schema, key) {
    const textareaKeys = ['content', 'description', 'text', 'body', 'message', 'bio', 'about'];
    const keyLower = key?.toLowerCase() || '';
    
    if (textareaKeys.some(tk => keyLower.includes(tk))) return true;
    if (schema?.maxLength && schema.maxLength > 200) return true;
    
    return false;
}

/**
 * Determines if a field is an enum/select field
 * @param {object} schema - Field schema
 * @returns {boolean}
 */
export function isEnumField(schema) {
    return Array.isArray(schema?.enum) && schema.enum.length > 0;
}

/**
 * Gets the appropriate field type for rendering
 * @param {object} schema - Field schema
 * @param {string} key - Field key name
 * @returns {string} - Resolved field type for rendering
 */
export function getFieldRenderType(schema, key) {
    if (!schema) return 'unknown';
    
    const { type, format, pattern, fileServiceType, uniforms } = schema;
    
    // Check for enum first (works with any type)
    if (isEnumField(schema)) {
        return 'enum';
    }
    
    // Handle string types
    if (type === FIELD_TYPES.STRING) {
        // Check if it's a file upload field (has fileServiceType or uniforms.component is FileUpload)
        const isFileUpload = fileServiceType || uniforms?.component === 'FileUpload';
        
        if (format === FIELD_FORMATS.URI) {
            // Only treat as file if explicitly marked as file upload
            return isFileUpload ? 'file' : 'url';
        }
        if (format === FIELD_FORMATS.EMAIL) return 'email';
        if (format === FIELD_FORMATS.DATE) return 'date';
        if (format === FIELD_FORMATS.DATE_TIME) return 'datetime';
        if (isColorField(schema)) return 'color';
        if (isTextareaField(schema, key)) return 'textarea';
        return 'string';
    }
    
    // Handle number types
    if (type === FIELD_TYPES.INTEGER || type === FIELD_TYPES.NUMBER) {
        return 'number';
    }
    
    // Handle boolean
    if (type === FIELD_TYPES.BOOLEAN) {
        return 'boolean';
    }
    
    // Handle array
    if (type === FIELD_TYPES.ARRAY) {
        return 'array';
    }
    
    // Handle object
    if (type === FIELD_TYPES.OBJECT) {
        return 'object';
    }
    
    return 'string'; // Default to string
}

/**
 * Extracts validation messages from schema
 * @param {object} schema - Field schema
 * @returns {object} - Validation messages object
 */
export function extractMessages(schema) {
    const messages = {};
    
    if (!schema?.message) return messages;
    
    const messageObj = schema.message;
    
    // Type message
    if (messageObj.type) {
        messages.type = messageObj.type;
    }
    
    // Format message
    if (messageObj.format) {
        messages.format = messageObj.format;
    }
    
    // Pattern message
    if (messageObj.pattern) {
        messages.pattern = messageObj.pattern;
    }
    
    // Enum message
    if (messageObj.enum) {
        messages.enum = messageObj.enum;
    }
    
    // Required messages (can be an object with field-specific messages)
    if (messageObj.required) {
        messages.required = messageObj.required;
    }
    
    // Min/max messages
    if (messageObj.minimum) messages.minimum = messageObj.minimum;
    if (messageObj.maximum) messages.maximum = messageObj.maximum;
    if (messageObj.minLength) messages.minLength = messageObj.minLength;
    if (messageObj.maxLength) messages.maxLength = messageObj.maxLength;
    if (messageObj.minItems) messages.minItems = messageObj.minItems;
    if (messageObj.maxItems) messages.maxItems = messageObj.maxItems;
    
    return messages;
}

/**
 * Parses a single field from JSON Schema
 * @param {string} key - Field key
 * @param {object} fieldSchema - Field schema definition
 * @param {string[]} requiredFields - Array of required field names
 * @param {string} parentPath - Parent path for nested fields
 * @returns {object} - Parsed field definition
 */
export function parseField(key, fieldSchema, requiredFields = [], parentPath = '') {
    const fullPath = parentPath ? `${parentPath}.${key}` : key;
    const isRequired = requiredFields.includes(key);
    const renderType = getFieldRenderType(fieldSchema, key);
    const messages = extractMessages(fieldSchema);
    
    const field = {
        key,
        path: fullPath,
        type: fieldSchema.type,
        renderType,
        isRequired,
        messages,
        // Schema properties
        title: fieldSchema.title || formatFieldLabel(key),
        description: fieldSchema.description,
        default: fieldSchema.default,
        // Validation properties
        enum: fieldSchema.enum,
        format: fieldSchema.format,
        pattern: fieldSchema.pattern,
        minimum: fieldSchema.minimum,
        maximum: fieldSchema.maximum,
        minLength: fieldSchema.minLength,
        maxLength: fieldSchema.maxLength,
        minItems: fieldSchema.minItems,
        maxItems: fieldSchema.maxItems,
    };
    
    // Handle nested object
    if (fieldSchema.type === FIELD_TYPES.OBJECT && fieldSchema.properties) {
        field.properties = parseSchemaProperties(
            fieldSchema.properties,
            fieldSchema.required || [],
            fullPath
        );
    }
    
    // Handle array items
    if (fieldSchema.type === FIELD_TYPES.ARRAY && fieldSchema.items) {
        field.items = parseArrayItems(fieldSchema.items, fullPath);
    }
    
    return field;
}

/**
 * Parses array items schema
 * @param {object} itemsSchema - Items schema definition
 * @param {string} parentPath - Parent path
 * @returns {object} - Parsed items definition
 */
export function parseArrayItems(itemsSchema, parentPath) {
    const itemsPath = `${parentPath}[]`;
    
    if (itemsSchema.type === FIELD_TYPES.OBJECT && itemsSchema.properties) {
        return {
            type: 'object',
            properties: parseSchemaProperties(
                itemsSchema.properties,
                itemsSchema.required || [],
                itemsPath
            ),
            messages: extractMessages(itemsSchema),
        };
    }
    
    // Simple array items (string[], number[], etc.)
    return {
        type: itemsSchema.type,
        renderType: getFieldRenderType(itemsSchema, 'item'),
        messages: extractMessages(itemsSchema),
        format: itemsSchema.format,
        pattern: itemsSchema.pattern,
        enum: itemsSchema.enum,
    };
}

/**
 * Parses schema properties recursively
 * @param {object} properties - Properties object from schema
 * @param {string[]} requiredFields - Array of required field names
 * @param {string} parentPath - Parent path for nested fields
 * @returns {object[]} - Array of parsed field definitions
 */
export function parseSchemaProperties(properties, requiredFields = [], parentPath = '') {
    if (!properties) return [];
    
    return Object.entries(properties).map(([key, fieldSchema]) => 
        parseField(key, fieldSchema, requiredFields, parentPath)
    );
}

/**
 * Parses a complete JSON Schema
 * @param {object} schema - Full JSON Schema object (can be wrapped in schemaDefinition)
 * @returns {object} - Parsed schema with fields and metadata
 */
export function parseJsonSchema(schema) {
    if (!schema) {
        console.warn('parseJsonSchema: No schema provided');
        return {
            title: '',
            description: '',
            fields: [],
            rawSchema: null,
        };
    }
    
    console.log('parseJsonSchema: Input schema:', schema);
    
    // Handle schema wrapped in schemaDefinition (from API)
    let schemaObj = schema;
    if (schema.schemaDefinition !== undefined) {
        schemaObj = typeof schema.schemaDefinition === 'string' 
            ? JSON.parse(schema.schemaDefinition) 
            : schema.schemaDefinition;
        console.log('parseJsonSchema: Extracted schemaDefinition:', schemaObj);
    } else if (schema.properties) {
        // Schema is already in the correct format
        schemaObj = schema;
        console.log('parseJsonSchema: Schema has properties directly');
    }
    
    if (!schemaObj || !schemaObj.properties) {
        console.warn('parseJsonSchema: Schema has no properties:', schemaObj);
        return {
            title: '',
            description: '',
            fields: [],
            rawSchema: schema,
        };
    }
    
    const { title, description, properties, required = [] } = schemaObj;
    
    const result = {
        title: title || '',
        description: description || '',
        fields: parseSchemaProperties(properties, required),
        required,
        rawSchema: schema,
    };
    
    console.log('parseJsonSchema: Parsed result:', result);
    return result;
}

/**
 * Formats a field key into a human-readable label
 * @param {string} key - Field key
 * @returns {string} - Formatted label
 */
export function formatFieldLabel(key) {
    if (!key) return '';
    
    // Split camelCase and snake_case
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^\s+/, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Gets default value for a field based on its type
 * @param {object} field - Parsed field definition
 * @returns {any} - Default value
 */
export function getDefaultValueForField(field) {
    if (field.default !== undefined) {
        return field.default;
    }
    
    switch (field.type) {
        case FIELD_TYPES.STRING:
            return '';
        case FIELD_TYPES.INTEGER:
        case FIELD_TYPES.NUMBER:
            return 0;
        case FIELD_TYPES.BOOLEAN:
            return false;
        case FIELD_TYPES.ARRAY:
            return [];
        case FIELD_TYPES.OBJECT:
            if (field.properties) {
                const obj = {};
                field.properties.forEach(prop => {
                    obj[prop.key] = getDefaultValueForField(prop);
                });
                return obj;
            }
            return {};
        default:
            return '';
    }
}

/**
 * Generates default values for all fields in a parsed schema
 * @param {object} parsedSchema - Parsed schema from parseJsonSchema
 * @returns {object} - Default values object
 */
export function generateDefaultValues(parsedSchema) {
    const defaults = {};
    
    if (!parsedSchema?.fields) return defaults;
    
    parsedSchema.fields.forEach(field => {
        defaults[field.key] = getDefaultValueForField(field);
    });
    
    return defaults;
}

/**
 * Flattens nested field paths for form registration
 * @param {object[]} fields - Array of parsed fields
 * @param {string} prefix - Path prefix
 * @returns {string[]} - Array of flattened field paths
 */
export function flattenFieldPaths(fields, prefix = '') {
    const paths = [];
    
    fields.forEach(field => {
        const path = prefix ? `${prefix}.${field.key}` : field.key;
        
        if (field.type === FIELD_TYPES.OBJECT && field.properties) {
            paths.push(...flattenFieldPaths(field.properties, path));
        } else if (field.type === FIELD_TYPES.ARRAY) {
            paths.push(path);
            // Array items handled dynamically
        } else {
            paths.push(path);
        }
    });
    
    return paths;
}

export default {
    parseJsonSchema,
    parseSchemaProperties,
    parseField,
    getFieldRenderType,
    extractMessages,
    formatFieldLabel,
    getDefaultValueForField,
    generateDefaultValues,
    flattenFieldPaths,
    isColorField,
    isTextareaField,
    isEnumField,
    FIELD_TYPES,
    FIELD_FORMATS,
};
