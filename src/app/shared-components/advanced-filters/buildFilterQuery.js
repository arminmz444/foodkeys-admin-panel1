import { getOperationArity, getOperationMeta } from './filterOperations';

/**
 * A single advanced-filter row held in component state.
 * @typedef {Object} AdvancedFilterRow
 * @property {string} field       - field key (matches a config entry)
 * @property {string} operation   - operation key (see filterOperations)
 * @property {*}      value        - single value (arity 1)
 * @property {*}      valueFrom    - first value (arity 2 -> BETWEEN)
 * @property {*}      valueTo      - second value (arity 2 -> BETWEEN)
 * @property {Array}  values       - list of values (arity 'multi' -> IN / NOT_IN)
 */

function isEmptyValue(v) {
	return v == null || v === '' || (Array.isArray(v) && v.length === 0);
}

/**
 * Serialize a single filter row into the `field:OP[:value]` token expected by
 * the API's `filter` array. Returns `null` when the row is incomplete.
 */
export function serializeFilterRow(row, fieldConfig) {
	if (!row || !row.field || !row.operation) return null;

	const arity = getOperationArity(row.operation);
	const fieldPath = fieldConfig?.fieldPath || row.field;

	// Valueless operations (IS_EMPTY / IS_NOT_EMPTY ...)
	if (arity === 0) {
		return `${fieldPath}:${row.operation}`;
	}

	if (arity === 2) {
		if (isEmptyValue(row.valueFrom) && isEmptyValue(row.valueTo)) return null;
		return `${fieldPath}:${row.operation}:${row.valueFrom ?? ''},${row.valueTo ?? ''}`;
	}

	if (arity === 'multi') {
		const list = (row.values || []).filter((item) => !isEmptyValue(item));
		if (!list.length) return null;
		return `${fieldPath}:${row.operation}:${list.join(',')}`;
	}

	// arity === 1
	if (isEmptyValue(row.value)) return null;
	return `${fieldPath}:${row.operation}:${row.value}`;
}

/**
 * Extract the raw value(s) of a row for fields that are sent as their own named
 * query param instead of inside the `filter` array.
 */
function extractRowRawValue(row) {
	const arity = getOperationArity(row.operation);
	if (arity === 0) return true; // presence-style separate param
	if (arity === 2) return [row.valueFrom, row.valueTo];
	if (arity === 'multi') return (row.values || []).filter((v) => !isEmptyValue(v));
	return row.value;
}

/**
 * Convert an array of advanced-filter rows + the field config map into the two
 * outputs the data layer needs:
 *   - filterStrings: string[]  -> merged into the `filter` query param array
 *   - params:        object    -> spread as standalone query params
 *
 * @param {AdvancedFilterRow[]} rows
 * @param {Object} fieldConfigByKey  map of field key -> field config
 */
export function buildFilterQuery(rows = [], fieldConfigByKey = {}) {
	const filterStrings = [];
	const params = {};

	rows.forEach((row) => {
		const fieldConfig = fieldConfigByKey[row.field];
		if (!fieldConfig) return;

		// Fields flagged with a `param` name are sent as their own query param.
		if (fieldConfig.param && fieldConfig.param !== 'filter') {
			const rawValue = extractRowRawValue(row);
			if (!isEmptyValue(rawValue)) {
				params[fieldConfig.param] = rawValue;
			}
			return;
		}

		const token = serializeFilterRow(row, fieldConfig);
		if (token) filterStrings.push(token);
	});

	return { filterStrings, params };
}

/** Build a human readable chip label for an applied filter row. */
export function describeFilterRow(row, fieldConfig) {
	const opMeta = getOperationMeta(row.operation);
	const fieldLabel = fieldConfig?.label || row.field;
	const opLabel = opMeta?.label || row.operation;
	const arity = getOperationArity(row.operation);

	const resolveOptionLabel = (val) => {
		const opt = fieldConfig?.options?.find((o) => String(o.value) === String(val));
		return opt ? opt.label : val;
	};

	if (arity === 0) return `${fieldLabel}: ${opLabel}`;
	if (arity === 2) return `${fieldLabel} ${opLabel}: ${row.valueFrom ?? ''} - ${row.valueTo ?? ''}`;
	if (arity === 'multi') {
		return `${fieldLabel} ${opLabel}: ${(row.values || []).map(resolveOptionLabel).join('، ')}`;
	}
	return `${fieldLabel} ${opLabel}: ${resolveOptionLabel(row.value)}`;
}

/** Flatten a config's grouped/flat field list into a `{ key: fieldConfig }` map. */
export function buildFieldConfigMap(config) {
	const map = {};
	const collect = (fields = []) => {
		fields.forEach((f) => {
			map[f.field] = f;
		});
	};

	if (Array.isArray(config?.groups)) {
		config.groups.forEach((g) => collect(g.fields));
	}
	collect(config?.fields);
	return map;
}
