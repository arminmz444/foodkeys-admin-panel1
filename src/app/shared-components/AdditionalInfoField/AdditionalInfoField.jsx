import { useState } from 'react';
import {
	Box,
	Paper,
	Typography,
	TextField,
	IconButton,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Chip,
	Divider,
	Collapse,
	FormHelperText,
	Tooltip,
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon,
	Info as InfoIcon,
} from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';

const VALUE_TYPES = {
	STRING: 'string',
	NUMBER: 'number',
	BOOLEAN: 'boolean',
	ARRAY: 'array',
	OBJECT: 'object',
};

const VALUE_TYPE_LABELS = {
	string: 'متن',
	number: 'عدد',
	boolean: 'بولین',
	array: 'آرایه',
	object: 'شیء',
};

/**
 * AdditionalInfoField Component
 * 
 * A sophisticated dynamic key-value input component that supports:
 * - Multiple value types (string, number, boolean, array, object)
 * - Nested objects and arrays
 * - Beautiful, scalable UI
 * - Add/remove fields dynamically
 */
function AdditionalInfoField({ name = 'additionalInfo', disabled = false }) {
	const { control, setValue, watch } = useFormContext();
	const additionalInfo = watch(name) || {};

	// Convert object to array for easier manipulation
	const [fields, setFields] = useState(() => {
		return Object.entries(additionalInfo).map(([key, value], index) => ({
			id: Date.now() + index,
			key,
			value,
			type: detectType(value),
			expanded: false,
		}));
	});

	// Detect type from value
	function detectType(value) {
		if (value === null || value === undefined) return VALUE_TYPES.STRING;
		if (Array.isArray(value)) return VALUE_TYPES.ARRAY;
		if (typeof value === 'object') return VALUE_TYPES.OBJECT;
		if (typeof value === 'number') return VALUE_TYPES.NUMBER;
		if (typeof value === 'boolean') return VALUE_TYPES.BOOLEAN;
		return VALUE_TYPES.STRING;
	}

	// Sync fields back to form
	const syncToForm = (updatedFields) => {
		const obj = {};
		updatedFields.forEach((field) => {
			if (field.key && field.key.trim()) {
				obj[field.key] = field.value;
			}
		});
		setValue(name, obj, { shouldDirty: true });
	};

	// Add new field
	const addField = () => {
		const newFields = [
			...fields,
			{
				id: Date.now(),
				key: '',
				value: '',
				type: VALUE_TYPES.STRING,
				expanded: true,
			},
		];
		setFields(newFields);
	};

	// Remove field
	const removeField = (id) => {
		const newFields = fields.filter((field) => field.id !== id);
		setFields(newFields);
		syncToForm(newFields);
	};

	// Update field
	const updateField = (id, updates) => {
		const newFields = fields.map((field) =>
			field.id === id ? { ...field, ...updates } : field
		);
		setFields(newFields);
		syncToForm(newFields);
	};

	// Convert value based on type
	const convertValue = (rawValue, type) => {
		switch (type) {
			case VALUE_TYPES.NUMBER:
				const num = parseFloat(rawValue);
				return isNaN(num) ? 0 : num;
			case VALUE_TYPES.BOOLEAN:
				return rawValue === 'true' || rawValue === true;
			case VALUE_TYPES.ARRAY:
				if (Array.isArray(rawValue)) return rawValue;
				if (typeof rawValue === 'string') {
					try {
						const parsed = JSON.parse(rawValue);
						return Array.isArray(parsed) ? parsed : [rawValue];
					} catch {
						return rawValue.split(',').map((s) => s.trim());
					}
				}
				return [];
			case VALUE_TYPES.OBJECT:
				if (typeof rawValue === 'object' && !Array.isArray(rawValue))
					return rawValue;
				if (typeof rawValue === 'string') {
					try {
						const parsed = JSON.parse(rawValue);
						return typeof parsed === 'object' && !Array.isArray(parsed)
							? parsed
							: {};
					} catch {
						return {};
					}
				}
				return {};
			case VALUE_TYPES.STRING:
			default:
				return String(rawValue);
		}
	};

	// Handle type change
	const handleTypeChange = (id, newType) => {
		const field = fields.find((f) => f.id === id);
		if (!field) return;

		const convertedValue = convertValue(field.value, newType);
		updateField(id, { type: newType, value: convertedValue });
	};

	// Render value input based on type
	const renderValueInput = (field) => {
		const { id, value, type } = field;

		switch (type) {
			case VALUE_TYPES.STRING:
				return (
					<TextField
						fullWidth
						multiline
						minRows={1}
						maxRows={6}
						label="مقدار"
						value={value || ''}
						onChange={(e) => updateField(id, { value: e.target.value })}
						disabled={disabled}
						placeholder="مقدار را وارد کنید"
						variant="outlined"
					/>
				);

			case VALUE_TYPES.NUMBER:
				return (
					<TextField
						fullWidth
						type="number"
						label="مقدار"
						value={value || 0}
						onChange={(e) =>
							updateField(id, { value: parseFloat(e.target.value) || 0 })
						}
						disabled={disabled}
						placeholder="عدد را وارد کنید"
						variant="outlined"
					/>
				);

			case VALUE_TYPES.BOOLEAN:
				return (
					<FormControl fullWidth>
						<InputLabel>مقدار</InputLabel>
						<Select
							value={value ? 'true' : 'false'}
							onChange={(e) =>
								updateField(id, { value: e.target.value === 'true' })
							}
							disabled={disabled}
							label="مقدار"
						>
							<MenuItem value="true">درست (True)</MenuItem>
							<MenuItem value="false">نادرست (False)</MenuItem>
						</Select>
					</FormControl>
				);

			case VALUE_TYPES.ARRAY:
				return (
					<Box>
						<TextField
							fullWidth
							multiline
							minRows={2}
							maxRows={8}
							label="مقدار (JSON Array)"
							value={
								Array.isArray(value) ? JSON.stringify(value, null, 2) : '[]'
							}
							onChange={(e) => {
								try {
									const parsed = JSON.parse(e.target.value);
									if (Array.isArray(parsed)) {
										updateField(id, { value: parsed });
									}
								} catch {
									// Invalid JSON, don't update
								}
							}}
							disabled={disabled}
							placeholder='["مقدار 1", "مقدار 2", "مقدار 3"]'
							variant="outlined"
							helperText='فرمت JSON: ["مقدار 1", "مقدار 2"] یا با کاما جدا کنید'
						/>
						<TextField
							fullWidth
							label="افزودن سریع (با کاما جدا کنید)"
							placeholder='مثال: مقدار 1, مقدار 2, مقدار 3'
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									const items = e.target.value
										.split(',')
										.map((s) => s.trim())
										.filter((s) => s);
									if (items.length > 0) {
										updateField(id, {
											value: [...(Array.isArray(value) ? value : []), ...items],
										});
										e.target.value = '';
									}
								}
							}}
							disabled={disabled}
							variant="outlined"
							className="mt-8"
							helperText="Enter را بزنید تا آیتم‌ها اضافه شوند"
						/>
						{Array.isArray(value) && value.length > 0 && (
							<Box className="mt-8 flex flex-wrap gap-4">
								{value.map((item, idx) => (
									<Chip
										key={idx}
										label={String(item)}
										onDelete={
											disabled
												? undefined
												: () => {
														const newArray = value.filter((_, i) => i !== idx);
														updateField(id, { value: newArray });
												  }
										}
										size="small"
										color="primary"
										variant="outlined"
									/>
								))}
							</Box>
						)}
					</Box>
				);

			case VALUE_TYPES.OBJECT:
				return (
					<TextField
						fullWidth
						multiline
						minRows={3}
						maxRows={12}
						label="مقدار (JSON Object)"
						value={
							typeof value === 'object' && !Array.isArray(value)
								? JSON.stringify(value, null, 2)
								: '{}'
						}
						onChange={(e) => {
							try {
								const parsed = JSON.parse(e.target.value);
								if (typeof parsed === 'object' && !Array.isArray(parsed)) {
									updateField(id, { value: parsed });
								}
							} catch {
								// Invalid JSON, don't update
							}
						}}
						disabled={disabled}
						placeholder='{"key1": "value1", "key2": "value2"}'
						variant="outlined"
						helperText='فرمت JSON: {"کلید": "مقدار"}'
					/>
				);

			default:
				return null;
		}
	};

	return (
		<Box className="w-full">
			<Box className="flex items-center justify-between mb-16">
				<Box className="flex items-center gap-8">
					<Typography variant="h6" className="font-semibold">
						اطلاعات اضافی
					</Typography>
					<Tooltip title="فیلدهای دلخواه برای ذخیره اطلاعات اضافی به صورت کلید-مقدار">
						<InfoIcon fontSize="small" color="action" />
					</Tooltip>
				</Box>
				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={addField}
					disabled={disabled}
					size="medium"
				>
					افزودن مقدار جدید
				</Button>
			</Box>

			{fields.length === 0 ? (
				<Paper
					elevation={0}
					className="p-24 text-center"
					sx={{
						border: '2px dashed rgba(0, 0, 0, 0.12)',
						backgroundColor: 'rgba(0, 0, 0, 0.02)',
					}}
				>
					<Typography variant="body2" color="text.secondary">
						هیچ فیلد اضافی تعریف نشده است. برای افزودن فیلد جدید، دکمه "افزودن
						مقدار جدید" را کلیک کنید.
					</Typography>
				</Paper>
			) : (
				<Box className="space-y-12">
					{fields.map((field, index) => (
						<Paper
							key={field.id}
							elevation={1}
							className="p-16"
							sx={{
								border: '1px solid rgba(0, 0, 0, 0.12)',
								transition: 'all 0.2s',
								'&:hover': {
									boxShadow: 3,
								},
							}}
						>
							<Box className="flex items-start gap-12">
								{/* Field Number */}
								<Box
									className="flex items-center justify-center"
									sx={{
										minWidth: 32,
										height: 32,
										borderRadius: '50%',
										backgroundColor: 'primary.main',
										color: 'white',
										fontWeight: 'bold',
										fontSize: '0.875rem',
									}}
								>
									{index + 1}
								</Box>

								{/* Main Content */}
								<Box className="flex-1">
									{/* Key and Type Row */}
									<Box className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
										<TextField
											fullWidth
											label="کلید"
											value={field.key || ''}
											onChange={(e) => updateField(field.id, { key: e.target.value })}
											disabled={disabled}
											placeholder="نام کلید (به انگلیسی)"
											variant="outlined"
											required
											helperText="کلید باید یکتا باشد"
										/>

										<FormControl fullWidth>
											<InputLabel>نوع مقدار</InputLabel>
											<Select
												value={field.type}
												onChange={(e) => handleTypeChange(field.id, e.target.value)}
												disabled={disabled}
												label="نوع مقدار"
											>
												{Object.entries(VALUE_TYPE_LABELS).map(([type, label]) => (
													<MenuItem key={type} value={type}>
														{label}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Box>

									{/* Value Row */}
									<Box className="mb-8">{renderValueInput(field)}</Box>

									{/* Preview for complex types */}
									{(field.type === VALUE_TYPES.ARRAY ||
										field.type === VALUE_TYPES.OBJECT) && (
										<Box className="mt-8">
											<Button
												size="small"
												onClick={() =>
													updateField(field.id, { expanded: !field.expanded })
												}
												endIcon={
													field.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
												}
											>
												{field.expanded ? 'پنهان کردن پیش‌نمایش' : 'نمایش پیش‌نمایش'}
											</Button>
											<Collapse in={field.expanded}>
												<Paper
													variant="outlined"
													className="mt-8 p-12"
													sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
												>
													<Typography
														variant="caption"
														color="text.secondary"
														className="block mb-4"
													>
														پیش‌نمایش JSON:
													</Typography>
													<pre
														style={{
															margin: 0,
															fontSize: '0.75rem',
															overflow: 'auto',
															maxHeight: '200px',
														}}
													>
														{JSON.stringify(field.value, null, 2)}
													</pre>
												</Paper>
											</Collapse>
										</Box>
									)}
								</Box>

								{/* Delete Button */}
								<Tooltip title="حذف فیلد">
									<IconButton
										color="error"
										onClick={() => removeField(field.id)}
										disabled={disabled}
										size="small"
									>
										<DeleteIcon />
									</IconButton>
								</Tooltip>
							</Box>

							{index < fields.length - 1 && <Divider className="mt-12" />}
						</Paper>
					))}
				</Box>
			)}

			{/* Summary */}
			{fields.length > 0 && (
				<Paper
					elevation={0}
					className="mt-16 p-12"
					sx={{
						backgroundColor: 'rgba(25, 118, 210, 0.08)',
						border: '1px solid rgba(25, 118, 210, 0.2)',
					}}
				>
					<Typography variant="caption" color="primary">
						تعداد کل فیلدها: {fields.length} | فیلدهای معتبر:{' '}
						{fields.filter((f) => f.key && f.key.trim()).length}
					</Typography>
				</Paper>
			)}
		</Box>
	);
}

export default AdditionalInfoField;
