export const DATE_RANGES = [
  { label: '۳۰ روز اخیر', value: '30d', days: 30 },
  { label: '۳ ماه اخیر', value: '3m', days: 90 },
  { label: '۶ ماه اخیر', value: '6m', days: 180 },
  { label: 'یک سال اخیر', value: '1y', days: 365 },
  { label: 'همه', value: 'all', days: null },
];

export const STATUS_OPTIONS = [
  { label: 'همه', value: '' },
  { label: 'موفق', value: 'SUCCESS' },
  { label: 'ناموفق', value: 'FAIL' },
  { label: 'در حال انجام', value: 'IN_PROGRESS' },
  { label: 'در انتظار بررسی', value: 'PENDING_REVIEW' },
  { label: 'در انتظار', value: 'PENDING' },
];

export const TRANSACTION_TYPE_OPTIONS = [
  { label: 'همه', value: 'all' },
  { label: 'افزایش اعتبار', value: 'INCREASE_CREDIT' },
  { label: 'خرید اشتراک', value: 'BUY_SUBSCRIPTION' },
  { label: 'کاهش اعتبار', value: 'DECREASE_CREDIT' },
  { label: 'انتقال اعتبار', value: 'TRANSFER_CREDIT' },
  // Backend maps PAYMENT → INCREASE_CREDIT
  { label: 'پرداخت', value: 'PAYMENT' },
];

export const GRANULARITY_OPTIONS = [
  { label: 'روزانه', value: 'DAILY', titleSuffix: 'روزانه' },
  { label: 'هفتگی', value: 'WEEKLY', titleSuffix: 'هفتگی' },
  { label: 'ماهانه', value: 'MONTHLY', titleSuffix: 'ماهانه' },
];

export function toFarsiDigits(num) {
  if (num === null || num === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => farsiDigits[d]);
}

export function formatAmount(amount) {
  if (!amount && amount !== 0) return '۰';
  return new Intl.NumberFormat('fa-IR').format(amount);
}

/** Format a Date as yyyy-MM-dd in local timezone (API expects Gregorian). */
export function formatApiDate(date) {
  if (!date || Number.isNaN(date.getTime?.() ?? NaN)) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse yyyy-MM-dd into a local Date for Jalali DatePicker. */
export function parseApiDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getDateParams(days) {
  if (!days) return {};
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    dateFrom: formatApiDate(start),
    dateTo: formatApiDate(end),
  };
}

export function getGranularityLabel(value) {
  return GRANULARITY_OPTIONS.find((opt) => opt.value === value)?.titleSuffix || 'روزانه';
}

/** Shorten chart axis labels for DAILY / WEEKLY / MONTHLY formats from the API. */
export function formatChartAxisLabel(label) {
  if (!label) return '';
  const value = String(label);
  // Weekly: 2026-W24 (2026-06-09)
  const weekly = value.match(/^(\d{4}-W\d{2})\s*\((\d{4}-\d{2}-\d{2})\)$/);
  if (weekly) return `${weekly[1]}\n${weekly[2].slice(5)}`;
  // Monthly: 2026-06
  if (/^\d{4}-\d{2}$/.test(value)) return value;
  // Daily: 2026-06-11
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(5);
  return value;
}

export function buildWidgetQueryParams({
  dateRange,
  dateFrom,
  dateTo,
  status,
  user,
  userId,
  transactionType,
  granularity,
}) {
  let dateParams = {};

  if (dateFrom || dateTo) {
    dateParams = {
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    };
  } else if (dateRange && dateRange !== 'custom') {
    const range = DATE_RANGES.find((r) => r.value === dateRange);
    dateParams = getDateParams(range?.days);
  }

  // Backend maps PAYMENT → INCREASE_CREDIT
  const resolvedType =
    transactionType === 'PAYMENT' ? 'INCREASE_CREDIT' : transactionType;

  return {
    ...dateParams,
    ...(status ? { status } : {}),
    ...(user ? { user } : {}),
    ...(userId ? { userId } : {}),
    ...(resolvedType && resolvedType !== 'all' ? { transactionType: resolvedType } : {}),
    ...(granularity ? { granularity } : {}),
  };
}

export function getTransactionStatusColor(status) {
  if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'DONE') return 'success';
  if (status === 'PENDING' || status === 'IN_PROGRESS' || status === 'PENDING_REVIEW') return 'warning';
  if (status === 'FAIL' || status === 'FAILED') return 'error';
  return 'default';
}

export function getPaymentStatusColor(status) {
  if (
    status === 'SUCCESS' ||
    status === 'COMPLETED' ||
    status === 'DONE' ||
    status === 'done' ||
    status === 'success'
  ) {
    return 'success';
  }
  if (
    status === 'PENDING' ||
    status === 'IN_PROGRESS' ||
    status === 'PENDING_REVIEW' ||
    status === 'WARNING' ||
    status === 'warning' ||
    status === 'pending'
  ) {
    return 'warning';
  }
  if (
    status === 'FAIL' ||
    status === 'FAILED' ||
    status === 'DANGER' ||
    status === 'failed' ||
    status === 'danger'
  ) {
    return 'error';
  }
  return 'default';
}

export function parseTimeSeriesChart(chartData) {
  if (!chartData) return { categories: [], series: [] };
  if (chartData.labels && chartData.series) {
    return {
      categories: chartData.labels,
      series: chartData.series.map((s) => ({
        name: s.name,
        type: s.type,
        data: s.data || [],
      })),
    };
  }
  return { categories: [], series: [] };
}

export function parsePieChartItems(chartData) {
  if (!chartData?.items?.length) return { labels: [], series: [], items: [] };
  return {
    labels: chartData.items.map((item) => item.label),
    series: chartData.items.map((item) => item.count),
    items: chartData.items,
  };
}

export const CHART_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
