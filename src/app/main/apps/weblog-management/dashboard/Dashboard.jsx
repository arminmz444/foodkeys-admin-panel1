import { motion } from 'framer-motion';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGetWeblogPostsQuery, useGetWeblogCategoriesQuery, useGetWeblogTagsQuery, useGetWeblogMediaQuery } from '../WeblogApi';
import FuseLoading from '@fuse/core/FuseLoading';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha, useTheme } from '@mui/material/styles';

// Animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

const hoverVariants = {
  hover: {
    y: -8,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  }
};

// Modern Stat Card with glassmorphism
function StatCard({ title, value, icon, gradient, link, trend, trendValue }) {
  const theme = useTheme();
  
  return (
    <motion.div variants={cardVariants} whileHover="hover">
      <motion.div variants={hoverVariants}>
        <Paper
          component={Link}
          to={link}
          className="relative overflow-hidden rounded-2xl p-24 h-full block no-underline"
          sx={{
            background: gradient,
            boxShadow: `0 10px 40px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `0 20px 60px -15px ${alpha(theme.palette.primary.main, 0.4)}`
            }
          }}
        >
          {/* Background decoration */}
          <Box
            className="absolute -top-16 -right-16 w-96 h-96 rounded-full opacity-20"
            sx={{ background: 'rgba(255,255,255,0.3)' }}
          />
          <Box
            className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10"
            sx={{ background: 'rgba(255,255,255,0.5)' }}
          />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-16">
              <Box
                className="flex items-center justify-center w-56 h-56 rounded-2xl"
                sx={{
                  background: 'rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <FuseSvgIcon className="text-white" size={28}>{icon}</FuseSvgIcon>
              </Box>
              {trend && (
                <Chip
                  size="small"
                  label={`${trend === 'up' ? '+' : ''}${trendValue}%`}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)'
                  }}
                  icon={
                    <FuseSvgIcon size={14} className="text-white">
                      {trend === 'up' ? 'heroicons-outline:trending-up' : 'heroicons-outline:trending-down'}
                    </FuseSvgIcon>
                  }
                />
              )}
            </div>
            
            <Typography className="text-white/80 text-sm font-medium mb-4">{title}</Typography>
            <Typography className="text-white text-4xl font-bold">{value}</Typography>
            
            <Box className="mt-auto pt-16 flex items-center gap-8 text-white/70">
              <Typography variant="caption">مشاهده همه</Typography>
              <FuseSvgIcon size={14}>heroicons-outline:arrow-left</FuseSvgIcon>
            </Box>
          </div>
        </Paper>
      </motion.div>
    </motion.div>
  );
}

// Quick Action Button with modern design
function QuickActionButton({ title, icon, link, color }) {
  return (
    <motion.div variants={cardVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Tooltip title={title} arrow>
        <Button
          component={Link}
          to={link}
          className="flex flex-col items-center justify-center gap-8 rounded-2xl p-20 min-w-[100px]"
          sx={{
            backgroundColor: (theme) => alpha(theme.palette[color].main, 0.1),
            color: `${color}.main`,
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette[color].main, 0.2)
            }
          }}
        >
          <Box
            className="flex items-center justify-center w-48 h-48 rounded-xl"
            sx={{
              background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
              boxShadow: (theme) => `0 8px 20px -6px ${alpha(theme.palette[color].main, 0.5)}`
            }}
          >
            <FuseSvgIcon className="text-white" size={24}>{icon}</FuseSvgIcon>
          </Box>
          <Typography variant="caption" className="font-semibold">{title}</Typography>
        </Button>
      </Tooltip>
    </motion.div>
  );
}

// Modern Post Card
function PostCard({ post, index }) {
  const theme = useTheme();
  const statusConfig = {
    PUBLISHED: { label: 'منتشر شده', color: 'success', bg: 'success.main' },
    DRAFT: { label: 'پیش‌نویس', color: 'warning', bg: 'warning.main' },
    SCHEDULED: { label: 'زمان‌بندی', color: 'info', bg: 'info.main' },
    ARCHIVED: { label: 'آرشیو', color: 'default', bg: 'grey.500' }
  };
  
  const config = statusConfig[post.status] || statusConfig.DRAFT;
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ x: 8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Paper
        component={Link}
        to={`/apps/weblog/posts/${post.id}`}
        className="flex items-center gap-20 p-16 rounded-2xl no-underline group"
        sx={{
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 8px 30px -10px ${alpha(theme.palette.primary.main, 0.2)}`
          }
        }}
      >
        {/* Rank Number */}
        <Box
          className="flex items-center justify-center w-40 h-40 rounded-xl font-bold text-lg flex-shrink-0"
          sx={{
            background: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main'
          }}
        >
          {index + 1}
        </Box>
        
        {/* Image */}
        {post.featuredImage ? (
          <Box
            className="w-64 h-64 rounded-xl overflow-hidden flex-shrink-0"
            sx={{
              boxShadow: '0 4px 15px -5px rgba(0,0,0,0.2)'
            }}
          >
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </Box>
        ) : (
          <Box
            className="w-64 h-64 rounded-xl flex items-center justify-center flex-shrink-0"
            sx={{ 
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.grey[400], 0.3)}, ${alpha(theme.palette.grey[500], 0.3)})`
            }}
          >
            <FuseSvgIcon className="text-gray-400" size={24}>heroicons-outline:photograph</FuseSvgIcon>
          </Box>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-8 mb-6">
            <Chip
              size="small"
              label={config.label}
              sx={{
                backgroundColor: (theme) => alpha(theme.palette[config.color].main, 0.15),
                color: `${config.color}.main`,
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 22
              }}
            />
            {post.category && (
              <Chip
                size="small"
                label={post.category.name}
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            )}
          </div>
          
          <Typography className="font-semibold text-base line-clamp-1 mb-4 group-hover:text-primary-500 transition-colors">
            {post.title}
          </Typography>
          
          <Typography variant="caption" className="text-gray-500 line-clamp-1">
            {post.excerpt || 'بدون خلاصه...'}
          </Typography>
        </div>
        
        {/* Stats */}
        <div className="flex flex-col items-end gap-8 flex-shrink-0 hidden sm:flex">
          <div className="flex items-center gap-4 text-gray-400">
            <FuseSvgIcon size={14}>heroicons-outline:eye</FuseSvgIcon>
            <Typography variant="caption">{post.viewCount || 0}</Typography>
          </div>
          <Typography variant="caption" className="text-gray-400">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fa-IR') : '-'}
          </Typography>
        </div>
        
        {/* Arrow */}
        <FuseSvgIcon 
          className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0"
          size={20}
        >
          heroicons-outline:chevron-left
        </FuseSvgIcon>
      </Paper>
    </motion.div>
  );
}

// Category Item with progress
function CategoryItem({ category }) {
  const maxPosts = 50;
  const progress = Math.min((category._count?.posts || 0) / maxPosts * 100, 100);
  
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-12 py-12 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <Box
        className="w-10 h-10 rounded-full"
        sx={{ 
          background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
        }}
      />
      <div className="flex-1 min-w-0">
        <Typography className="font-medium text-sm truncate">{category.name}</Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 2,
            mt: 1,
            backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 2,
              background: (theme) => `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`
            }
          }}
        />
      </div>
      <Chip
        size="small"
        label={`${category._count?.posts || 0} پست`}
        sx={{
          backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
          color: 'secondary.main',
          fontWeight: 600,
          fontSize: '0.7rem'
        }}
      />
    </motion.div>
  );
}

function Dashboard() {
  const theme = useTheme();
  const { data: postsData, isLoading: postsLoading } = useGetWeblogPostsQuery({ limit: 5 });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetWeblogCategoriesQuery({});
  const { data: tagsData, isLoading: tagsLoading } = useGetWeblogTagsQuery({});
  const { data: mediaData, isLoading: mediaLoading } = useGetWeblogMediaQuery({ limit: 6 });

  const isLoading = postsLoading || categoriesLoading || tagsLoading || mediaLoading;

  if (isLoading) {
    return <FuseLoading />;
  }

  const posts = postsData?.data || [];
  const categories = categoriesData || [];
  const tags = tagsData || [];
  const media = mediaData?.data || [];
  const totalPosts = postsData?.pagination?.total || posts.length;
  const totalMedia = mediaData?.pagination?.total || media.length;

  // Gradient colors for stat cards
  const gradients = {
    posts: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    categories: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    tags: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    media: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`
  };

  return (
    <motion.div
      className="w-full min-h-full p-24 md:p-32 space-y-32"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div variants={cardVariants} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-20">
        <div>
          <Typography 
            className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent"
            sx={{
              backgroundImage: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }}
          >
            داشبورد وبلاگ خبری
          </Typography>
          <Typography className="text-gray-500 dark:text-gray-400 mt-8 text-base">
            به پنل مدیریت محتوا خوش آمدید. از اینجا می‌توانید تمام محتوای وبلاگ را مدیریت کنید.
          </Typography>
        </div>
        
        <Button
          component={Link}
          to="/apps/weblog/posts/new"
          variant="contained"
          size="large"
          className="rounded-xl px-24 py-12 shadow-lg text-white"
          sx={{
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: (theme) => `0 10px 30px -10px ${alpha(theme.palette.primary.main, 0.5)}`,
            '&:hover': {
              boxShadow: (theme) => `0 15px 40px -10px ${alpha(theme.palette.primary.main, 0.6)}`
            }
          }}
          startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
        >
          نوشتن پست جدید
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20">
        <StatCard
          title="کل پست‌ها"
          value={totalPosts}
          icon="heroicons-outline:document-text"
          gradient={gradients.posts}
          link="/apps/weblog/posts"
          trend="up"
          trendValue={12}
        />
        <StatCard
          title="دسته‌بندی‌ها"
          value={categories.length}
          icon="heroicons-outline:folder"
          gradient={gradients.categories}
          link="/apps/weblog/categories"
        />
        <StatCard
          title="برچسب‌ها"
          value={tags.length}
          icon="heroicons-outline:tag"
          gradient={gradients.tags}
          link="/apps/weblog/tags"
        />
        <StatCard
          title="رسانه‌ها"
          value={totalMedia}
          icon="heroicons-outline:photograph"
          gradient={gradients.media}
          link="/apps/weblog/media"
        />
      </div>

      {/* Quick Actions */}
      <motion.div variants={cardVariants}>
        <Paper className="p-24 rounded-2xl" sx={{ backgroundColor: 'background.paper' }}>
          <Typography className="font-bold text-lg mb-20">دسترسی سریع</Typography>
          <div className="flex flex-wrap gap-16">
            <QuickActionButton title="پست جدید" icon="heroicons-outline:pencil-alt" link="/apps/weblog/posts/new" color="primary" />
            <QuickActionButton title="دسته‌بندی" icon="heroicons-outline:folder-add" link="/apps/weblog/categories/new" color="secondary" />
            <QuickActionButton title="برچسب" icon="heroicons-outline:tag" link="/apps/weblog/tags/new" color="warning" />
            <QuickActionButton title="آپلود" icon="heroicons-outline:cloud-upload" link="/apps/weblog/media" color="info" />
            <QuickActionButton title="مشاهده پست‌ها" icon="heroicons-outline:view-list" link="/apps/weblog/posts" color="success" />
          </div>
        </Paper>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-24">
        {/* Recent Posts - Takes 2 columns */}
        <motion.div variants={cardVariants} className="xl:col-span-2">
          <Paper className="p-24 rounded-2xl h-full" sx={{ backgroundColor: 'background.paper' }}>
            <div className="flex items-center justify-between mb-20">
              <div className="flex items-center gap-12">
                <Box
                  className="w-40 h-40 rounded-xl flex items-center justify-center"
                  sx={{ background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}
                >
                  <FuseSvgIcon className="text-white" size={20}>heroicons-outline:document-text</FuseSvgIcon>
                </Box>
                <Typography className="font-bold text-lg">پست‌های اخیر</Typography>
              </div>
              <Button component={Link} to="/apps/weblog/posts" endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-left</FuseSvgIcon>} className="rounded-xl">
                همه پست‌ها
              </Button>
            </div>
            
            <div className="space-y-12">
              {posts.length > 0 ? (
                posts.slice(0, 5).map((post, index) => <PostCard key={post.id} post={post} index={index} />)
              ) : (
                <Box className="text-center py-48">
                  <Box className="w-80 h-80 rounded-full flex items-center justify-center mx-auto mb-16" sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }}>
                    <FuseSvgIcon className="text-gray-400" size={40}>heroicons-outline:document-add</FuseSvgIcon>
                  </Box>
                  <Typography className="text-gray-500 mb-16">هنوز پستی منتشر نشده است</Typography>
                  <Button component={Link} to="/apps/weblog/posts/new" variant="contained" className="rounded-xl">اولین پست را بنویسید</Button>
                </Box>
              )}
            </div>
          </Paper>
        </motion.div>

        {/* Sidebar - Categories & Tags */}
        <div className="space-y-24">
          {/* Categories */}
          <motion.div variants={cardVariants}>
            <Paper className="p-24 rounded-2xl" sx={{ backgroundColor: 'background.paper' }}>
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-12">
                  <Box className="w-36 h-36 rounded-lg flex items-center justify-center" sx={{ background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})` }}>
                    <FuseSvgIcon className="text-white" size={18}>heroicons-outline:folder</FuseSvgIcon>
                  </Box>
                  <Typography className="font-bold">دسته‌بندی‌ها</Typography>
                </div>
                <IconButton component={Link} to="/apps/weblog/categories" size="small" sx={{ color: 'text.secondary' }}>
                  <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
                </IconButton>
              </div>
              
              <div className="space-y-4">
                {categories.length > 0 ? (
                  categories.slice(0, 5).map((category) => <CategoryItem key={category.id} category={category} />)
                ) : (
                  <Typography className="text-center text-gray-500 py-16 text-sm">دسته‌بندی‌ای وجود ندارد</Typography>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Popular Tags */}
          <motion.div variants={cardVariants}>
            <Paper className="p-24 rounded-2xl" sx={{ backgroundColor: 'background.paper' }}>
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-12">
                  <Box className="w-36 h-36 rounded-lg flex items-center justify-center" sx={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                    <FuseSvgIcon className="text-white" size={18}>heroicons-outline:tag</FuseSvgIcon>
                  </Box>
                  <Typography className="font-bold">برچسب‌های محبوب</Typography>
                </div>
                <IconButton component={Link} to="/apps/weblog/tags" size="small" sx={{ color: 'text.secondary' }}>
                  <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
                </IconButton>
              </div>
              
              <div className="flex flex-wrap gap-8">
                {tags.length > 0 ? (
                  tags.slice(0, 12).map((tag) => (
                    <motion.div key={tag.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Chip label={tag.name} component={Link} to={`/apps/weblog/tags/${tag.id}`} clickable size="small"
                        sx={{ borderRadius: '8px', fontWeight: 500, transition: 'all 0.2s ease', '&:hover': { backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.2), color: 'warning.dark' } }}
                      />
                    </motion.div>
                  ))
                ) : (
                  <Typography className="text-center text-gray-500 py-16 text-sm w-full">برچسبی وجود ندارد</Typography>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Media Preview */}
          <motion.div variants={cardVariants}>
            <Paper className="p-24 rounded-2xl" sx={{ backgroundColor: 'background.paper' }}>
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-12">
                  <Box className="w-36 h-36 rounded-lg flex items-center justify-center" sx={{ background: (theme) => `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})` }}>
                    <FuseSvgIcon className="text-white" size={18}>heroicons-outline:photograph</FuseSvgIcon>
                  </Box>
                  <Typography className="font-bold">رسانه‌های اخیر</Typography>
                </div>
                <IconButton component={Link} to="/apps/weblog/media" size="small" sx={{ color: 'text.secondary' }}>
                  <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
                </IconButton>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                {media.length > 0 ? (
                  media.slice(0, 6).map((item) => (
                    <motion.div key={item.id} whileHover={{ scale: 1.05 }} className="aspect-square rounded-xl overflow-hidden cursor-pointer">
                      <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
                    </motion.div>
                  ))
                ) : (
                  <Typography className="text-center text-gray-500 py-16 text-sm col-span-3">رسانه‌ای وجود ندارد</Typography>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;
