/**
 * Dynamic Form Field Components
 * 
 * Exports all field components for the dynamic form generator.
 */

export { default as StringField } from './StringField';
export { default as UrlField } from './UrlField';
export { default as EmailField } from './EmailField';
export { default as ColorField } from './ColorField';
export { default as NumberField } from './NumberField';
export { default as EnumField } from './EnumField';
export { default as BooleanField } from './BooleanField';
export { default as ArrayField } from './ArrayField';
export { default as ObjectField } from './ObjectField';
export { default as DateField } from './DateField';
export { default as FileUploadField } from './FileUploadField';

/**
 * Field type to component mapping
 */
export const FIELD_COMPONENTS = {
    string: 'StringField',
    textarea: 'StringField',
    url: 'UrlField',
    email: 'EmailField',
    color: 'ColorField',
    number: 'NumberField',
    enum: 'EnumField',
    boolean: 'BooleanField',
    array: 'ArrayField',
    object: 'ObjectField',
    date: 'DateField',
    datetime: 'DateField',
    file: 'FileUploadField',
};
