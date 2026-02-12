import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { MdSearch, MdGridView, MdViewList, MdSettings } from 'react-icons/md';

/**
 * Category to icon mapping
 */
const CATEGORY_ICONS = {
    website: 'heroicons-outline:globe-alt',
    user: 'heroicons-outline:user-circle',
    system: 'heroicons-outline:cog',
    payment: 'heroicons-outline:credit-card',
    notification: 'heroicons-outline:bell',
    content: 'heroicons-outline:document-text',
    default: 'heroicons-outline:adjustments',
};

/**
 * Category to color mapping
 */
const CATEGORY_COLORS = {
    website: 'primary',
    user: 'secondary',
    system: 'warning',
    payment: 'success',
    notification: 'info',
    content: 'default',
    default: 'default',
};

/**
 * Get icon for category
 */
function getCategoryIcon(category) {
    const categoryLower = category?.toLowerCase() || '';
    return CATEGORY_ICONS[categoryLower] || CATEGORY_ICONS.default;
}

/**
 * Get color for category
 */
function getCategoryColor(category) {
    const categoryLower = category?.toLowerCase() || '';
    return CATEGORY_COLORS[categoryLower] || CATEGORY_COLORS.default;
}

/**
 * Config Card Component
 */
function ConfigCard({ config, onClick, viewMode }) {
    const isListView = viewMode === 'list';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={isListView ? 'w-full' : ''}
        >
            <Card 
                elevation={0}
                className={`
                    border hover:border-primary-main hover:shadow-lg
                    transition-all duration-200 h-full
                    ${isListView ? 'flex items-center' : ''}
                `}
            >
                <CardActionArea 
                    onClick={() => onClick(config)}
                    className={isListView ? 'flex items-center justify-start h-full' : 'h-full'}
                >
                    <CardContent className={`
                        ${isListView ? 'flex items-center gap-16 w-full py-16' : 'p-24'}
                    `}>
                        {/* Icon */}
                        <Box 
                            className={`
                                flex items-center justify-center rounded-xl
                                bg-primary-50 dark:bg-primary-900/20
                                ${isListView ? 'w-48 h-48 flex-shrink-0' : 'w-64 h-64 mb-16'}
                            `}
                        >
                            {config.picture ? (
                                <img 
                                    src={config.picture} 
                                    alt={config.displayName}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <FuseSvgIcon 
                                    className="text-primary-main" 
                                    size={isListView ? 24 : 32}
                                >
                                    {getCategoryIcon(config.category)}
                                </FuseSvgIcon>
                            )}
                        </Box>

                        {/* Content */}
                        <div className={isListView ? 'flex-1 min-w-0' : ''}>
                            <Typography 
                                className={`
                                    font-semibold truncate
                                    ${isListView ? 'text-base' : 'text-lg mb-8'}
                                `}
                            >
                                {config.displayName || config.name}
                            </Typography>

                            {config.description && (
                                <Typography 
                                    color="text.secondary"
                                    className={`
                                        line-clamp-2
                                        ${isListView ? 'text-sm' : 'text-sm mb-12'}
                                    `}
                                >
                                    {config.description}
                                </Typography>
                            )}

                            {!isListView && config.category && (
                                <Chip
                                    label={config.category}
                                    size="small"
                                    color={getCategoryColor(config.category)}
                                    variant="outlined"
                                />
                            )}
                        </div>

                        {/* Category chip for list view */}
                        {isListView && config.category && (
                            <Chip
                                label={config.category}
                                size="small"
                                color={getCategoryColor(config.category)}
                                variant="outlined"
                                className="flex-shrink-0"
                            />
                        )}

                        {/* Arrow indicator */}
                        <FuseSvgIcon 
                            className={`
                                text-gray-400
                                ${isListView ? 'flex-shrink-0' : 'absolute bottom-16 left-16'}
                            `}
                            size={20}
                        >
                            heroicons-outline:chevron-left
                        </FuseSvgIcon>
                    </CardContent>
                </CardActionArea>
            </Card>
        </motion.div>
    );
}

/**
 * Loading Skeleton
 */
function ConfigCardSkeleton({ viewMode }) {
    const isListView = viewMode === 'list';

    if (isListView) {
        return (
            <div className="flex items-center gap-16 p-16 border rounded-lg">
                <Skeleton variant="rounded" width={48} height={48} />
                <div className="flex-1">
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={20} />
                </div>
                <Skeleton variant="rounded" width={80} height={24} />
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-24">
            <Skeleton variant="rounded" width={64} height={64} className="mb-16" />
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="rounded" width={80} height={24} className="mt-12" />
        </div>
    );
}

/**
 * Dynamic Config List Component
 * 
 * Displays all available configs in a beautiful grid or list view.
 */
function DynamicConfigList({ 
    configs = [], 
    isLoading = false, 
    error = null,
    onConfigClick,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(configs.map(c => c.category).filter(Boolean));
        return ['all', ...Array.from(cats)];
    }, [configs]);

    // Filter configs
    const filteredConfigs = useMemo(() => {
        return configs.filter(config => {
            // Search filter
            const matchesSearch = !searchQuery || 
                config.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                config.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                config.description?.toLowerCase().includes(searchQuery.toLowerCase());

            // Category filter
            const matchesCategory = selectedCategory === 'all' || 
                config.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [configs, searchQuery, selectedCategory]);

    // Group by category for grid view
    const groupedConfigs = useMemo(() => {
        if (selectedCategory !== 'all') {
            return { [selectedCategory]: filteredConfigs };
        }

        return filteredConfigs.reduce((acc, config) => {
            const cat = config.category || 'سایر';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(config);
            return acc;
        }, {});
    }, [filteredConfigs, selectedCategory]);

    // Handle view mode change
    const handleViewModeChange = (event, newMode) => {
        if (newMode !== null) {
            setViewMode(newMode);
        }
    };

    // Error state
    if (error) {
        return (
            <Alert severity="error" className="m-16">
                خطا در بارگذاری پیکربندی‌ها: {error.message || 'خطای ناشناخته'}
            </Alert>
        );
    }

    return (
        <div className="w-full">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row gap-16 mb-24">
                {/* Search */}
                <TextField
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در پیکربندی‌ها..."
                    variant="outlined"
                    size="small"
                    className="flex-1"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MdSearch size={20} className="text-gray-400" />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* View Mode Toggle */}
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                >
                    <ToggleButton value="grid">
                        <MdGridView size={20} />
                    </ToggleButton>
                    <ToggleButton value="list">
                        <MdViewList size={20} />
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/* Category Chips */}
            {categories.length > 2 && (
                <div className="flex flex-wrap gap-8 mb-24">
                    {categories.map(category => (
                        <Chip
                            key={category}
                            label={category === 'all' ? 'همه' : category}
                            onClick={() => setSelectedCategory(category)}
                            variant={selectedCategory === category ? 'filled' : 'outlined'}
                            color={selectedCategory === category ? 'primary' : 'default'}
                            size="small"
                        />
                    ))}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className={`
                    ${viewMode === 'grid' 
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16' 
                        : 'space-y-12'}
                `}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <ConfigCardSkeleton key={i} viewMode={viewMode} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredConfigs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-64 text-center">
                    <FuseSvgIcon className="text-gray-300 mb-16" size={64}>
                        heroicons-outline:cog
                    </FuseSvgIcon>
                    <Typography variant="h6" color="text.secondary">
                        {searchQuery || selectedCategory !== 'all'
                            ? 'پیکربندی‌ای با این فیلترها یافت نشد'
                            : 'هیچ پیکربندی‌ای وجود ندارد'}
                    </Typography>
                    {(searchQuery || selectedCategory !== 'all') && (
                        <Typography color="text.secondary" className="mt-8">
                            فیلترها را تغییر دهید یا جستجوی دیگری انجام دهید.
                        </Typography>
                    )}
                </div>
            )}

            {/* Config Cards */}
            {!isLoading && filteredConfigs.length > 0 && (
                viewMode === 'list' ? (
                    // List View
                    <div className="space-y-12">
                        {filteredConfigs.map(config => (
                            <ConfigCard
                                key={config.name}
                                config={config}
                                onClick={onConfigClick}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    // Grid View - Grouped by category
                    <div className="space-y-32">
                        {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
                            <div key={category}>
                                {selectedCategory === 'all' && (
                                    <Typography className="text-lg font-semibold mb-16">
                                        {category}
                                    </Typography>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
                                    {categoryConfigs.map(config => (
                                        <ConfigCard
                                            key={config.name}
                                            config={config}
                                            onClick={onConfigClick}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

export default DynamicConfigList;
