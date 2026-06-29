import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Avatar,
  Collapse,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  CompareArrows as CompareIcon,
  CheckCircle as SameIcon,
  Business as CompanyIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  InsertDriveFile as FileIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useCompareArchivesQuery } from './store/archiveApi';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns-jalali';

const fieldLabels = {
  id: 'شناسه', name: 'نام', companyName: 'نام شرکت', title: 'عنوان',
  status: 'وضعیت', active: 'فعال', enabled: 'فعال', isActive: 'فعال',
  phone: 'تلفن', phoneNumber: 'شماره تلفن', telephone: 'تلفن', tel: 'تلفن',
  mobile: 'موبایل', mobileNumber: 'شماره موبایل', fax: 'فکس', faxNumber: 'شماره فکس',
  email: 'ایمیل', emailAddress: 'آدرس ایمیل', website: 'وب‌سایت', webSite: 'وب‌سایت',
  url: 'آدرس وب', address: 'آدرس', fullAddress: 'آدرس کامل', postalCode: 'کد پستی',
  zipCode: 'کد پستی', city: 'شهر', cityName: 'نام شهر', province: 'استان',
  provinceName: 'نام استان', state: 'استان', country: 'کشور', countryName: 'نام کشور',
  latitude: 'عرض جغرافیایی', longitude: 'طول جغرافیایی', region: 'منطقه', district: 'ناحیه',
  registrationNumber: 'شماره ثبت', nationalId: 'شناسه ملی', nationalCode: 'کد ملی',
  economicCode: 'کد اقتصادی', taxId: 'شناسه مالیاتی', licenseNumber: 'شماره مجوز',
  bankAccount: 'حساب بانکی', iban: 'شبا', description: 'توضیحات', note: 'یادداشت',
  type: 'نوع', category: 'دسته‌بندی', code: 'کد', barcode: 'بارکد',
  price: 'قیمت', amount: 'مبلغ', quantity: 'تعداد', weight: 'وزن',
  brand: 'برند', model: 'مدل', version: 'نسخه',
  createdAt: 'تاریخ ایجاد', updatedAt: 'تاریخ بروزرسانی', createdBy: 'ایجاد کننده',
  updatedBy: 'بروزرسانی کننده', owner: 'مالک', manager: 'مدیر',
  ceo: 'مدیرعامل', firstName: 'نام', lastName: 'نام خانوادگی', fullName: 'نام کامل',
  image: 'تصویر', logo: 'لوگو', file: 'فایل', files: 'فایل‌ها',
  fileName: 'نام فایل', fileSize: 'حجم فایل', archiveType: 'نوع آرشیو',
  entityType: 'نوع موجودیت', entityId: 'شناسه موجودیت', entityName: 'نام موجودیت',
  industry: 'صنعت', capacity: 'ظرفیت', employeeCount: 'تعداد کارکنان',
  establishedDate: 'تاریخ تأسیس', standard: 'استاندارد', certification: 'گواهینامه',
};

const contactPatterns = ['phone', 'tel', 'fax', 'mobile', 'email', 'website', 'url', 'web', 'contact'];
const locationPatterns = ['address', 'city', 'province', 'state', 'country', 'postal', 'zip', 'region', 'district', 'lat', 'lng', 'longitude', 'latitude', 'location'];
const financialPatterns = ['registration', 'national', 'economic', 'tax', 'license', 'bank', 'iban', 'account', 'code'];
const filePatterns = ['file', 'image', 'logo', 'avatar', 'photo', 'attachment', 'thumbnail', 'media'];

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

function getFieldLabel(key) {
  const shortKey = key.split('.').pop();
  if (fieldLabels[shortKey]) return fieldLabels[shortKey];
  const readable = shortKey.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

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

function formatDisplayValue(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'بله ✓' : 'خیر ✗';
  if (typeof value === 'number') return value.toLocaleString('fa-IR');
  if (isDateValue(String(value))) return formatDateValue(value);
  if (Array.isArray(value)) return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join('، ');
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function getChangeType(diff) {
  const oldVal = diff?.old ?? diff?.oldValue ?? diff?.value1;
  const newVal = diff?.new ?? diff?.newValue ?? diff?.value2;
  const hasOld = oldVal !== null && oldVal !== undefined && oldVal !== '';
  const hasNew = newVal !== null && newVal !== undefined && newVal !== '';
  if (!hasOld && hasNew) return 'added';
  if (hasOld && !hasNew) return 'removed';
  return 'modified';
}

function getOldNew(diff) {
  return {
    old: diff?.old ?? diff?.oldValue ?? diff?.value1,
    new: diff?.new ?? diff?.newValue ?? diff?.value2,
  };
}

function isComplexValue(value) {
  if (typeof value === 'object' && value !== null) {
    const str = JSON.stringify(value);
    return str.length > 100;
  }
  return typeof value === 'string' && value.length > 200;
}

function ChangeSummary({ differences }) {
  const theme = useTheme();
  let added = 0, removed = 0, modified = 0;

  Object.values(differences).forEach(diff => {
    const type = getChangeType(diff);
    if (type === 'added') added++;
    else if (type === 'removed') removed++;
    else modified++;
  });

  const total = added + removed + modified;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          خلاصه تغییرات
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {total.toLocaleString('fa-IR')}
              </Typography>
              <Typography variant="caption" color="text.secondary">کل تغییرات</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {added.toLocaleString('fa-IR')}
              </Typography>
              <Typography variant="caption" color="text.secondary">فیلد اضافه شده</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {removed.toLocaleString('fa-IR')}
              </Typography>
              <Typography variant="caption" color="text.secondary">فیلد حذف شده</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {modified.toLocaleString('fa-IR')}
              </Typography>
              <Typography variant="caption" color="text.secondary">فیلد تغییر یافته</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
}

function CompareFieldRow({ field, diff }) {
  const theme = useTheme();
  const changeType = getChangeType(diff);
  const { old: oldVal, new: newVal } = getOldNew(diff);
  const [showDiff, setShowDiff] = useState(false);
  const needsFallback = isComplexValue(oldVal) || isComplexValue(newVal);

  const bgColor = {
    added: alpha(theme.palette.success.main, 0.06),
    removed: alpha(theme.palette.error.main, 0.06),
    modified: alpha(theme.palette.warning.main, 0.06),
  }[changeType];

  const borderColor = {
    added: alpha(theme.palette.success.main, 0.3),
    removed: alpha(theme.palette.error.main, 0.3),
    modified: alpha(theme.palette.warning.main, 0.3),
  }[changeType];

  const chipConfig = {
    added: { label: 'اضافه شده', color: 'success', icon: <AddIcon /> },
    removed: { label: 'حذف شده', color: 'error', icon: <RemoveIcon /> },
    modified: { label: 'تغییر یافته', color: 'warning', icon: <EditIcon /> },
  }[changeType];

  return (
    <Box
      sx={{
        bgcolor: bgColor,
        borderRight: `4px solid ${borderColor}`,
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 2.5,
        py: 2,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" fontWeight={600}>{getFieldLabel(field)}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={chipConfig.icon}
            label={chipConfig.label}
            size="small"
            color={chipConfig.color}
            variant="outlined"
          />
          {needsFallback && (
            <Tooltip title="نمایش تفاوت‌های جزئی">
              <IconButton size="small" onClick={() => setShowDiff(!showDiff)}>
                {showDiff ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {!needsFallback ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                bgcolor: changeType === 'added' ? 'transparent' : alpha(theme.palette.error.main, 0.04),
                borderColor: changeType === 'added' ? 'divider' : alpha(theme.palette.error.main, 0.2),
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                آرشیو اول (قدیمی)
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  direction: 'ltr',
                  textAlign: 'right',
                  wordBreak: 'break-word',
                  textDecoration: changeType === 'modified' ? 'line-through' : 'none',
                  opacity: changeType === 'added' ? 0.4 : 1,
                  color: changeType === 'removed' ? 'error.main' : 'text.primary',
                }}
              >
                {changeType === 'added' ? '(خالی)' : formatDisplayValue(oldVal)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                bgcolor: changeType === 'removed' ? 'transparent' : alpha(theme.palette.success.main, 0.04),
                borderColor: changeType === 'removed' ? 'divider' : alpha(theme.palette.success.main, 0.2),
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                آرشیو دوم (جدید)
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  direction: 'ltr',
                  textAlign: 'right',
                  wordBreak: 'break-word',
                  opacity: changeType === 'removed' ? 0.4 : 1,
                  color: changeType === 'added' ? 'success.main' : 'text.primary',
                  fontWeight: changeType === 'modified' ? 600 : 400,
                }}
              >
                {changeType === 'removed' ? '(خالی)' : formatDisplayValue(newVal)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 120, overflow: 'auto' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>آرشیو اول</Typography>
                <Typography variant="body2" sx={{ direction: 'ltr', textAlign: 'left', fontSize: 12, wordBreak: 'break-word' }}>
                  {formatDisplayValue(oldVal)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 120, overflow: 'auto' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>آرشیو دوم</Typography>
                <Typography variant="body2" sx={{ direction: 'ltr', textAlign: 'left', fontSize: 12, wordBreak: 'break-word' }}>
                  {formatDisplayValue(newVal)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Collapse in={showDiff}>
            <Box sx={{ mt: 2 }}>
              <ReactDiffViewer
                oldValue={typeof oldVal === 'object' ? JSON.stringify(oldVal, null, 2) : String(oldVal ?? '')}
                newValue={typeof newVal === 'object' ? JSON.stringify(newVal, null, 2) : String(newVal ?? '')}
                splitView
                leftTitle="آرشیو اول"
                rightTitle="آرشیو دوم"
                useDarkTheme={false}
              />
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}

function CompareSectionCard({ sectionKey, fields, differences, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();
  const config = sectionConfig[sectionKey] || sectionConfig.other;

  const changeCount = fields.length;
  const addedCount = fields.filter(f => getChangeType(differences[f]) === 'added').length;
  const removedCount = fields.filter(f => getChangeType(differences[f]) === 'removed').length;
  const modifiedCount = fields.filter(f => getChangeType(differences[f]) === 'modified').length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        variant="outlined"
        sx={{ mb: 2, overflow: 'hidden', border: `1px solid ${alpha(config.color, 0.3)}` }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(config.color, 0.1)} 0%, ${alpha(config.color, 0.03)} 100%)`,
            borderBottom: expanded ? `1px solid ${alpha(config.color, 0.2)}` : 'none',
            cursor: 'pointer',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(config.color, 0.15)} 0%, ${alpha(config.color, 0.05)} 100%)`,
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
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                {addedCount > 0 && <Chip label={`${addedCount} اضافه`} size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 11 }} />}
                {removedCount > 0 && <Chip label={`${removedCount} حذف`} size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: 11 }} />}
                {modifiedCount > 0 && <Chip label={`${modifiedCount} تغییر`} size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: 11 }} />}
              </Box>
            </Box>
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          {fields.map((field) => (
            <CompareFieldRow key={field} field={field} diff={differences[field]} />
          ))}
        </Collapse>
      </Card>
    </motion.div>
  );
}

function ArchiveCompareDialog({ firstArchiveId, secondArchiveId, onClose, onShowSnackbar }) {
  const theme = useTheme();
  const { data, isLoading, error } = useCompareArchivesQuery({
    archiveId1: firstArchiveId,
    archiveId2: secondArchiveId,
  });
  const [showAll, setShowAll] = useState(false);

  const archiveTypeLabels = {
    MANUAL: 'آرشیو دستی',
    AUTOMATIC_BACKUP: 'پشتیبان خودکار',
    AUTOMATIC_ROLLBACK: 'بازگشت خودکار',
    BEFORE_UPDATE: 'قبل از بروزرسانی',
    AFTER_UPDATE: 'بعد از بروزرسانی',
  };

  const groupedDifferences = useMemo(() => {
    if (!data?.differences) return {};
    const groups = { basic: [], contact: [], location: [], financial: [], files: [], other: [] };
    Object.keys(data.differences).forEach(field => {
      const cat = categorizeField(field);
      groups[cat].push(field);
    });
    return groups;
  }, [data?.differences]);

  const formatArchiveDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'yyyy/MM/dd - HH:mm');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white',
          px: 3,
          py: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CompareIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>مقایسه آرشیوها</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, flexDirection: 'column', gap: 2 }}>
            <CircularProgress />
            <Typography color="text.secondary">در حال بارگذاری اطلاعات مقایسه...</Typography>
          </Box>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.04) }}>
            <Typography color="error" variant="h6">خطا در بارگذاری داده‌های مقایسه</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>{error.message || 'خطای ناشناخته'}</Typography>
          </Paper>
        ) : (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    borderRight: `4px solid ${theme.palette.primary.main}`,
                    background: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Typography variant="overline" color="primary.main" fontWeight={700}>آرشیو اول (قدیمی)</Typography>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {data?.archive1?.name || data?.archive1?.id || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                      label={formatArchiveDate(data?.archive1?.createdAt)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={archiveTypeLabels[data?.archive1?.archiveType || data?.archive1?.metadata?.archiveType] || data?.archive1?.archiveType || '-'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    borderRight: `4px solid ${theme.palette.secondary.main}`,
                    background: alpha(theme.palette.secondary.main, 0.03),
                  }}
                >
                  <Typography variant="overline" color="secondary.main" fontWeight={700}>آرشیو دوم (جدید)</Typography>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {data?.archive2?.name || data?.archive2?.id || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                      label={formatArchiveDate(data?.archive2?.createdAt)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={archiveTypeLabels[data?.archive2?.archiveType || data?.archive2?.metadata?.archiveType] || data?.archive2?.archiveType || '-'}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {data?.differences && Object.keys(data.differences).length > 0 ? (
              <>
                <ChangeSummary differences={data.differences} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700}>جزئیات تغییرات</Typography>
                  <FormControlLabel
                    control={<Switch checked={showAll} onChange={(e) => setShowAll(e.target.checked)} size="small" />}
                    label={<Typography variant="body2">نمایش بخش‌های بدون تغییر</Typography>}
                  />
                </Box>

                {Object.entries(groupedDifferences).map(([sectionKey, fields]) => {
                  if (fields.length === 0 && !showAll) return null;
                  if (fields.length === 0) {
                    return (
                      <Card key={sectionKey} variant="outlined" sx={{ mb: 2, opacity: 0.5 }}>
                        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: 'action.hover' }}>
                            {sectionConfig[sectionKey]?.icon}
                          </Avatar>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">{sectionConfig[sectionKey]?.label}</Typography>
                            <Chip icon={<SameIcon />} label="بدون تغییر" size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                          </Box>
                        </Box>
                      </Card>
                    );
                  }
                  return (
                    <CompareSectionCard
                      key={sectionKey}
                      sectionKey={sectionKey}
                      fields={fields}
                      differences={data.differences}
                      defaultExpanded={fields.length > 0}
                    />
                  );
                })}
              </>
            ) : (
              <Paper
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: 2,
                }}
              >
                <SameIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main">هیچ تفاوتی بین دو آرشیو یافت نشد</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  محتوای هر دو آرشیو کاملاً یکسان است
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          بستن
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ArchiveCompareDialog;
