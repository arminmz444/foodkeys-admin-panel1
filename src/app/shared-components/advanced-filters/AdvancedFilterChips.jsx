import { Box, Chip, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useMemo } from 'react';
import { buildFieldConfigMap, describeFilterRow } from './buildFilterQuery';

/**
 * Renders the currently applied advanced-filter rows as removable chips.
 *
 * @param {Object}   config     the same config passed to <AdvancedFilters/>
 * @param {Array}    rows       applied filter rows (enabled only)
 * @param {Function} onRemove   (field) => void
 * @param {Function} onClearAll () => void
 */
function AdvancedFilterChips({ config, rows = [], onRemove, onClearAll }) {
	const fieldMap = useMemo(() => buildFieldConfigMap(config), [config]);

	if (!rows.length) return null;

	return (
		<Box className="w-full mb-8">
			<Stack direction="row" alignItems="center" spacing={1} className="mb-4">
				<Typography variant="caption" className="font-medium text-gray-600">
					فیلترهای پیشرفته فعال:
				</Typography>
				<button
					type="button"
					onClick={onClearAll}
					className="text-xs text-red-600 hover:text-red-800 underline"
				>
					پاک کردن همه
				</button>
			</Stack>
			<Stack direction="row" flexWrap="wrap" gap={1}>
				{rows.map((row) => (
					<Chip
						key={row.field}
						size="small"
						variant="outlined"
						label={describeFilterRow(row, fieldMap[row.field])}
						onDelete={() => onRemove(row.field)}
						deleteIcon={<FuseSvgIcon size={16}>heroicons-outline:x</FuseSvgIcon>}
					/>
				))}
			</Stack>
		</Box>
	);
}

export default AdvancedFilterChips;
