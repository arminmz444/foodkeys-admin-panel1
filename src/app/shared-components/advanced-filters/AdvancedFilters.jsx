import { useEffect, useMemo, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import {
	Box,
	Button,
	Checkbox,
	Chip,
	Divider,
	FormControlLabel,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FILTER_OPERATIONS, DEFAULT_OPERATIONS_BY_TYPE, getOperationArity } from './filterOperations';

/**
 * Normalize a config (which may use `groups` and/or a flat `fields` array) into
 * an ordered list of `{ title, fields }` sections.
 */
function normalizeGroups(config) {
	const groups = [];
	if (Array.isArray(config?.groups)) {
		config.groups.forEach((g) => groups.push({ title: g.title || '', fields: g.fields || [] }));
	}
	if (Array.isArray(config?.fields) && config.fields.length) {
		groups.push({ title: config.ungroupedTitle || 'سایر', fields: config.fields });
	}
	return groups;
}

/** Resolve the operations list for a field, defaulting from its type. */
function resolveOperations(field) {
	if (Array.isArray(field.operations) && field.operations.length) return field.operations;
	return DEFAULT_OPERATIONS_BY_TYPE[field.type] || DEFAULT_OPERATIONS_BY_TYPE.text;
}

/** Build the initial editable state (one entry per configured field). */
function buildInitialState(groups, appliedRows) {
	const appliedByField = {};
	(appliedRows || []).forEach((r) => {
		appliedByField[r.field] = r;
	});

	const state = {};
	groups.forEach((group) => {
		group.fields.forEach((field) => {
			const applied = appliedByField[field.field];
			const ops = resolveOperations(field);
			state[field.field] = {
				field: field.field,
				enabled: Boolean(applied),
				operation: applied?.operation || field.defaultOperation || ops[0],
				value: applied?.value ?? '',
				valueFrom: applied?.valueFrom ?? '',
				valueTo: applied?.valueTo ?? '',
				values: applied?.values ?? [],
			};
		});
	});
	return state;
}

const INPUT_TYPE_BY_FIELD_TYPE = {
	number: 'number',
	date: 'date',
	datetime: 'datetime-local',
	text: 'text',
};

function SingleValueInput({ field, operationOverride, value, onChange, label }) {
	const inputCfg = operationOverride || {};
	const effectiveType = inputCfg.type || field.type;

	if (effectiveType === 'select' || field.type === 'boolean') {
		const options =
			field.type === 'boolean'
				? [
						{ value: 'true', label: 'بله' },
						{ value: 'false', label: 'خیر' },
				  ]
				: inputCfg.options || field.options || [];
		return (
			<TextField
				select
				size="small"
				fullWidth
				label={label || field.valueLabel || 'مقدار'}
				value={value ?? ''}
				onChange={(e) => onChange(e.target.value)}
			>
				<MenuItem value="">-- انتخاب کنید --</MenuItem>
				{options.map((opt) => (
					<MenuItem key={String(opt.value)} value={String(opt.value)}>
						{opt.label}
					</MenuItem>
				))}
			</TextField>
		);
	}

	return (
		<TextField
			size="small"
			fullWidth
			type={INPUT_TYPE_BY_FIELD_TYPE[effectiveType] || 'text'}
			label={label || inputCfg.label || field.valueLabel || 'مقدار'}
			placeholder={inputCfg.placeholder || field.placeholder || ''}
			value={value ?? ''}
			InputLabelProps={
				effectiveType === 'date' || effectiveType === 'datetime' ? { shrink: true } : undefined
			}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}

function MultiValueInput({ field, values, onChange }) {
	const options = field.options || [];
	if (options.length) {
		return (
			<TextField
				select
				size="small"
				fullWidth
				label={field.valueLabel || 'مقادیر'}
				SelectProps={{ multiple: true }}
				value={Array.isArray(values) ? values.map(String) : []}
				onChange={(e) =>
					onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
				}
			>
				{options.map((opt) => (
					<MenuItem key={String(opt.value)} value={String(opt.value)}>
						{opt.label}
					</MenuItem>
				))}
			</TextField>
		);
	}
	// free text -> comma separated list
	return (
		<TextField
			size="small"
			fullWidth
			label={`${field.valueLabel || 'مقادیر'} (با کاما جدا کنید)`}
			value={Array.isArray(values) ? values.join(',') : ''}
			onChange={(e) => onChange(e.target.value.split(',').map((v) => v.trim()))}
		/>
	);
}

function FilterFieldRow({ field, state, onChange }) {
	const operations = resolveOperations(field);
	const arity = getOperationArity(state.operation);
	const inputsByOperation = field.inputsByOperation?.[state.operation];

	const patch = (partial) => onChange({ ...state, ...partial });

	return (
		<Box className="rounded-8 border border-gray-200 p-8">
			<Stack direction="row" alignItems="center" spacing={1} className="mb-4">
				<Checkbox
					size="small"
					checked={state.enabled}
					onChange={(e) => patch({ enabled: e.target.checked })}
				/>
				<Typography className="flex-1 font-medium" variant="body2">
					{field.label}
				</Typography>
				<TextField
					select
					size="small"
					disabled={!state.enabled}
					value={state.operation}
					onChange={(e) => patch({ operation: e.target.value })}
					sx={{ minWidth: 150 }}
				>
					{operations.map((opKey) => (
						<MenuItem key={opKey} value={opKey}>
							{FILTER_OPERATIONS[opKey]?.label || opKey}
						</MenuItem>
					))}
				</TextField>
			</Stack>

			{state.enabled && arity !== 0 && (
				<Box className="ps-32">
					{arity === 1 && (
						<SingleValueInput
							field={field}
							value={state.value}
							onChange={(v) => patch({ value: v })}
						/>
					)}
					{arity === 2 && (
						<Stack direction="row" spacing={1}>
							<SingleValueInput
								field={field}
								operationOverride={inputsByOperation?.[0]}
								label={inputsByOperation?.[0]?.label || 'از'}
								value={state.valueFrom}
								onChange={(v) => patch({ valueFrom: v })}
							/>
							<SingleValueInput
								field={field}
								operationOverride={inputsByOperation?.[1]}
								label={inputsByOperation?.[1]?.label || 'تا'}
								value={state.valueTo}
								onChange={(v) => patch({ valueTo: v })}
							/>
						</Stack>
					)}
					{arity === 'multi' && (
						<MultiValueInput field={field} values={state.values} onChange={(v) => patch({ values: v })} />
					)}
				</Box>
			)}
		</Box>
	);
}

/**
 * Generic, JSON-config-driven advanced filter surface.
 *
 * @param {Object}   config           filter configuration (title, groups/fields)
 * @param {boolean}  open             controls visibility
 * @param {Function} onClose          called when the surface should close
 * @param {Array}    value            currently applied filter rows (enabled only)
 * @param {Function} onApply          (rows) => void, called with enabled rows
 * @param {'drawer'|'dialog'} variant presentation mode (default 'drawer')
 */
function AdvancedFilters({ config, open, onClose, value = [], onApply, variant = 'drawer' }) {
	const groups = useMemo(() => normalizeGroups(config), [config]);
	const [state, setState] = useState(() => buildInitialState(groups, value));

	// Re-hydrate whenever the surface is (re)opened or applied filters change.
	useEffect(() => {
		if (open) setState(buildInitialState(groups, value));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, groups]);

	const enabledCount = useMemo(
		() => Object.values(state).filter((s) => s.enabled).length,
		[state]
	);

	const handleFieldChange = (fieldKey, next) => {
		setState((prev) => ({ ...prev, [fieldKey]: next }));
	};

	const collectEnabledRows = () =>
		Object.values(state)
			.filter((s) => s.enabled)
			.map((s) => ({
				field: s.field,
				operation: s.operation,
				value: s.value,
				valueFrom: s.valueFrom,
				valueTo: s.valueTo,
				values: s.values,
			}));

	const handleApply = () => {
		onApply?.(collectEnabledRows());
		onClose?.();
	};

	const handleClear = () => {
		setState(buildInitialState(groups, []));
	};

	const body = (
		<Box className="flex flex-col h-full" sx={{ width: variant === 'drawer' ? 460 : '100%' }}>
			<Box className="flex items-center justify-between p-16 border-b">
				<Stack direction="row" alignItems="center" spacing={1}>
					<FuseSvgIcon>heroicons-outline:adjustments</FuseSvgIcon>
					<Typography variant="h6">{config?.title || 'فیلترهای پیشرفته'}</Typography>
					{enabledCount > 0 && <Chip size="small" color="secondary" label={enabledCount} />}
				</Stack>
				<IconButton onClick={onClose}>
					<FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
				</IconButton>
			</Box>

			<Box className="flex-1 overflow-auto p-16 space-y-8">
				{groups.map((group, gi) => (
					<Accordion key={group.title + gi} defaultExpanded={gi === 0} disableGutters>
						<AccordionSummary
							expandIcon={<FuseSvgIcon>heroicons-outline:chevron-down</FuseSvgIcon>}
						>
							<Typography className="font-semibold">{group.title}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Stack spacing={1.5}>
								{group.fields.map((field) => (
									<FilterFieldRow
										key={field.field}
										field={field}
										state={
											state[field.field] || {
												field: field.field,
												enabled: false,
												operation:
													field.defaultOperation || resolveOperations(field)[0],
												value: '',
												valueFrom: '',
												valueTo: '',
												values: [],
											}
										}
										onChange={(next) => handleFieldChange(field.field, next)}
									/>
								))}
							</Stack>
						</AccordionDetails>
					</Accordion>
				))}
			</Box>

			<Divider />
			<Box className="flex items-center justify-between p-16">
				<Button color="inherit" onClick={handleClear} startIcon={<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>}>
					پاک کردن همه
				</Button>
				<Stack direction="row" spacing={1}>
					<Button variant="outlined" color="secondary" onClick={onClose}>
						انصراف
					</Button>
					<Button variant="contained" color="primary" onClick={handleApply}>
						اعمال فیلترها
					</Button>
				</Stack>
			</Box>
		</Box>
	);

	if (variant === 'dialog') {
		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="md" dir="rtl">
				<DialogContent sx={{ p: 0 }}>{body}</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer anchor="right" open={open} onClose={onClose} dir="rtl">
			{body}
		</Drawer>
	);
}

export default AdvancedFilters;
