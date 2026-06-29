import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  GetApp as DownloadIcon,
  RestoreFromTrash as RestoreIcon,
  Delete as DeleteIcon,
  Business as CompanyIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  InsertDriveFile as FileIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  Close as XIcon,
  Image as ImageIcon,
  Email as EmailIcon,
  Language as WebIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Badge as BadgeIcon,
  DataObject as DataIcon,
} from '@mui/icons-material';
import { format } from 'date-fns-jalali';
import { motion, AnimatePresence } from 'framer-motion';

const fieldLabels = {
  id: 'شناسه',
  name: 'نام',
  companyName: 'نام شرکت',
  title: 'عنوان',
  status: 'وضعیت',
  active: 'فعال',
  enabled: 'فعال',
  isActive: 'فعال',
  phone: 'تلفن',
  phoneNumber: 'شماره تلفن',
  telephone: 'تلفن',
  tel: 'تلفن',
  mobile: 'موبایل',
  mobileNumber: 'شماره موبایل',
  fax: 'فکس',
  faxNumber: 'شماره فکس',
  email: 'ایمیل',
  emailAddress: 'آدرس ایمیل',
  website: 'وب‌سایت',
  webSite: 'وب‌سایت',
  url: 'آدرس وب',
  address: 'آدرس',
  fullAddress: 'آدرس کامل',
  postalCode: 'کد پستی',
  zipCode: 'کد پستی',
  city: 'شهر',
  cityName: 'نام شهر',
  province: 'استان',
  provinceName: 'نام استان',
  state: 'استان',
  country: 'کشور',
  countryName: 'نام کشور',
  latitude: 'عرض جغرافیایی',
  longitude: 'طول جغرافیایی',
  lat: 'عرض جغرافیایی',
  lng: 'طول جغرافیایی',
  region: 'منطقه',
  district: 'ناحیه',
  registrationNumber: 'شماره ثبت',
  nationalId: 'شناسه ملی',
  nationalCode: 'کد ملی',
  economicCode: 'کد اقتصادی',
  taxId: 'شناسه مالیاتی',
  licenseNumber: 'شماره مجوز',
  licenseExpiry: 'تاریخ انقضای مجوز',
  bankAccount: 'حساب بانکی',
  iban: 'شبا',
  description: 'توضیحات',
  note: 'یادداشت',
  notes: 'یادداشت‌ها',
  comment: 'توضیح',
  comments: 'نظرات',
  type: 'نوع',
  category: 'دسته‌بندی',
  categoryName: 'نام دسته‌بندی',
  code: 'کد',
  barcode: 'بارکد',
  price: 'قیمت',
  amount: 'مبلغ',
  quantity: 'تعداد',
  weight: 'وزن',
  size: 'اندازه',
  color: 'رنگ',
  brand: 'برند',
  brandName: 'نام برند',
  model: 'مدل',
  version: 'نسخه',
  createdAt: 'تاریخ ایجاد',
  updatedAt: 'تاریخ بروزرسانی',
  createdDate: 'تاریخ ایجاد',
  modifiedDate: 'تاریخ ویرایش',
  deletedAt: 'تاریخ حذف',
  createdBy: 'ایجاد کننده',
  updatedBy: 'بروزرسانی کننده',
  modifiedBy: 'ویرایش کننده',
  owner: 'مالک',
  ownerName: 'نام مالک',
  manager: 'مدیر',
  managerName: 'نام مدیر',
  ceo: 'مدیرعامل',
  ceoName: 'نام مدیرعامل',
  representative: 'نماینده',
  contactPerson: 'شخص رابط',
  firstName: 'نام',
  lastName: 'نام خانوادگی',
  fullName: 'نام کامل',
  username: 'نام کاربری',
  password: 'رمز عبور',
  role: 'نقش',
  roles: 'نقش‌ها',
  permission: 'دسترسی',
  permissions: 'دسترسی‌ها',
  image: 'تصویر',
  logo: 'لوگو',
  avatar: 'آواتار',
  photo: 'عکس',
  file: 'فایل',
  files: 'فایل‌ها',
  attachment: 'پیوست',
  attachments: 'پیوست‌ها',
  fileName: 'نام فایل',
  fileSize: 'حجم فایل',
  fileType: 'نوع فایل',
  mimeType: 'نوع فایل',
  contentType: 'نوع محتوا',
  archiveType: 'نوع آرشیو',
  entityType: 'نوع موجودیت',
  entityId: 'شناسه موجودیت',
  entityName: 'نام موجودیت',
  companyId: 'شناسه شرکت',
  productId: 'شناسه محصول',
  userId: 'شناسه کاربر',
  parentId: 'شناسه والد',
  parent: 'والد',
  children: 'فرزندان',
  tags: 'برچسب‌ها',
  label: 'برچسب',
  priority: 'اولویت',
  order: 'ترتیب',
  sortOrder: 'ترتیب مرتب‌سازی',
  count: 'تعداد',
  total: 'مجموع',
  average: 'میانگین',
  min: 'حداقل',
  max: 'حداکثر',
  percentage: 'درصد',
  ratio: 'نسبت',
  rate: 'نرخ',
  score: 'امتیاز',
  rating: 'رتبه‌بندی',
  level: 'سطح',
  grade: 'درجه',
  rank: 'رتبه',
  industry: 'صنعت',
  sector: 'بخش',
  field: 'رشته',
  speciality: 'تخصص',
  capacity: 'ظرفیت',
  production: 'تولید',
  productionCapacity: 'ظرفیت تولید',
  employeeCount: 'تعداد کارکنان',
  establishedDate: 'تاریخ تأسیس',
  foundedYear: 'سال تأسیس',
  standard: 'استاندارد',
  certification: 'گواهینامه',
  iso: 'ایزو',
  halal: 'حلال',
  organic: 'ارگانیک',
};

const contactPatterns = ['phone', 'tel', 'fax', 'mobile', 'email', 'website', 'url', 'web', 'contact'];
const locationPatterns = ['address', 'city', 'province', 'state', 'country', 'postal', 'zip', 'region', 'district', 'lat', 'lng', 'longitude', 'latitude', 'location', 'geo'];
const financialPatterns = ['registration', 'national', 'economic', 'tax', 'license', 'bank', 'iban', 'account', 'code', 'number'];
const filePatterns = ['file', 'image', 'logo', 'avatar', 'photo', 'attachment', 'thumbnail', 'picture', 'document', 'media'];
const datePatterns = ['date', 'time', 'created', 'updated', 'modified', 'deleted', 'expired', 'expiry', 'At', 'Date'];

function categorizeField(key) {
  const lowerKey = key.toLowerCase();
  if (contactPatterns.some(p => lowerKey.includes(p))) return 'contact';
  if (locationPatterns.some(p => lowerKey.includes(p))) return 'location';
  if (financialPatterns.some(p => lowerKey.includes(p))) return 'financial';
  if (filePatterns.some(p => lowerKey.includes(p))) return 'files';
  if (['name', 'title', 'status', 'active', 'enabled', 'type', 'category', 'description', 'companyname'].some(p => lowerKey.includes(p))) return 'basic';
  return 'other';
}

const sectionConfig = {
  basic: { label: 'اطلاعات اصلی', icon: <CompanyIcon />, color: '#1976d2' },
  contact: { label: 'اطلاعات تماس', icon: <PhoneIcon />, color: '#388e3c' },
  location: { label: 'موقعیت مکانی', icon: <LocationIcon />, color: '#f57c00' },
  financial: { label: 'اطلاعات مالی و ثبتی', icon: <MoneyIcon />, color: '#7b1fa2' },
  files: { label: 'فایل‌ها و تصاویر', icon: <FileIcon />, color: '#c62828' },
  other: { label: 'سایر اطلاعات', icon: <InfoIcon />, color: '#546e7a' },
};

function isDateValue(value) {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{4}\/\d{2}\/\d{2}/.test(value);
}

function formatDateValue(value) {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return format(d, 'yyyy/MM/dd - HH:mm');
  } catch {
    return value;
  }
}

function formatNumber(value) {
  if (typeof value === 'number') {
    return value.toLocaleString('fa-IR');
  }
  if (typeof value === 'string' && /^\d+$/.test(value) && value.length < 15) {
    return parseInt(value, 10).toLocaleString('fa-IR');
  }
  return value;
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '-';
  const num = Number(bytes);
  if (num < 1024) return `${num} بایت`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} کیلوبایت`;
  return `${(num / (1024 * 1024)).toFixed(1)} مگابایت`;
}

function getFieldLabel(key) {
  if (fieldLabels[key]) return fieldLabels[key];
  const readable = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .trim();
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function parseArchiveContent(archive) {
  let content = null;
  if (archive.base64Data) {
    try {
      const decoded = atob(archive.base64Data);
      content = JSON.parse(decoded);
    } catch {
      return null;
    }
  } else if (archive.content) {
    if (typeof archive.content === 'object') {
      content = archive.content;
    } else if (typeof archive.content === 'string') {
      try {
        content = JSON.parse(archive.content);
      } catch {
        return null;
      }
    }
  }
  return content;
}

function flattenObject(obj, prefix = '') {
  const result = {};
  if (!obj || typeof obj !== 'object') return result;

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      const nested = flattenObject(value, fullKey);
      Object.assign(result, nested);
    } else {
      result[fullKey] = value;
    }
  });
  return result;
}

function FieldValue({ fieldKey, value }) {
  const theme = useTheme();

  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'boolean') {
    return value ? (
      <Chip icon={<CheckIcon />} label="بله" size="small" color="success" variant="outlined" />
    ) : (
      <Chip icon={<XIcon />} label="خیر" size="small" color="error" variant="outlined" />
    );
  }

  if (isDateValue(value)) {
    return (
      <Chip
        icon={<CalendarIcon sx={{ fontSize: 16 }} />}
        label={formatDateValue(value)}
        size="small"
        variant="outlined"
        color="info"
      />
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <Typography variant="body2" color="text.secondary">خالی</Typography>;
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {value.map((item, idx) => (
          <Chip
            key={idx}
            label={typeof item === 'object' ? JSON.stringify(item) : String(item)}
            size="small"
            variant="outlined"
            sx={{ maxWidth: 300 }}
          />
        ))}
      </Box>
    );
  }

  if (typeof value === 'number') {
    return <Typography variant="body2" fontWeight={500}>{formatNumber(value)}</Typography>;
  }

  const strVal = String(value);
  if (strVal.length > 200) {
    return (
      <Typography variant="body2" sx={{ maxWidth: 400, wordBreak: 'break-word' }}>
        {strVal}
      </Typography>
    );
  }

  return <Typography variant="body2" fontWeight={500}>{strVal}</Typography>;
}

function SectionCard({ sectionKey, fields, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();
  const config = sectionConfig[sectionKey] || sectionConfig.other;

  if (!fields || fields.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          overflow: 'hidden',
          border: `1px solid ${alpha(config.color, 0.3)}`,
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(config.color, 0.08)} 0%, ${alpha(config.color, 0.02)} 100%)`,
            borderBottom: expanded ? `1px solid ${alpha(config.color, 0.2)}` : 'none',
            cursor: 'pointer',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(config.color, 0.12)} 0%, ${alpha(config.color, 0.04)} 100%)`,
            },
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: alpha(config.color, 0.15), color: config.color, width: 36, height: 36 }}>
              {config.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} color={config.color}>
                {config.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fields.length} فیلد
              </Typography>
            </Box>
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ p: 0 }}>
            {fields.map(([key, value], idx) => (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  px: 2.5,
                  borderBottom: idx < fields.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                  minHeight: 48,
                  gap: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 140, flexShrink: 0 }}
                >
                  {getFieldLabel(key.split('.').pop())}
                </Typography>
                <Box sx={{ textAlign: 'left', direction: 'ltr' }}>
                  <FieldValue fieldKey={key} value={value} />
                </Box>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Card>
    </motion.div>
  );
}

function FileMetadataGrid({ fileMetadata }) {
  const theme = useTheme();
  let files = [];

  if (typeof fileMetadata === 'string') {
    try {
      files = JSON.parse(fileMetadata);
    } catch {
      return <Typography variant="body2">{fileMetadata}</Typography>;
    }
  } else if (Array.isArray(fileMetadata)) {
    files = fileMetadata;
  } else if (typeof fileMetadata === 'object' && fileMetadata !== null) {
    files = [fileMetadata];
  }

  if (!files.length) return null;

  const isImageFile = (name) => {
    if (!name) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(name);
  };

  return (
    <Grid container spacing={2}>
      {files.map((file, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <Box
              sx={{
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              {isImageFile(file.fileName || file.name) ? (
                <ImageIcon sx={{ fontSize: 40, color: 'primary.light' }} />
              ) : (
                <FileIcon sx={{ fontSize: 40, color: 'action.active' }} />
              )}
            </Box>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {file.fileName || file.name || `فایل ${idx + 1}`}
              </Typography>
              {(file.fileSize || file.size) && (
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.fileSize || file.size)}
                </Typography>
              )}
              {(file.contentType || file.mimeType || file.type) && (
                <Chip
                  label={file.contentType || file.mimeType || file.type}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 0.5, maxWidth: '100%' }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function MetadataTab({ archive }) {
  const theme = useTheme();
  const metadata = archive?.metadata || {};

  const archiveTypeLabels = {
    MANUAL: 'آرشیو دستی',
    AUTOMATIC_BACKUP: 'پشتیبان خودکار',
    AUTOMATIC_ROLLBACK: 'بازگشت خودکار',
    BEFORE_UPDATE: 'قبل از بروزرسانی',
    AFTER_UPDATE: 'بعد از بروزرسانی',
  };

  let fileMetadata = null;
  const otherMeta = {};
  Object.entries(metadata).forEach(([key, value]) => {
    if (key === 'fileMetadata') {
      fileMetadata = value;
    } else {
      otherMeta[key] = value;
    }
  });

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {archive.entityType && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.06)} 0%, transparent 100%)`,
              }}
            >
              <Typography variant="caption" color="text.secondary">نوع موجودیت</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={archive.entityType || metadata.entityType} color="info" variant="outlined" />
              </Box>
            </Paper>
          </Grid>
        )}
        {(archive.archiveType || metadata.archiveType) && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 100%)`,
              }}
            >
              <Typography variant="caption" color="text.secondary">نوع آرشیو</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={archiveTypeLabels[archive.archiveType || metadata.archiveType] || archive.archiveType || metadata.archiveType}
                  color="primary"
                />
              </Box>
            </Paper>
          </Grid>
        )}
        {(metadata.companyName || archive.name) && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.06)} 0%, transparent 100%)`,
              }}
            >
              <Typography variant="caption" color="text.secondary">نام شرکت</Typography>
              <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                {metadata.companyName || archive.name}
              </Typography>
            </Paper>
          </Grid>
        )}
        {archive.createdAt && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="caption" color="text.secondary">تاریخ ایجاد</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                {formatDateValue(archive.createdAt)}
              </Typography>
            </Paper>
          </Grid>
        )}
        {archive.createdBy && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="caption" color="text.secondary">ایجاد کننده</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                {archive.createdBy}
              </Typography>
            </Paper>
          </Grid>
        )}
        {(archive.entityId || metadata.entityId) && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="caption" color="text.secondary">شناسه موجودیت</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5, direction: 'ltr', textAlign: 'right' }}>
                {archive.entityId || metadata.entityId}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {Object.keys(otherMeta).length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), color: 'warning.main', width: 36, height: 36 }}><DataIcon /></Avatar>}
            title={<Typography variant="subtitle1" fontWeight={600}>سایر متادیتا</Typography>}
            sx={{ pb: 0 }}
          />
          <CardContent>
            {Object.entries(otherMeta).map(([key, value], idx) => (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  borderBottom: idx < Object.entries(otherMeta).length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  {getFieldLabel(key)}
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ direction: 'ltr', textAlign: 'left', wordBreak: 'break-word', maxWidth: 400 }}>
                  {typeof value === 'object' ? JSON.stringify(value) : isDateValue(String(value)) ? formatDateValue(value) : String(value)}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {fileMetadata && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileIcon color="action" /> فایل‌های پیوست
          </Typography>
          <FileMetadataGrid fileMetadata={fileMetadata} />
        </Box>
      )}
    </Box>
  );
}

function ContentTab({ archive }) {
  const content = useMemo(() => parseArchiveContent(archive), [archive]);

  if (!content || typeof content !== 'object') {
    const rawText = archive.base64Data
      ? (() => { try { return atob(archive.base64Data); } catch { return null; } })()
      : archive.content
        ? typeof archive.content === 'string' ? archive.content : JSON.stringify(archive.content, null, 2)
        : null;

    if (!rawText) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">محتوایی برای نمایش وجود ندارد</Typography>
        </Box>
      );
    }

    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <pre style={{ overflow: 'auto', maxHeight: 500, margin: 0, fontSize: 13, direction: 'ltr', textAlign: 'left' }}>
          {rawText.substring(0, 10000)}{rawText.length > 10000 ? '\n... (ادامه دارد)' : ''}
        </pre>
      </Paper>
    );
  }

  const flat = flattenObject(content);
  const sections = { basic: [], contact: [], location: [], financial: [], files: [], other: [] };

  Object.entries(flat).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (key === 'id' && typeof value === 'number') return;
    const cat = categorizeField(key);
    sections[cat].push([key, value]);
  });

  const nonEmptySections = Object.entries(sections).filter(([, fields]) => fields.length > 0);

  if (nonEmptySections.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <DescriptionIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">محتوایی برای نمایش وجود ندارد</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {nonEmptySections.map(([sectionKey, fields], idx) => (
        <SectionCard
          key={sectionKey}
          sectionKey={sectionKey}
          fields={fields}
          defaultExpanded={idx < 3}
        />
      ))}
    </Box>
  );
}

function ArchiveDetailsDialog({ open, onClose, archive, onRollback, onDelete }) {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const handleDownload = () => {
    if (!archive) return;
    try {
      let content;
      if (archive.base64Data) {
        content = atob(archive.base64Data);
      } else if (typeof archive.content === 'object') {
        content = JSON.stringify(archive.content, null, 2);
      } else if (archive.content) {
        content = archive.content;
      } else {
        content = JSON.stringify(archive, null, 2);
      }

      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = archive.fileName || `archive-${archive.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading archive:', error);
    }
  };

  if (!archive) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' },
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          px: 3,
          py: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {archive?.name || 'جزئیات آرشیو'}
            </Typography>
            {archive.description && (
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                {archive.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="دانلود آرشیو">
              <IconButton onClick={handleDownload} sx={{ color: 'white' }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            {onRollback && (
              <Tooltip title="بازگشت به این آرشیو">
                <IconButton onClick={onRollback} sx={{ color: 'white' }}>
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="حذف آرشیو">
                <IconButton onClick={onDelete} sx={{ color: alpha('#fff', 0.8) }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab label="محتوای آرشیو" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="متادیتا و اطلاعات" icon={<DataIcon />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <ContentTab archive={archive} />
              </motion.div>
            )}
            {activeTab === 1 && (
              <motion.div key="metadata" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <MetadataTab archive={archive} />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          بستن
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ArchiveDetailsDialog;
