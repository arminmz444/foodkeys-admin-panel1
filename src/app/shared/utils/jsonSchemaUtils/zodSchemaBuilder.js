/**
 * Zod Schema Builder Utility
 * 
 * Converts JSON Schema to Zod validation schema for react-hook-form.
 * Preserves custom Persian error messages from the schema.
 */

import { z } from 'zod';
import { FIELD_TYPES, FIELD_FORMATS, isColorField } from './jsonSchemaParser';

/**
 * Default Persian error messages
 */
const DEFAULT_MESSAGES = {
    required: 'این فیلد الزامی است',
    invalidType: 'نوع داده نامعتبر است',
    invalidString: 'مقدار باید از نوع متن باشد',
    invalidNumber: 'مقدار باید از نوع عدد باشد',
    invalidBoolean: 'مقدار باید از نوع بولین باشد',
    invalidArray: 'مقدار باید از نوع آرایه باشد',
    invalidObject: 'مقدار باید از نوع شیء باشد',
    invalidUri: 'آدرس اینترنتی نامعتبر است',
    invalidEmail: 'آدرس ایمیل نامعتبر است',
    invalidPattern: 'فرمت وارد شده نامعتبر است',
    invalidEnum: 'مقدار انتخاب شده نامعتبر است',
    minLength: (min) => `حداقل ${min} کاراکتر وارد کنید`,
    maxLength: (max) => `حداکثر ${max} کاراکتر مجاز است`,
    minimum: (min) => `مقدار باید حداقل ${min} باشد`,
    maximum: (max) => `مقدار باید حداکثر ${max} باشد`,
    minItems: (min) => `حداقل ${min} آیتم الزامی است`,
    maxItems: (max) => `حداکثر ${max} آیتم مجاز است`,
};

/**
 * Gets message from schema or returns default
 * @param {object} messages - Schema messages object
 * @param {string} key - Message key
 * @param {any} defaultMsg - Default message
 * @returns {string} - Message string
 */
function getMessage(messages, key, defaultMsg) {
    if (messages && messages[key]) {
        return messages[key];
    }
    return typeof defaultMsg === 'function' ? defaultMsg() : defaultMsg;
}

/**
 * Builds a Zod string schema with validations
 * @param {object} fieldSchema - JSON Schema field definition
 * @param {object} messages - Custom messages
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodType} - Zod schema
 */
function buildStringSchema(fieldSchema, messages = {}, isRequired = false) {
    let schema = z.string({
        invalid_type_error: getMessage(messages, 'type', DEFAULT_MESSAGES.invalidString),
    });
    
    // Format validations
    if (fieldSchema.format === FIELD_FORMATS.URI) {
        schema = schema.url({
            message: getMessage(messages, 'format', DEFAULT_MESSAGES.invalidUri),
        });
    } else if (fieldSchema.format === FIELD_FORMATS.EMAIL) {
        schema = schema.email({
            message: getMessage(messages, 'format', DEFAULT_MESSAGES.invalidEmail),
        });
    }
    
    // Pattern validation
    if (fieldSchema.pattern) {
        try {
            const regex = new RegExp(fieldSchema.pattern);
            schema = schema.regex(regex, {
                message: getMessage(messages, 'pattern', DEFAULT_MESSAGES.invalidPattern),
            });
        } catch (e) {
            console.warn('Invalid regex pattern:', fieldSchema.pattern);
        }
    }
    
    // Length validations
    if (fieldSchema.minLength !== undefined) {
        schema = schema.min(fieldSchema.minLength, {
            message: getMessage(messages, 'minLength', DEFAULT_MESSAGES.minLength(fieldSchema.minLength)),
        });
    }
    
    if (fieldSchema.maxLength !== undefined) {
        schema = schema.max(fieldSchema.maxLength, {
            message: getMessage(messages, 'maxLength', DEFAULT_MESSAGES.maxLength(fieldSchema.maxLength)),
        });
    }
    
    // Handle required vs optional
    if (!isRequired) {
        schema = schema.optional().or(z.literal(''));
    }
    
    return schema;
}

/**
 * Builds a Zod number schema with validations
 * @param {object} fieldSchema - JSON Schema field definition
 * @param {object} messages - Custom messages
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodType} - Zod schema
 */
function buildNumberSchema(fieldSchema, messages = {}, isRequired = false) {
    let schema = z.number({
        invalid_type_error: getMessage(messages, 'type', DEFAULT_MESSAGES.invalidNumber),
    });
    
    // For integers
    if (fieldSchema.type === FIELD_TYPES.INTEGER) {
        schema = schema.int({
            message: 'مقدار باید عدد صحیح باشد',
        });
    }
    
    // Enum validation
    if (Array.isArray(fieldSchema.enum) && fieldSchema.enum.length > 0) {
        // Use refine for numeric enums
        const enumValues = fieldSchema.enum;
        schema = schema.refine((val) => enumValues.includes(val), {
            message: getMessage(messages, 'enum', DEFAULT_MESSAGES.invalidEnum),
        });
    }
    
    // Range validations
    if (fieldSchema.minimum !== undefined) {
        schema = schema.min(fieldSchema.minimum, {
            message: getMessage(messages, 'minimum', DEFAULT_MESSAGES.minimum(fieldSchema.minimum)),
        });
    }
    
    if (fieldSchema.maximum !== undefined) {
        schema = schema.max(fieldSchema.maximum, {
            message: getMessage(messages, 'maximum', DEFAULT_MESSAGES.maximum(fieldSchema.maximum)),
        });
    }
    
    // Handle required vs optional
    if (!isRequired) {
        schema = schema.optional().or(z.literal(0));
    }
    
    return schema;
}

/**
 * Builds a Zod boolean schema
 * @param {object} fieldSchema - JSON Schema field definition
 * @param {object} messages - Custom messages
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodType} - Zod schema
 */
function buildBooleanSchema(fieldSchema, messages = {}, isRequired = false) {
    let schema = z.boolean({
        invalid_type_error: getMessage(messages, 'type', DEFAULT_MESSAGES.invalidBoolean),
    });
    
    if (!isRequired) {
        schema = schema.optional().default(false);
    }
    
    return schema;
}

/**
 * Builds a Zod array schema with item validation
 * @param {object} fieldSchema - JSON Schema field definition
 * @param {object} messages - Custom messages
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodType} - Zod schema
 */
function buildArraySchema(fieldSchema, messages = {}, isRequired = false) {
    // Get items schema
    const itemsSchema = fieldSchema.items;
    let itemZodSchema;
    
    if (itemsSchema) {
        // Recursively build item schema
        itemZodSchema = buildZodSchemaForField(
            itemsSchema,
            itemsSchema.message || {},
            false // Items themselves handle their own required
        );
    } else {
        // Default to any
        itemZodSchema = z.any();
    }
    
    let schema = z.array(itemZodSchema, {
        invalid_type_error: getMessage(messages, 'type', DEFAULT_MESSAGES.invalidArray),
    });
    
    // Array length validations
    if (fieldSchema.minItems !== undefined) {
        schema = schema.min(fieldSchema.minItems, {
            message: getMessage(messages, 'minItems', DEFAULT_MESSAGES.minItems(fieldSchema.minItems)),
        });
    }
    
    if (fieldSchema.maxItems !== undefined) {
        schema = schema.max(fieldSchema.maxItems, {
            message: getMessage(messages, 'maxItems', DEFAULT_MESSAGES.maxItems(fieldSchema.maxItems)),
        });
    }
    
    if (!isRequired) {
        schema = schema.optional().default([]);
    }
    
    return schema;
}

/**
 * Builds a Zod object schema with property validations
 * @param {object} fieldSchema - JSON Schema field definition
 * @param {object} messages - Custom messages
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodType} - Zod schema
 */
function buildObjectSchema(fieldSchema, messages = {}, isRequired = false) {
    const properties = fieldSchema.properties || {};
    const required = fieldSchema.required || [];
    const requiredMessages = messages.required || {};
    
    const shape = {};
    
    Object.entries(properties).forEach(([key, propSchema]) => {
        const propMessages = propSchema.message || {};
        const propIsRequired = required.includes(key);
        
        // Add required message from parent if available
        if (propIsRequired && requiredMessages[key]) {
            propMessages.required = requiredMessages[key];
        }
        
        shape[key] = buildZodSchemaForField(propSchema, propMessages, propIsRequired);
    });
    
    let schema = z.object(shape);
    
    if (!isRequired) {
        schema = schema.optional();
    }
    
    return schema;
}

/**
 * Builds a Zod enum schema
 * @param {object} fieldSchema - JSON Schema field definition
 * @param {object} messages - Custom messages
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodType} - Zod schema
 */
function buildEnumSchema(fieldSchema, messages = {}, isRequired = false) {
    const enumValues = fieldSchema.enum;
    
    if (!Array.isArray(enumValues) || enumValues.length === 0) {
        return z.any();
    }
    
    // Check if all values are strings
    const allStrings = enumValues.every(v => typeof v === 'string');
    
    if (allStrings) {
        let schema = z.enum(enumValues, {
            errorMap: () => ({
                message: getMessage(messages, 'enum', DEFAULT_MESSAGES.invalidEnum),
            }),
        });
        
        if (!isRequired) {
            schema = schema.optional();
        }
        
        return schema;
    }
    
    // For numeric or mixed enums, use union
    const literals = enumValues.map(v => z.literal(v));
    let schema = z.union(literals, {
        errorMap: () => ({
            message: getMessage(messages, 'enum', DEFAULT_MESSAGES.invalidEnum),
        }),
    });
    
    if (!isRequired) {
        schema = schema.optional();
    }
    
    return schema;
}

/**
 * Builds Zod schema for a single field based on JSON Schema type
 * @param {object} fieldSchema - JSON Schema field definition
 * @param {object} messages - Custom messages
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodType} - Zod schema
 */
export function buildZodSchemaForField(fieldSchema, messages = {}, isRequired = false) {
    if (!fieldSchema) {
        return z.any();
    }
    
    const { type } = fieldSchema;
    
    // Handle enum first (can be any type)
    if (Array.isArray(fieldSchema.enum) && fieldSchema.enum.length > 0) {
        // Check if it's a numeric enum
        const hasNumbers = fieldSchema.enum.some(v => typeof v === 'number');
        if (!hasNumbers) {
            return buildEnumSchema(fieldSchema, messages, isRequired);
        }
        // Numeric enums handled within number schema
    }
    
    switch (type) {
        case FIELD_TYPES.STRING:
            return buildStringSchema(fieldSchema, messages, isRequired);
            
        case FIELD_TYPES.INTEGER:
        case FIELD_TYPES.NUMBER:
            return buildNumberSchema(fieldSchema, messages, isRequired);
            
        case FIELD_TYPES.BOOLEAN:
            return buildBooleanSchema(fieldSchema, messages, isRequired);
            
        case FIELD_TYPES.ARRAY:
            return buildArraySchema(fieldSchema, messages, isRequired);
            
        case FIELD_TYPES.OBJECT:
            return buildObjectSchema(fieldSchema, messages, isRequired);
            
        default:
            return isRequired ? z.any() : z.any().optional();
    }
}

/**
 * Builds a complete Zod schema from JSON Schema
 * @param {object} jsonSchema - Full JSON Schema object (can be wrapped in schemaDefinition)
 * @returns {z.ZodObject} - Complete Zod object schema
 */
export function buildZodSchema(jsonSchema) {
    if (!jsonSchema) {
        return z.object({});
    }
    
    // Handle schema wrapped in schemaDefinition (from API)
    let schemaObj = jsonSchema;
    if (jsonSchema.schemaDefinition) {
        schemaObj = typeof jsonSchema.schemaDefinition === 'string' 
            ? JSON.parse(jsonSchema.schemaDefinition) 
            : jsonSchema.schemaDefinition;
    }
    
    if (!schemaObj || !schemaObj.properties) {
        return z.object({});
    }
    
    const { properties, required = [], message = {} } = schemaObj;
    const requiredMessages = message.required || {};
    
    const shape = {};
    
    Object.entries(properties).forEach(([key, fieldSchema]) => {
        const fieldMessages = fieldSchema.message || {};
        const isRequired = required.includes(key);
        
        // Add required message from parent if available
        if (isRequired && requiredMessages[key]) {
            fieldMessages.required = requiredMessages[key];
        }
        
        shape[key] = buildZodSchemaForField(fieldSchema, fieldMessages, isRequired);
    });
    
    return z.object(shape);
}

/**
 * Creates a Zod schema for a specific array item (for useFieldArray)
 * @param {object} itemSchema - Array items JSON Schema
 * @returns {z.ZodType} - Zod schema for single item
 */
export function buildArrayItemSchema(itemSchema) {
    if (!itemSchema) {
        return z.any();
    }
    
    return buildZodSchemaForField(itemSchema, itemSchema.message || {}, true);
}

/**
 * Utility to validate data against JSON Schema using Zod
 * @param {object} jsonSchema - JSON Schema
 * @param {object} data - Data to validate
 * @returns {object} - { success: boolean, data?: object, errors?: object }
 */
export function validateWithSchema(jsonSchema, data) {
    try {
        const zodSchema = buildZodSchema(jsonSchema);
        const result = zodSchema.safeParse(data);
        
        if (result.success) {
            return { success: true, data: result.data };
        }
        
        // Format errors
        const errors = {};
        result.error.errors.forEach(err => {
            const path = err.path.join('.');
            errors[path] = err.message;
        });
        
        return { success: false, errors };
    } catch (e) {
        console.error('Validation error:', e);
        return { success: false, errors: { _form: 'خطا در اعتبارسنجی فرم' } };
    }
}

export default {
    buildZodSchema,
    buildZodSchemaForField,
    buildArrayItemSchema,
    validateWithSchema,
    DEFAULT_MESSAGES,
};
