/**
 * Central registry of every filter operation supported by the advanced filter
 * system. The operation keys mirror the backend `FilterOperation` enum and the
 * operations that `GenericCrudTable` / material-react-table (MRT) can produce.
 *
 * Each operation declares:
 *  - key:        the token sent to the API (right after the field, e.g. `id:EQUALS:1`)
 *  - label:      Persian label shown in the operation <Select>
 *  - arity:      how many value inputs the operation needs
 *                  0     -> no value (IS_EMPTY / IS_NOT_EMPTY ...)
 *                  1     -> a single value (EQUALS, CONTAINS ...)
 *                  2     -> two values (BETWEEN -> from / to)
 *                  'multi' -> a list of values (IN / NOT_IN)
 *  - mrtFilterFn (optional): the equivalent MRT column filter fn name, used when
 *                mapping a column filter mode to an operation.
 */

export const FILTER_OPERATIONS = {
	EQUALS: { key: 'EQUALS', label: 'برابر با', arity: 1, mrtFilterFn: 'equals' },
	NOT_EQUALS: { key: 'NOT_EQUALS', label: 'نامساوی با', arity: 1, mrtFilterFn: 'notEquals' },
	CONTAINS: { key: 'CONTAINS', label: 'شامل', arity: 1, mrtFilterFn: 'contains' },
	NOT_CONTAINS: { key: 'NOT_CONTAINS', label: 'شامل نباشد', arity: 1 },
	STARTS_WITH: { key: 'STARTS_WITH', label: 'شروع با', arity: 1, mrtFilterFn: 'startsWith' },
	ENDS_WITH: { key: 'ENDS_WITH', label: 'پایان با', arity: 1, mrtFilterFn: 'endsWith' },
	LIKE: { key: 'LIKE', label: 'مشابه (%)', arity: 1 },
	IS_EMPTY: { key: 'IS_EMPTY', label: 'خالی باشد', arity: 0, mrtFilterFn: 'empty' },
	IS_NOT_EMPTY: { key: 'IS_NOT_EMPTY', label: 'خالی نباشد', arity: 0, mrtFilterFn: 'notEmpty' },
	GREATER_THAN: { key: 'GREATER_THAN', label: 'بزرگ‌تر از', arity: 1, mrtFilterFn: 'greaterThan' },
	GREATER_THAN_OR_EQUAL: {
		key: 'GREATER_THAN_OR_EQUAL',
		label: 'بزرگ‌تر یا مساوی',
		arity: 1,
		mrtFilterFn: 'greaterThanOrEqualTo',
	},
	LESS_THAN: { key: 'LESS_THAN', label: 'کوچک‌تر از', arity: 1, mrtFilterFn: 'lessThan' },
	LESS_THAN_OR_EQUAL: {
		key: 'LESS_THAN_OR_EQUAL',
		label: 'کوچک‌تر یا مساوی',
		arity: 1,
		mrtFilterFn: 'lessThanOrEqualTo',
	},
	BETWEEN: { key: 'BETWEEN', label: 'بین دو مقدار', arity: 2, mrtFilterFn: 'between' },
	IN: { key: 'IN', label: 'یکی از', arity: 'multi', mrtFilterFn: 'arrIncludesSome' },
	NOT_IN: { key: 'NOT_IN', label: 'هیچ‌کدام از', arity: 'multi' },
};

/** Operations that require no value input. */
export const VALUELESS_OPERATIONS = Object.values(FILTER_OPERATIONS)
	.filter((op) => op.arity === 0)
	.map((op) => op.key);

/** Convenience: sensible default operation set per field data-type. */
export const DEFAULT_OPERATIONS_BY_TYPE = {
	text: [
		'CONTAINS',
		'EQUALS',
		'NOT_EQUALS',
		'STARTS_WITH',
		'ENDS_WITH',
		'IS_EMPTY',
		'IS_NOT_EMPTY',
	],
	number: [
		'EQUALS',
		'NOT_EQUALS',
		'GREATER_THAN',
		'GREATER_THAN_OR_EQUAL',
		'LESS_THAN',
		'LESS_THAN_OR_EQUAL',
		'BETWEEN',
		'IN',
		'IS_EMPTY',
		'IS_NOT_EMPTY',
	],
	date: [
		'EQUALS',
		'GREATER_THAN',
		'LESS_THAN',
		'GREATER_THAN_OR_EQUAL',
		'LESS_THAN_OR_EQUAL',
		'BETWEEN',
		'IS_EMPTY',
		'IS_NOT_EMPTY',
	],
	datetime: [
		'EQUALS',
		'GREATER_THAN',
		'LESS_THAN',
		'GREATER_THAN_OR_EQUAL',
		'LESS_THAN_OR_EQUAL',
		'BETWEEN',
		'IS_EMPTY',
		'IS_NOT_EMPTY',
	],
	select: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'IS_EMPTY', 'IS_NOT_EMPTY'],
	boolean: ['EQUALS', 'IS_EMPTY', 'IS_NOT_EMPTY'],
	/**
	 * `presence` is a synthetic type used for relations / gallery sections where
	 * the only meaningful question is "does the collection have any items?".
	 */
	presence: ['IS_EMPTY', 'IS_NOT_EMPTY'],
};

export function getOperationMeta(operationKey) {
	return FILTER_OPERATIONS[operationKey] || null;
}

export function getOperationArity(operationKey) {
	return FILTER_OPERATIONS[operationKey]?.arity ?? 1;
}

export function isValuelessOperation(operationKey) {
	return getOperationArity(operationKey) === 0;
}
