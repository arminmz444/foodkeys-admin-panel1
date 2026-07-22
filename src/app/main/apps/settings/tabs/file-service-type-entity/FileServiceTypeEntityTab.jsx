import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "@lodash";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import {
	useCreateFileServiceTypeMutation,
	useDeleteFileServiceTypeMutation,
	useGetFileServiceTypesQuery,
	useUpdateFileServiceTypeMutation
} from "./store/fileServiceTypeEntityApi";

const MEDIA_CATEGORIES = [
	{ value: "IMAGE", label: "تصویر (IMAGE)" },
	{ value: "GIF", label: "گیف (GIF)" },
	{ value: "VIDEO", label: "ویدیو (VIDEO)" },
	{ value: "AUDIO", label: "صوت (AUDIO)" },
	{ value: "DOCUMENT", label: "سند (DOCUMENT)" },
	{ value: "ARCHIVE", label: "آرشیو (ARCHIVE)" },
	{ value: 'OTHER', label: 'سایر (OTHER)' }
];

const MEDIA_CATEGORY_COLORS = {
	IMAGE: "primary",
	GIF: "secondary",
	VIDEO: "error",
	AUDIO: "warning",
	DOCUMENT: "info",
	ARCHIVE: "default",
	OTHER: 'default'
};

const standardFileTypes = [
	{ label: "PDF", value: "pdf" },
	{ label: "Word", value: "doc,docx" },
	{ label: "Excel", value: "xls,xlsx" },
	{ label: "PowerPoint", value: "ppt,pptx" },
	{ label: "Text", value: "txt" },
	{ label: "CSV", value: "csv" },
	{ label: "JPEG", value: "jpg,jpeg" },
	{ label: "PNG", value: "png" },
	{ label: "GIF", value: "gif" },
	{ label: "SVG", value: "svg" },
	{ label: "WEBP", value: "webp" },
	{ label: "MP3", value: "mp3" },
	{ label: "WAV", value: "wav" },
	{ label: "MP4", value: "mp4" },
	{ label: "AVI", value: "avi" },
	{ label: "MOV", value: "mov" },
	{ label: "WEBM", value: "webm" },
	{ label: "ZIP", value: "zip" },
	{ label: "RAR", value: "rar" },
	{ label: "JSON", value: "json" },
	{ label: 'XML', value: 'xml' }
];

const COMMON_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/svg+xml',
	'video/mp4',
	'video/quicktime',
	'video/webm',
	'audio/mpeg',
	'audio/wav',
	'audio/ogg',
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/zip'
];

const VIDEO_CODECS = ["h264", "hevc", "vp9", "av1", "vp8"];
const AUDIO_CODECS = ["aac", "mp3", "opus", "vorbis", "flac"];
const CONTAINERS = ["mp4", "mov", "webm", "matroska", "avi", "gif", "webp"];
const COLOR_MODES = ["RGB", "GRAYSCALE", "CMYK"];

const optionalNumber = z
	.union([z.number(), z.string(), z.null(), z.undefined()])
	.optional()
	.transform((val) => {
		if (val === "" || val === null || val === undefined) return undefined;

		const num = typeof val === "number" ? val : Number(val);
		return Number.isFinite(num) ? num : undefined;
	});

const optionalBoolean = z.boolean().nullable().optional();

const schema = z.object({
	name: z.string().min(1, "نام الزامی می‌باشد."),
	displayName: z.string().min(1, "نام نمایشی الزامی می‌باشد."),
	description: z.string().optional(),
	mediaCategory: z.string().optional(),
	maxSize: optionalNumber,
	minSize: optionalNumber,
	entityClass: z.string().optional(),
	fileEntityChildren: z.string().optional(),
	entityMappings: z.string().optional(),
	jsonSchema: z.string().optional(),
	zodSchema: z.string().optional(),
	validExtensions: z.string().optional(),
	validMimeTypes: z.string().optional(),
	selectedFileTypes: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
	selectedMimeTypes: z.array(z.string()).optional(),
	maxFiles: optionalNumber,
	scanWithAntivirus: optionalBoolean,
	generateThumbnail: optionalBoolean,
	minWidth: optionalNumber,
	maxWidth: optionalNumber,
	minHeight: optionalNumber,
	maxHeight: optionalNumber,
	minDurationSeconds: optionalNumber,
	maxDurationSeconds: optionalNumber,
	validationConfig: z.object({
		guide: z.string().optional(),
		allowedMimeTypes: z.array(z.string()).optional(),
		allowedContainers: z.array(z.string()).optional(),
		allowedResolutions: z.array(z.object({ width: optionalNumber, height: optionalNumber })).optional(),
		allowedAspectRatios: z
			.array(
				z.object({
					width: optionalNumber,
					height: optionalNumber,
					label: z.string().optional()
				})
			)
			.optional(),
		aspectRatioMatchMode: z.enum(["EXACT", "TOLERANCE"]).optional().nullable(),
		aspectRatioTolerance: optionalNumber,
		allowedColorModes: z.array(z.string()).optional(),
		allowAlpha: optionalBoolean,
		allowAnimated: optionalBoolean,
		maxPixels: optionalNumber,
		metadataPolicy: z.enum(['STRIP', 'PRESERVE', 'SELECTIVE']).optional().nullable(),
		preserveIccProfile: optionalBoolean,
		requireVideoStream: optionalBoolean,
		allowedVideoCodecs: z.array(z.string()).optional(),
		allowedAudioCodecs: z.array(z.string()).optional(),
		requireAudio: optionalBoolean,
		minFrameRate: optionalNumber,
		maxFrameRate: optionalNumber,
		minBitrate: optionalNumber,
		maxBitrate: optionalNumber,
		minAudioSampleRate: optionalNumber,
		maxAudioSampleRate: optionalNumber,
		maxAudioChannels: optionalNumber,
		allowHdr: optionalBoolean,
		rejectExtraStreams: optionalBoolean,
		requireProgressive: optionalBoolean,
		autoNormalizeOrientation: optionalBoolean,
		autoAdjust: optionalBoolean,
		thumbnailWidth: optionalNumber,
		thumbnailHeight: optionalNumber,
		thumbnailTimeSeconds: optionalNumber,
		maxParseSeconds: optionalNumber,
		enforceContentTypeMatchesExtension: optionalBoolean,
		computeContentHash: optionalBoolean,
		duplicatePolicy: z.enum(['ALLOW', 'REJECT', 'REPLACE']).optional().nullable()
	})
});

const emptyValidationConfig = {
	guide: "",
	allowedMimeTypes: [],
	allowedContainers: [],
	allowedResolutions: [],
	allowedAspectRatios: [],
	aspectRatioMatchMode: "TOLERANCE",
	aspectRatioTolerance: 0.02,
	allowedColorModes: [],
	allowAlpha: undefined,
	allowAnimated: undefined,
	maxPixels: undefined,
	metadataPolicy: "STRIP",
	preserveIccProfile: undefined,
	requireVideoStream: undefined,
	allowedVideoCodecs: [],
	allowedAudioCodecs: [],
	requireAudio: undefined,
	minFrameRate: undefined,
	maxFrameRate: undefined,
	minBitrate: undefined,
	maxBitrate: undefined,
	minAudioSampleRate: undefined,
	maxAudioSampleRate: undefined,
	maxAudioChannels: undefined,
	allowHdr: undefined,
	rejectExtraStreams: undefined,
	requireProgressive: undefined,
	autoNormalizeOrientation: undefined,
	autoAdjust: undefined,
	thumbnailWidth: undefined,
	thumbnailHeight: undefined,
	thumbnailTimeSeconds: undefined,
	maxParseSeconds: undefined,
	enforceContentTypeMatchesExtension: true,
	computeContentHash: true,
	duplicatePolicy: 'ALLOW'
};

const defaultValues = {
	name: "",
	displayName: "",
	description: "",
	mediaCategory: "OTHER",
	maxSize: 2097152,
	minSize: "",
	entityClass: "",
	fileEntityChildren: "",
	entityMappings: "",
	jsonSchema: "",
	zodSchema: "",
	validExtensions: "",
	validMimeTypes: "",
	selectedFileTypes: [],
	selectedMimeTypes: [],
	maxFiles: 1,
	scanWithAntivirus: true,
	generateThumbnail: false,
	minWidth: "",
	maxWidth: "",
	minHeight: "",
	maxHeight: "",
	minDurationSeconds: "",
	maxDurationSeconds: "",
	validationConfig: { ...emptyValidationConfig }
};

function formatBytes(bytes) {
	if (bytes == null || bytes === "" || Number.isNaN(Number(bytes))) return "—";

	const value = Number(bytes);

	if (value < 1024) return `${value} B`;

	if (value < 1024 * 1024) return `${(value / 1024).toFixed(value % 1024 === 0 ? 0 : 1)} KB`;

	return `${(value / (1024 * 1024)).toFixed(value % (1024 * 1024) === 0 ? 0 : 1)} MB`;
}

function parseValidationConfig(raw) {
	if (!raw) return { ...emptyValidationConfig };

	try {
		const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
		return {
			...emptyValidationConfig,
			...parsed,
			allowedMimeTypes: parsed.allowedMimeTypes || [],
			allowedContainers: parsed.allowedContainers || [],
			allowedResolutions: parsed.allowedResolutions || [],
			allowedAspectRatios: parsed.allowedAspectRatios || [],
			allowedColorModes: parsed.allowedColorModes || [],
			allowedVideoCodecs: parsed.allowedVideoCodecs || [],
			allowedAudioCodecs: parsed.allowedAudioCodecs || []
		};
	} catch {
		return { ...emptyValidationConfig };
	}
}

function cleanValue(value) {
	if (value === "" || value === undefined) return undefined;

	if (Array.isArray(value)) {
		const cleaned = value
			.map(cleanValue)
			.filter(
				(item) =>
					item !== undefined && !(typeof item === 'object' && item !== null && Object.keys(item).length === 0)
			);
		return cleaned.length ? cleaned : undefined;
	}

	if (value && typeof value === "object") {
		const cleaned = {};
		Object.entries(value).forEach(([key, val]) => {
			const next = cleanValue(val);

			if (next !== undefined) cleaned[key] = next;
		});
		return Object.keys(cleaned).length ? cleaned : undefined;
	}

	return value;
}

function serializeValidationConfig(config) {
	const cleaned = cleanValue(config);

	if (!cleaned) return undefined;

	return JSON.stringify(cleaned);
}

function extensionsToSelectedFileTypes(validExtensions = "") {
	const extensions = validExtensions
		.split(",")
		.map((ext) => ext.trim())
		.filter(Boolean);

	if (!extensions.length) return [];

	const selected = [];
	standardFileTypes.forEach((fileType) => {
		const fileTypeExtensions = fileType.value.split(",");

		if (fileTypeExtensions.some((ext) => extensions.includes(ext))) {
			selected.push(fileType);
		}
	});

	const standardExtensions = standardFileTypes.flatMap((fileType) => fileType.value.split(','));
	const customExtensions = extensions.filter((ext) => !standardExtensions.includes(ext));

	if (customExtensions.length) {
		selected.push({
			label: `سفارشی (${customExtensions.join(",")})`,
			value: customExtensions.join(',')
		});
	}

	return selected;
}

function selectedFileTypesToExtensions(selectedFileTypes = []) {
	return selectedFileTypes
		.flatMap((fileType) => fileType.value.split(","))
		.map((ext) => ext.trim())
		.filter(Boolean)
		.filter((value, index, self) => self.indexOf(value) === index)
		.join(",");
}

function UnitAdornment({ unit }) {
	return (
		<InputAdornment position="end">
			<Typography
				variant="caption"
				color="text.secondary"
				className="whitespace-nowrap"
			>
				{unit}
			</Typography>
		</InputAdornment>
	);
}

function SectionTitle({ children, hint }) {
	return (
		<div className="mb-16">
			<Typography className="text-base font-semibold">{children}</Typography>
			{hint && (
				<Typography
					variant="caption"
					color="text.secondary"
					className="block mt-4"
				>
					{hint}
				</Typography>
			)}
		</div>
	);
}

function ChipArrayField({ label, value = [], onChange, options = [], freeSolo = true, helperText }) {
	return (
		<Autocomplete
			multiple
			freeSolo={freeSolo}
			options={options}
			value={value}
			onChange={(_, next) => onChange(next)}
			renderTags={(tagValue, getTagProps) =>
				tagValue.map((option, index) => (
					<Chip
						size="small"
						label={option}
						{...getTagProps({ index })}
						key={`${option}-${index}`}
					/>
				))
			}
			renderInput={(params) => (
				<TextField
					{...params}
					label={label}
					helperText={helperText}
					variant="outlined"
					fullWidth
				/>
			)}
		/>
	);
}

function NumberField({ field, label, unit, error, helperText, ...rest }) {
	return (
		<TextField
			{...field}
			value={field.value ?? ""}
			onChange={(e) => field.onChange(e.target.value === '' ? '' : e.target.value)}
			label={label}
			type="number"
			error={!!error}
			helperText={error?.message || helperText}
			variant="outlined"
			fullWidth
			InputProps={{
				endAdornment: unit ? <UnitAdornment unit={unit} /> : undefined
			}}
			{...rest}
		/>
	);
}

function TriStateSwitch({ label, value, onChange, helperText }) {
	const checked = value === true;
	return (
		<div>
			<FormControlLabel
				className="m-0"
				labelPlacement="start"
				label={label}
				control={
					<Switch
						checked={checked}
						onChange={(e) => onChange(e.target.checked)}
						onContextMenu={(e) => {
							e.preventDefault();
							onChange(undefined);
						}}
					/>
				}
			/>
			{helperText && <FormHelperText>{helperText}</FormHelperText>}
		</div>
	);
}

function ResolutionListEditor({ value = [], onChange }) {
	const addRow = () => onChange([...(value || []), { width: "", height: "" }]);
	const updateRow = (index, key, nextValue) => {
		const next = [...value];
		next[index] = { ...next[index], [key]: nextValue };
		onChange(next);
	};
	const removeRow = (index) => onChange(value.filter((_, i) => i !== index));

	return (
		<div className="space-y-12">
			<div className="flex items-center justify-between gap-12">
				<Typography className="font-medium">رزولوشن‌های مجاز (دقیق)</Typography>
				<Button
					size="small"
					startIcon={<Add />}
					onClick={addRow}
				>
					افزودن
				</Button>
			</div>
			{(value || []).map((row, index) => (
				<div
					key={index}
					className="flex items-center gap-8"
				>
					<TextField
						size="small"
						type="number"
						label="عرض"
						value={row.width ?? ""}
						onChange={(e) => updateRow(index, "width", e.target.value)}
						InputProps={{ endAdornment: <UnitAdornment unit="px" /> }}
					/>
					<Typography>×</Typography>
					<TextField
						size="small"
						type="number"
						label="ارتفاع"
						value={row.height ?? ""}
						onChange={(e) => updateRow(index, "height", e.target.value)}
						InputProps={{ endAdornment: <UnitAdornment unit="px" /> }}
					/>
					<IconButton
						color="error"
						size="small"
						onClick={() => removeRow(index)}
					>
						<Delete fontSize="small" />
					</IconButton>
				</div>
			))}
			{!value?.length && (
				<Typography
					variant="caption"
					color="text.secondary"
				>
					خالی = بدون محدودیت لیست (حداقل/حداکثر ابعاد همچنان اعمال می‌شود)
				</Typography>
			)}
		</div>
	);
}

function AspectRatioListEditor({ value = [], onChange }) {
	const addRow = () => onChange([...(value || []), { width: "", height: "", label: "" }]);
	const updateRow = (index, key, nextValue) => {
		const next = [...value];
		next[index] = { ...next[index], [key]: nextValue };
		onChange(next);
	};
	const removeRow = (index) => onChange(value.filter((_, i) => i !== index));

	return (
		<div className="space-y-12">
			<div className="flex items-center justify-between gap-12">
				<Typography className="font-medium">نسبت تصویر مجاز</Typography>
				<Button
					size="small"
					startIcon={<Add />}
					onClick={addRow}
				>
					افزودن
				</Button>
			</div>
			{(value || []).map((row, index) => (
				<div
					key={index}
					className="grid grid-cols-1 sm:grid-cols-4 gap-8 items-center"
				>
					<TextField
						size="small"
						type="number"
						label="عرض نسبت"
						value={row.width ?? ""}
						onChange={(e) => updateRow(index, "width", e.target.value)}
					/>
					<TextField
						size="small"
						type="number"
						label="ارتفاع نسبت"
						value={row.height ?? ""}
						onChange={(e) => updateRow(index, "height", e.target.value)}
					/>
					<TextField
						size="small"
						label="برچسب"
						placeholder="16:9"
						value={row.label ?? ""}
						onChange={(e) => updateRow(index, "label", e.target.value)}
					/>
					<IconButton
						color="error"
						size="small"
						onClick={() => removeRow(index)}
						className="justify-self-start"
					>
						<Delete fontSize="small" />
					</IconButton>
				</div>
			))}
		</div>
	);
}

function FileServiceTypeTab() {
	const { data: fileServiceTypes = [], isLoading } = useGetFileServiceTypesQuery();
	const [createFileServiceType] = useCreateFileServiceTypeMutation();
	const [updateFileServiceType] = useUpdateFileServiceTypeMutation();
	const [deleteFileServiceType] = useDeleteFileServiceTypeMutation();

	const [openDialog, setOpenDialog] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [selectedType, setSelectedType] = useState(null);
	const [dialogTab, setDialogTab] = useState(0);
	const [search, setSearch] = useState('');
	const [deleteTarget, setDeleteTarget] = useState(null);

	const { control, reset, handleSubmit, formState } = useForm({
		defaultValues,
		mode: "onChange",
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;
	const mediaCategory = useWatch({ control, name: "mediaCategory" });

	const isImageLike = mediaCategory === "IMAGE" || mediaCategory === "GIF";
	const isVideo = mediaCategory === "VIDEO";
	const isAudio = mediaCategory === "AUDIO";
	const isAvMedia = isImageLike || isVideo;
	const isTimedMedia = isVideo || isAudio;

	const filteredTypes = useMemo(() => {
		const query = search.trim().toLowerCase();

		if (!query) return fileServiceTypes;

		return fileServiceTypes.filter((type) => {
			const haystack = [type.name, type.displayName, type.description, type.mediaCategory, type.validExtensions]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return haystack.includes(query);
		});
	}, [fileServiceTypes, search]);

	useEffect(() => {
		if (!selectedType) {
			reset(defaultValues);
			return;
		}

		const validExtensions = selectedType.validExtensions || "";
		const mimeList = (selectedType.validMimeTypes || "")
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);

		reset({
			...defaultValues,
			...selectedType,
			description: selectedType.description || "",
			mediaCategory: selectedType.mediaCategory || "OTHER",
			minSize: selectedType.minSize ?? "",
			maxSize: selectedType.maxSize ?? "",
			minWidth: selectedType.minWidth ?? "",
			maxWidth: selectedType.maxWidth ?? "",
			minHeight: selectedType.minHeight ?? "",
			maxHeight: selectedType.maxHeight ?? "",
			minDurationSeconds: selectedType.minDurationSeconds ?? "",
			maxDurationSeconds: selectedType.maxDurationSeconds ?? "",
			maxFiles: selectedType.maxFiles ?? "",
			entityClass: selectedType.entityClass || "",
			fileEntityChildren: selectedType.fileEntityChildren || selectedType.fileEntityChild || "",
			entityMappings: selectedType.entityMappings || "",
			jsonSchema: selectedType.jsonSchema || "",
			zodSchema: selectedType.zodSchema || "",
			scanWithAntivirus: selectedType.scanWithAntivirus ?? true,
			generateThumbnail: selectedType.generateThumbnail ?? false,
			selectedFileTypes: extensionsToSelectedFileTypes(validExtensions),
			selectedMimeTypes: mimeList,
			validationConfig: parseValidationConfig(selectedType.validationConfig)
		});
	}, [selectedType, reset]);

	const handleOpenDialog = (type = null) => {
		setDialogTab(0);

		if (type) {
			setSelectedType(type);
			setIsEdit(true);
		} else {
			setSelectedType(null);
			setIsEdit(false);
		}

		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedType(null);
		setIsEdit(false);
		setDialogTab(0);
		reset(defaultValues);
	};

	const handleDelete = (name) => {
		setDeleteTarget(name);
	};

	const confirmDelete = () => {
		if (deleteTarget) {
			deleteFileServiceType(deleteTarget);
		}
		setDeleteTarget(null);
	};

	const toOptionalNumber = (value) => {
		if (value === "" || value === null || value === undefined) return undefined;

		const num = Number(value);
		return Number.isFinite(num) ? num : undefined;
	};

	const onSubmit = (formData) => {
		const validExtensions = selectedFileTypesToExtensions(formData.selectedFileTypes);
		const validMimeTypes = (formData.selectedMimeTypes || []).join(",");
		const validationConfig = serializeValidationConfig(formData.validationConfig);

		const dataToSubmit = {
			name: formData.name,
			displayName: formData.displayName,
			description: formData.description || undefined,
			mediaCategory: formData.mediaCategory || undefined,
			validExtensions: validExtensions || undefined,
			validMimeTypes: validMimeTypes || undefined,
			minSize: toOptionalNumber(formData.minSize),
			maxSize: toOptionalNumber(formData.maxSize),
			minWidth: toOptionalNumber(formData.minWidth),
			maxWidth: toOptionalNumber(formData.maxWidth),
			minHeight: toOptionalNumber(formData.minHeight),
			maxHeight: toOptionalNumber(formData.maxHeight),
			minDurationSeconds: toOptionalNumber(formData.minDurationSeconds),
			maxDurationSeconds: toOptionalNumber(formData.maxDurationSeconds),
			maxFiles: toOptionalNumber(formData.maxFiles),
			scanWithAntivirus: formData.scanWithAntivirus,
			generateThumbnail: formData.generateThumbnail,
			entityClass: formData.entityClass || undefined,
			fileEntityChildren: formData.fileEntityChildren || undefined,
			entityMappings: formData.entityMappings || undefined,
			jsonSchema: formData.jsonSchema || undefined,
			zodSchema: formData.zodSchema || undefined,
			validationConfig
		};

		if (isEdit) {
			updateFileServiceType(dataToSubmit);
		} else {
			createFileServiceType(dataToSubmit);
		}

		handleCloseDialog();
	};

	return (
		<Box
			component={motion.div}
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col overflow-hidden"
			sx={{
				height: {
					xs: "calc(100dvh - 180px)",
					md: "calc(100dvh - 200px)",
					lg: 'calc(100dvh - 220px)'
				},
				minHeight: 360
			}}
		>
			{/* Sticky toolbar — never requires horizontal page scroll */}
			<Paper
				elevation={0}
				className="flex-shrink-0 mb-16 border rounded-xl"
				sx={{ bgcolor: "background.paper" }}
			>
				<div className="flex flex-col gap-12 p-16 sm:flex-row sm:items-center sm:justify-between">
					<div className="min-w-0 flex-1">
						<Typography className="text-lg font-semibold truncate">انواع فایل سرویس</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							className="mt-2"
						>
							قوانین اعتبارسنجی آپلود — {fileServiceTypes.length} مورد
						</Typography>
					</div>
					<div className="flex flex-col gap-12 w-full sm:w-auto sm:flex-row sm:items-center sm:flex-shrink-0">
						<TextField
							size="small"
							placeholder="جستجو نام، دسته، پسوند..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full sm:w-256"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<FuseSvgIcon size={18}>heroicons-outline:search</FuseSvgIcon>
									</InputAdornment>
								)
							}}
						/>
						<Button
							variant="contained"
							color="secondary"
							startIcon={<Add />}
							onClick={() => handleOpenDialog()}
							className="w-full sm:w-auto whitespace-nowrap"
						>
							افزودن نوع جدید
						</Button>
					</div>
				</div>
			</Paper>

			{/* Scrollable table only */}
			<Paper
				elevation={0}
				className="flex-1 min-h-0 flex flex-col border rounded-xl overflow-hidden"
			>
				<TableContainer className="flex-1 overflow-auto">
					<Table
						stickyHeader
						size="small"
					>
						<TableHead>
							<TableRow>
								<TableCell className="font-semibold bg-gray-50 dark:bg-gray-800">نام</TableCell>
								<TableCell className="font-semibold bg-gray-50 dark:bg-gray-800">نام نمایشی</TableCell>
								<TableCell className="font-semibold bg-gray-50 dark:bg-gray-800">دسته</TableCell>
								<TableCell className="font-semibold bg-gray-50 dark:bg-gray-800">اندازه</TableCell>
								<TableCell className="font-semibold bg-gray-50 dark:bg-gray-800">پسوندها</TableCell>
								<TableCell className="font-semibold bg-gray-50 dark:bg-gray-800">فایل‌ها</TableCell>
								<TableCell
									align="center"
									className="font-semibold bg-gray-50 dark:bg-gray-800"
									sx={{
										position: "sticky",
										right: 0,
										zIndex: 3
									}}
								>
									عملیات
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{isLoading && (
								<TableRow>
									<TableCell
										colSpan={7}
										align="center"
										className="py-64"
									>
										<div className="flex flex-col items-center gap-8">
											<FuseSvgIcon
												className="animate-spin"
												size={32}
											>
												heroicons-outline:refresh
											</FuseSvgIcon>
											<Typography color="text.secondary">در حال بارگذاری...</Typography>
										</div>
									</TableCell>
								</TableRow>
							)}
							{!isLoading && filteredTypes.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={7}
										align="center"
										className="py-64"
									>
										<div className="flex flex-col items-center gap-8">
											<FuseSvgIcon
												size={48}
												className="text-gray-400"
											>
												heroicons-outline:document
											</FuseSvgIcon>
											<Typography color="text.secondary">
												{search ? 'نتیجه‌ای یافت نشد' : "هیچ نوع فایل سرویسی تعریف نشده است"}
											</Typography>
											{!search && (
												<Button
													variant="outlined"
													color="secondary"
													size="small"
													onClick={() => handleOpenDialog()}
												>
													افزودن اولین مورد
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							)}
							{!isLoading &&
								filteredTypes.map((type) => (
									<TableRow
										key={type.name}
										hover
									>
										<TableCell>
											<Typography className="font-medium text-sm whitespace-nowrap">
												{type.name}
											</Typography>
										</TableCell>
										<TableCell>
											<div className="min-w-0 max-w-192">
												<Typography className="text-sm truncate">{type.displayName}</Typography>
												{type.description && (
													<Typography
														variant="caption"
														color="text.secondary"
														className="line-clamp-1 block"
													>
														{type.description}
													</Typography>
												)}
											</div>
										</TableCell>
										<TableCell>
											{type.mediaCategory ? (
												<Chip
													label={type.mediaCategory}
													size="small"
													color={MEDIA_CATEGORY_COLORS[type.mediaCategory] || 'default'}
													variant="outlined"
												/>
											) : (
												<Typography
													variant="caption"
													color="text.secondary"
												>
													—
												</Typography>
											)}
										</TableCell>
										<TableCell>
											<div className="whitespace-nowrap">
												<Typography
													variant="caption"
													className="block"
												>
													{type.minSize != null ? `${formatBytes(type.minSize)} – ` : ""}
													{formatBytes(type.maxSize)}
												</Typography>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-4 max-w-224">
												{type.validExtensions ? (
													<>
														{type.validExtensions
															.split(",")
															.slice(0, 3)
															.map((ext, idx) => (
																<Chip
																	key={`${type.name}-${ext}-${idx}`}
																	label={`.${ext.trim()}`}
																	size="small"
																	variant="outlined"
																/>
															))}
														{type.validExtensions.split(",").length > 3 && (
															<Chip
																label={`+${type.validExtensions.split(",").length - 3}`}
																size="small"
																variant="outlined"
															/>
														)}
													</>
												) : (
													<Typography
														variant="caption"
														color="text.secondary"
													>
														—
													</Typography>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Chip
												label={type.maxFiles ?? "—"}
												size="small"
												variant="outlined"
											/>
										</TableCell>
										<TableCell
											align="center"
											sx={{
												position: "sticky",
												right: 0,
												bgcolor: "background.paper",
												zIndex: 1
											}}
										>
											<div className="flex gap-4 justify-center">
												<Tooltip title="ویرایش">
													<IconButton
														onClick={() => handleOpenDialog(type)}
														color="primary"
														size="small"
													>
														<Edit fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="حذف (انواع داخلی قابل حذف نیستند)">
													<IconButton
														onClick={() => handleDelete(type.name)}
														color="error"
														size="small"
													>
														<Delete fontSize="small" />
													</IconButton>
												</Tooltip>
											</div>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="md"
				fullWidth
				scroll="paper"
				PaperProps={{ sx: { maxHeight: "92vh" } }}
			>
				<DialogTitle className="border-b pb-0">
					<div className="flex items-center gap-8 mb-12">
						<FuseSvgIcon
							size={24}
							color="action"
						>
							{isEdit ? 'heroicons-outline:pencil' : "heroicons-outline:plus-circle"}
						</FuseSvgIcon>
						<div>
							<Typography variant="h6">
								{isEdit ? 'ویرایش نوع فایل سرویس' : "افزودن نوع فایل سرویس جدید"}
							</Typography>
							{isEdit && selectedType?.name && (
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{selectedType.name}
								</Typography>
							)}
						</div>
					</div>
					<Tabs
						value={dialogTab}
						onChange={(_, value) => setDialogTab(value)}
						variant="scrollable"
						scrollButtons="auto"
						allowScrollButtonsMobile
					>
						<Tab label="عمومی" />
						<Tab label="محدودیت‌ها" />
						<Tab label="قوانین رسانه" />
						<Tab label="پیشرفته" />
					</Tabs>
				</DialogTitle>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col min-h-0"
				>
					<DialogContent className="pt-24">
						{/* Tab 0: General */}
						{dialogTab === 0 && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
								<Controller
									control={control}
									name="name"
									render={({ field }) => (
										<TextField
											{...field}
											label="نام (کلید یکتا)"
											placeholder="COMPANY_LOGO"
											error={!!errors.name}
											helperText={
												errors?.name?.message || "حروف بزرگ و زیرخط، مثلاً COMPANY_LOGO"
											}
											disabled={isEdit}
											required
											fullWidth
										/>
									)}
								/>
								<Controller
									control={control}
									name="displayName"
									render={({ field }) => (
										<TextField
											{...field}
											label="نام نمایشی"
											error={!!errors.displayName}
											helperText={errors?.displayName?.message}
											required
											fullWidth
										/>
									)}
								/>
								<div className="md:col-span-2">
									<Controller
										control={control}
										name="description"
										render={({ field }) => (
											<TextField
												{...field}
												label="توضیحات"
												placeholder="کاربرد این نوع فایل برای کاربران نهایی"
												multiline
												minRows={2}
												fullWidth
											/>
										)}
									/>
								</div>
								<Controller
									control={control}
									name="mediaCategory"
									render={({ field }) => (
										<FormControl fullWidth>
											<InputLabel id="media-category-label">دسته رسانه</InputLabel>
											<Select
												{...field}
												labelId="media-category-label"
												label="دسته رسانه"
											>
												{MEDIA_CATEGORIES.map((item) => (
													<MenuItem
														key={item.value}
														value={item.value}
													>
														{item.label}
													</MenuItem>
												))}
											</Select>
											<FormHelperText>
												نوع اعتبارسنجی بک‌اند را تعیین می‌کند — صریحاً تنظیم کنید
											</FormHelperText>
										</FormControl>
									)}
								/>
								<Controller
									control={control}
									name="maxFiles"
									render={({ field }) => (
										<NumberField
											field={field}
											label="حداکثر تعداد فایل در هر آپلود"
											unit="عدد"
										/>
									)}
								/>
								<div className="md:col-span-2">
									<Controller
										control={control}
										name="selectedFileTypes"
										render={({ field: { onChange, value = [] } }) => (
											<Autocomplete
												multiple
												options={standardFileTypes}
												value={value}
												onChange={(_, next) => onChange(next)}
												getOptionLabel={(option) => option.label}
												isOptionEqualToValue={(a, b) => a.value === b.value}
												renderInput={(params) => (
													<TextField
														{...params}
														label="پسوندهای مجاز"
														placeholder="انتخاب پسوند"
														helperText="به صورت کاما جدا می‌شود، مثلاً jpg,jpeg,png"
													/>
												)}
												renderTags={(tagValue, getTagProps) =>
													tagValue.map((option, index) => (
														<Chip
															label={option.label}
															size="small"
															{...getTagProps({ index })}
															key={option.value}
														/>
													))
												}
											/>
										)}
									/>
								</div>
								<div className="md:col-span-2">
									<Controller
										control={control}
										name="selectedMimeTypes"
										render={({ field: { onChange, value = [] } }) => (
											<ChipArrayField
												label="نوع‌های MIME مجاز"
												value={value}
												onChange={onChange}
												options={COMMON_MIME_TYPES}
												helperText="بر اساس محتوای واقعی فایل (نه هدر کلاینت) بررسی می‌شود"
											/>
										)}
									/>
								</div>
								<div className="flex flex-col gap-8 md:col-span-2 sm:flex-row sm:gap-32">
									<Controller
										name="scanWithAntivirus"
										control={control}
										render={({ field: { onChange, value } }) => (
											<TriStateSwitch
												label="اسکن آنتی‌ویروس (ClamAV)"
												value={value}
												onChange={onChange}
											/>
										)}
									/>
									{(isAvMedia || isVideo) && (
										<Controller
											name="generateThumbnail"
											control={control}
											render={({ field: { onChange, value } }) => (
												<TriStateSwitch
													label="تولید خودکار تصویر بندانگشتی"
													value={value}
													onChange={onChange}
												/>
											)}
										/>
									)}
								</div>
							</div>
						)}

						{/* Tab 1: Constraints */}
						{dialogTab === 1 && (
							<div className="space-y-24">
								<div>
									<SectionTitle hint="اندازه‌ها بر حسب بایت هستند">اندازه فایل</SectionTitle>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
										<Controller
											control={control}
											name="minSize"
											render={({ field }) => (
												<NumberField
													field={field}
													label="حداقل اندازه"
													unit="bytes"
													helperText={
														field.value ? `≈ ${formatBytes(field.value)}` : undefined
													}
												/>
											)}
										/>
										<Controller
											control={control}
											name="maxSize"
											render={({ field }) => (
												<NumberField
													field={field}
													label="حداکثر اندازه"
													unit="bytes"
													helperText={
														field.value ? `≈ ${formatBytes(field.value)}` : undefined
													}
												/>
											)}
										/>
									</div>
								</div>

								{isAvMedia && (
									<div>
										<SectionTitle hint="ابعاد بر حسب پیکسل">ابعاد تصویر / ویدیو</SectionTitle>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
											<Controller
												control={control}
												name="minWidth"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداقل عرض"
														unit="px"
													/>
												)}
											/>
											<Controller
												control={control}
												name="maxWidth"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداکثر عرض"
														unit="px"
													/>
												)}
											/>
											<Controller
												control={control}
												name="minHeight"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداقل ارتفاع"
														unit="px"
													/>
												)}
											/>
											<Controller
												control={control}
												name="maxHeight"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداکثر ارتفاع"
														unit="px"
													/>
												)}
											/>
										</div>
									</div>
								)}

								{isTimedMedia && (
									<div>
										<SectionTitle hint="مدت زمان بر حسب ثانیه">مدت زمان</SectionTitle>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
											<Controller
												control={control}
												name="minDurationSeconds"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداقل مدت"
														unit="ثانیه"
													/>
												)}
											/>
											<Controller
												control={control}
												name="maxDurationSeconds"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداکثر مدت"
														unit="ثانیه"
													/>
												)}
											/>
										</div>
									</div>
								)}

								{!isAvMedia && !isTimedMedia && (
									<Typography
										color="text.secondary"
										variant="body2"
									>
										برای دستهٔ {mediaCategory || 'OTHER'} فقط محدودیت اندازه و پسوند/MIME اعمال
										می‌شود. برای ابعاد و مدت، دسته را به IMAGE / VIDEO / AUDIO تغییر دهید.
									</Typography>
								)}
							</div>
						)}

						{/* Tab 2: Media rules (validationConfig) */}
						{dialogTab === 2 && (
							<div className="space-y-20">
								<Controller
									control={control}
									name="validationConfig.guide"
									render={({ field }) => (
										<TextField
											{...field}
											label="راهنمای آپلود (برای کاربر نهایی)"
											placeholder="مثلاً: لوگوی مربعی با حداقل ابعاد ۱۰۰×۱۰۰"
											multiline
											minRows={2}
											fullWidth
										/>
									)}
								/>

								{(isAvMedia || isTimedMedia) && (
									<>
										<Controller
											control={control}
											name="validationConfig.allowedAspectRatios"
											render={({ field: { value, onChange } }) => (
												<AspectRatioListEditor
													value={value}
													onChange={onChange}
												/>
											)}
										/>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
											<Controller
												control={control}
												name="validationConfig.aspectRatioMatchMode"
												render={({ field }) => (
													<FormControl fullWidth>
														<InputLabel>حالت تطبیق نسبت</InputLabel>
														<Select
															{...field}
															value={field.value || "TOLERANCE"}
															label="حالت تطبیق نسبت"
														>
															<MenuItem value="TOLERANCE">با تلورانس</MenuItem>
															<MenuItem value="EXACT">دقیق</MenuItem>
														</Select>
													</FormControl>
												)}
											/>
											<Controller
												control={control}
												name="validationConfig.aspectRatioTolerance"
												render={({ field }) => (
													<NumberField
														field={field}
														label="تلورانس نسبت"
														helperText="مثلاً 0.02 = ۲٪"
													/>
												)}
											/>
										</div>
										<Controller
											control={control}
											name="validationConfig.allowedResolutions"
											render={({ field: { value, onChange } }) => (
												<ResolutionListEditor
													value={value}
													onChange={onChange}
												/>
											)}
										/>
									</>
								)}

								{isImageLike && (
									<>
										<Divider />
										<SectionTitle>قوانین تصویر</SectionTitle>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
											<Controller
												control={control}
												name="validationConfig.allowedColorModes"
												render={({ field: { value, onChange } }) => (
													<ChipArrayField
														label="حالت‌های رنگ مجاز"
														value={value || []}
														onChange={onChange}
														options={COLOR_MODES}
													/>
												)}
											/>
											<Controller
												control={control}
												name="validationConfig.maxPixels"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداکثر پیکسل کل"
														unit="px²"
														helperText="محافظت در برابر decompression bomb"
													/>
												)}
											/>
											<Controller
												control={control}
												name="validationConfig.metadataPolicy"
												render={({ field }) => (
													<FormControl fullWidth>
														<InputLabel>سیاست متادیتا</InputLabel>
														<Select
															{...field}
															value={field.value || "STRIP"}
															label="سیاست متادیتا"
														>
															<MenuItem value="STRIP">حذف (STRIP)</MenuItem>
															<MenuItem value="PRESERVE">حفظ (PRESERVE)</MenuItem>
															<MenuItem value="SELECTIVE">انتخابی (SELECTIVE)</MenuItem>
														</Select>
													</FormControl>
												)}
											/>
											<div className="flex flex-col gap-8">
												<Controller
													name="validationConfig.allowAlpha"
													control={control}
													render={({ field: { value, onChange } }) => (
														<TriStateSwitch
															label="اجازه شفافیت (Alpha)"
															value={value}
															onChange={onChange}
															helperText="خاموش = رد تصاویر شفاف"
														/>
													)}
												/>
												<Controller
													name="validationConfig.allowAnimated"
													control={control}
													render={({ field: { value, onChange } }) => (
														<TriStateSwitch
															label="اجازه انیمیشن"
															value={value}
															onChange={onChange}
															helperText="خاموش = رد gif/webp متحرک"
														/>
													)}
												/>
												<Controller
													name="validationConfig.preserveIccProfile"
													control={control}
													render={({ field: { value, onChange } }) => (
														<TriStateSwitch
															label="حفظ پروفایل ICC"
															value={value}
															onChange={onChange}
														/>
													)}
												/>
											</div>
										</div>
									</>
								)}

								{isTimedMedia && (
									<>
										<Divider />
										<SectionTitle>قوانین ویدیو / صوت</SectionTitle>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
											{isVideo && (
												<>
													<Controller
														control={control}
														name="validationConfig.allowedContainers"
														render={({ field: { value, onChange } }) => (
															<ChipArrayField
																label="کانتینرهای مجاز"
																value={value || []}
																onChange={onChange}
																options={CONTAINERS}
																helperText="حروف کوچک، مثلاً mp4"
															/>
														)}
													/>
													<Controller
														control={control}
														name="validationConfig.allowedVideoCodecs"
														render={({ field: { value, onChange } }) => (
															<ChipArrayField
																label="کدک‌های ویدیو"
																value={value || []}
																onChange={onChange}
																options={VIDEO_CODECS}
															/>
														)}
													/>
												</>
											)}
											<Controller
												control={control}
												name="validationConfig.allowedAudioCodecs"
												render={({ field: { value, onChange } }) => (
													<ChipArrayField
														label="کدک‌های صوت"
														value={value || []}
														onChange={onChange}
														options={AUDIO_CODECS}
													/>
												)}
											/>
											{isVideo && (
												<>
													<Controller
														control={control}
														name="validationConfig.minFrameRate"
														render={({ field }) => (
															<NumberField
																field={field}
																label="حداقل نرخ فریم"
																unit="fps"
															/>
														)}
													/>
													<Controller
														control={control}
														name="validationConfig.maxFrameRate"
														render={({ field }) => (
															<NumberField
																field={field}
																label="حداکثر نرخ فریم"
																unit="fps"
															/>
														)}
													/>
													<Controller
														control={control}
														name="validationConfig.minBitrate"
														render={({ field }) => (
															<NumberField
																field={field}
																label="حداقل بیت‌ریت"
																unit="bps"
															/>
														)}
													/>
													<Controller
														control={control}
														name="validationConfig.maxBitrate"
														render={({ field }) => (
															<NumberField
																field={field}
																label="حداکثر بیت‌ریت"
																unit="bps"
															/>
														)}
													/>
												</>
											)}
											<Controller
												control={control}
												name="validationConfig.minAudioSampleRate"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداقل نرخ نمونه‌برداری"
														unit="Hz"
													/>
												)}
											/>
											<Controller
												control={control}
												name="validationConfig.maxAudioSampleRate"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداکثر نرخ نمونه‌برداری"
														unit="Hz"
													/>
												)}
											/>
											<Controller
												control={control}
												name="validationConfig.maxAudioChannels"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداکثر کانال صوت"
														helperText="مثلاً 2 برای استریو"
													/>
												)}
											/>
											<div className="flex flex-col gap-8">
												{isVideo && (
													<>
														<Controller
															name="validationConfig.requireVideoStream"
															control={control}
															render={({ field: { value, onChange } }) => (
																<TriStateSwitch
																	label="الزام استریم ویدیو"
																	value={value}
																	onChange={onChange}
																/>
															)}
														/>
														<Controller
															name="validationConfig.allowHdr"
															control={control}
															render={({ field: { value, onChange } }) => (
																<TriStateSwitch
																	label="اجازه HDR"
																	value={value}
																	onChange={onChange}
																	helperText="خاموش = رد ویدیوی HDR / ۱۰–۱۲ بیت"
																/>
															)}
														/>
														<Controller
															name="validationConfig.rejectExtraStreams"
															control={control}
															render={({ field: { value, onChange } }) => (
																<TriStateSwitch
																	label="رد استریم‌های اضافی"
																	value={value}
																	onChange={onChange}
																/>
															)}
														/>
													</>
												)}
												<Controller
													name="validationConfig.requireAudio"
													control={control}
													render={({ field: { value, onChange } }) => (
														<TriStateSwitch
															label="الزام صوت"
															value={value}
															onChange={onChange}
															helperText="روشن = صوت لازم، خاموش = صوت نباید باشد"
														/>
													)}
												/>
											</div>
										</div>
									</>
								)}

								{(isAvMedia || isVideo) && (
									<>
										<Divider />
										<SectionTitle>تنظیمات تصویر بندانگشتی و نرمال‌سازی</SectionTitle>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-20">
											<Controller
												control={control}
												name="validationConfig.thumbnailWidth"
												render={({ field }) => (
													<NumberField
														field={field}
														label="عرض بندانگشتی"
														unit="px"
													/>
												)}
											/>
											<Controller
												control={control}
												name="validationConfig.thumbnailHeight"
												render={({ field }) => (
													<NumberField
														field={field}
														label="ارتفاع بندانگشتی"
														unit="px"
													/>
												)}
											/>
											{isVideo && (
												<Controller
													control={control}
													name="validationConfig.thumbnailTimeSeconds"
													render={({ field }) => (
														<NumberField
															field={field}
															label="ثانیه فریم بندانگشتی"
															unit="ثانیه"
														/>
													)}
												/>
											)}
										</div>
										<div className="flex flex-col sm:flex-row gap-16 mt-8">
											<Controller
												name="validationConfig.autoNormalizeOrientation"
												control={control}
												render={({ field: { value, onChange } }) => (
													<TriStateSwitch
														label="نرمال‌سازی جهت (EXIF)"
														value={value}
														onChange={onChange}
													/>
												)}
											/>
											<Controller
												name="validationConfig.autoAdjust"
												control={control}
												render={({ field: { value, onChange } }) => (
													<TriStateSwitch
														label="تنظیم خودکار (resize/transcode)"
														value={value}
														onChange={onChange}
													/>
												)}
											/>
										</div>
									</>
								)}

								{!isAvMedia && !isTimedMedia && (
									<Typography
										color="text.secondary"
										variant="body2"
									>
										قوانین رسانه‌ای برای DOCUMENT / ARCHIVE / OTHER محدود است. راهنما و سیاست‌های
										امنیتی در تب پیشرفته در دسترس‌اند.
									</Typography>
								)}
							</div>
						)}

						{/* Tab 3: Advanced / backend wiring */}
						{dialogTab === 3 && (
							<div className="space-y-20">
								<SectionTitle hint="این فیلدها معمولاً نباید تغییر کنند مگر برای یکپارچه‌سازی بک‌اند">
									سیم‌کشی موجودیت
								</SectionTitle>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
									<Controller
										control={control}
										name="entityClass"
										render={({ field }) => (
											<TextField
												{...field}
												label="کلاس موجودیت"
												fullWidth
											/>
										)}
									/>
									<Controller
										control={control}
										name="fileEntityChildren"
										render={({ field }) => (
											<TextField
												{...field}
												label="فرزندان موجودیت فایل"
												fullWidth
											/>
										)}
									/>
								</div>
								<Controller
									control={control}
									name="entityMappings"
									render={({ field }) => (
										<TextField
											{...field}
											label="نگاشت‌های موجودیت (JSON)"
											multiline
											minRows={3}
											fullWidth
										/>
									)}
								/>
								<Controller
									control={control}
									name="jsonSchema"
									render={({ field }) => (
										<TextField
											{...field}
											label="طرح JSON"
											multiline
											minRows={3}
											fullWidth
										/>
									)}
								/>
								<Controller
									control={control}
									name="zodSchema"
									render={({ field }) => (
										<TextField
											{...field}
											label="طرح Zod"
											multiline
											minRows={3}
											fullWidth
										/>
									)}
								/>

								<Accordion
									defaultExpanded
									elevation={0}
									className="border rounded-lg"
								>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Typography className="font-medium">امنیت و سیاست‌های پردازش</Typography>
									</AccordionSummary>
									<AccordionDetails>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-20">
											<Controller
												control={control}
												name="validationConfig.maxParseSeconds"
												render={({ field }) => (
													<NumberField
														field={field}
														label="حداکثر زمان پارس متادیتا"
														unit="ثانیه"
													/>
												)}
											/>
											<Controller
												control={control}
												name="validationConfig.duplicatePolicy"
												render={({ field }) => (
													<FormControl fullWidth>
														<InputLabel>سیاست تکراری</InputLabel>
														<Select
															{...field}
															value={field.value || "ALLOW"}
															label="سیاست تکراری"
														>
															<MenuItem value="ALLOW">اجازه (ALLOW)</MenuItem>
															<MenuItem value="REJECT">رد (REJECT)</MenuItem>
															<MenuItem value="REPLACE">جایگزینی (REPLACE)</MenuItem>
														</Select>
													</FormControl>
												)}
											/>
											<Controller
												name="validationConfig.enforceContentTypeMatchesExtension"
												control={control}
												render={({ field: { value, onChange } }) => (
													<TriStateSwitch
														label="تطبیق نوع محتوا با پسوند"
														value={value}
														onChange={onChange}
														helperText="پیش‌فرض: روشن"
													/>
												)}
											/>
											<Controller
												name="validationConfig.computeContentHash"
												control={control}
												render={({ field: { value, onChange } }) => (
													<TriStateSwitch
														label="محاسبه هش محتوا (SHA-256)"
														value={value}
														onChange={onChange}
													/>
												)}
											/>
										</div>
										<div className="mt-20">
											<Controller
												control={control}
												name="validationConfig.allowedMimeTypes"
												render={({ field: { value, onChange } }) => (
													<ChipArrayField
														label="MIMEهای مجاز (validationConfig)"
														value={value || []}
														onChange={onChange}
														options={COMMON_MIME_TYPES}
														helperText="با ستون validMimeTypes ادغام می‌شود"
													/>
												)}
											/>
										</div>
									</AccordionDetails>
								</Accordion>
							</div>
						)}
					</DialogContent>

					<DialogActions className="border-t p-16 gap-8">
						<Button
							variant="outlined"
							onClick={handleCloseDialog}
							size="large"
							className="flex-1"
						>
							انصراف
						</Button>
						<Button
							variant="contained"
							color="secondary"
							disabled={_.isEmpty(dirtyFields) || !isValid}
							type="submit"
							size="large"
							className="flex-1"
						>
							{isEdit ? "بروزرسانی" : "ذخیره"}
						</Button>
					</DialogActions>
				</form>
			</Dialog>

			<Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
				<DialogTitle>حذف نوع فایل سرویس</DialogTitle>
				<DialogContent>
					<Typography>
						آیا از حذف <strong>{deleteTarget}</strong> اطمینان دارید؟ انواع داخلی سیستم قابل حذف نیستند.
					</Typography>
				</DialogContent>
				<DialogActions className="p-16 gap-8">
					<Button variant="outlined" onClick={() => setDeleteTarget(null)} className="flex-1">
						انصراف
					</Button>
					<Button variant="contained" color="error" onClick={confirmDelete} className="flex-1">
						حذف
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

export default FileServiceTypeTab;
