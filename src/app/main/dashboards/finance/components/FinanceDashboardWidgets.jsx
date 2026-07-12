import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Grid,
  useTheme,
  alpha,
  Avatar,
  LinearProgress,
  Fade,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  DATE_RANGES,
  STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  GRANULARITY_OPTIONS,
  toFarsiDigits,
  formatAmount,
  formatApiDate,
  parseApiDate,
  getDateParams,
  getGranularityLabel,
  formatChartAxisLabel,
  getTransactionStatusColor,
  parseTimeSeriesChart,
  parsePieChartItems,
  CHART_COLORS,
  containerVariants,
  itemVariants,
  getPaymentStatusColor,
} from '../financeDashboardUtils';

const pdfStyles = StyleSheet.create({
  page: { padding: 30, direction: 'rtl' },
  header: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  subHeader: { fontSize: 12, marginBottom: 10, textAlign: 'center', color: '#666' },
  table: { display: 'table', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    backgroundColor: '#f5f5f5',
  },
  tableCell: { flex: 1, padding: 6, fontSize: 9, textAlign: 'center' },
  tableHeaderCell: { flex: 1, padding: 6, fontSize: 10, textAlign: 'center', fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', padding: 10 },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  summaryLabel: { fontSize: 10, color: '#666', marginTop: 4 },
});

function PdfReport({ widgets, dateRange, transactions }) {
  const summary = widgets?.summary || {};
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>گزارش مالی داشبورد</Text>
        <Text style={pdfStyles.subHeader}>
          {dateRange === 'all' ? 'تمام دوره‌ها' : `بازه زمانی: ${DATE_RANGES.find((d) => d.value === dateRange)?.label || ''}`}
        </Text>
        <View style={pdfStyles.summaryRow}>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryValue}>{summary.transactionCount || 0}</Text>
            <Text style={pdfStyles.summaryLabel}>تعداد تراکنش</Text>
          </View>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryValue}>{summary.totalRevenue || 0}</Text>
            <Text style={pdfStyles.summaryLabel}>درآمد کل (ریال)</Text>
          </View>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryValue}>{summary.paymentCount || 0}</Text>
            <Text style={pdfStyles.summaryLabel}>تعداد پرداخت</Text>
          </View>
        </View>
        {transactions?.length > 0 && (
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeaderRow}>
              <Text style={pdfStyles.tableHeaderCell}>شناسه</Text>
              <Text style={pdfStyles.tableHeaderCell}>کاربر</Text>
              <Text style={pdfStyles.tableHeaderCell}>مبلغ</Text>
              <Text style={pdfStyles.tableHeaderCell}>وضعیت</Text>
              <Text style={pdfStyles.tableHeaderCell}>تاریخ</Text>
            </View>
            {transactions.slice(0, 30).map((t, i) => (
              <View key={i} style={pdfStyles.tableRow}>
                <Text style={pdfStyles.tableCell}>{t.refId || t.referenceCode || '-'}</Text>
                <Text style={pdfStyles.tableCell}>{t.username || '-'}</Text>
                <Text style={pdfStyles.tableCell}>{t.amount || 0}</Text>
                <Text style={pdfStyles.tableCell}>{t.statusStr || t.status || '-'}</Text>
                <Text style={pdfStyles.tableCell}>{t.createdStr || '-'}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

function ChartCard({ title, subtitle, children, accentColor, delay = 0, actions = null }) {
  const theme = useTheme();
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      transition={{ delay }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(accentColor || theme.palette.primary.main, 0.03)} 100%)`,
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 32px ${alpha(accentColor || theme.palette.primary.main, 0.12)}`,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            borderRadius: '0 0 0 100%',
            background: `linear-gradient(135deg, ${alpha(accentColor || theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
            mb: subtitle ? 0 : 2,
            position: 'relative',
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" gutterBottom={!subtitle} fontWeight="700">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Box>
        <Box sx={{ position: 'relative' }}>{children}</Box>
      </Paper>
    </motion.div>
  );
}

function GranularityToggle({ value, onChange }) {
  return (
    <ButtonGroup size="small" variant="outlined" sx={{ flexShrink: 0 }}>
      {GRANULARITY_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          variant={value === opt.value ? 'contained' : 'outlined'}
          color="primary"
          sx={{ fontSize: '11px', px: 1.25, whiteSpace: 'nowrap' }}
        >
          {opt.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

function FinanceDashboardWidgets({ widgets, isLoading, isFetching, filters, onFiltersChange }) {
  const theme = useTheme();
  const [usernameInput, setUsernameInput] = useState(filters.user || '');

  useEffect(() => {
    setUsernameInput(filters.user || '');
  }, [filters.user]);

  useEffect(() => {
    if (usernameInput === (filters.user || '')) return undefined;
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, user: usernameInput });
    }, 450);
    return () => clearTimeout(timer);
  }, [usernameInput, filters, onFiltersChange]);

  const handleDateRangePreset = useCallback(
    (rangeValue) => {
      const range = DATE_RANGES.find((r) => r.value === rangeValue);
      const dates = getDateParams(range?.days);
      onFiltersChange({
        ...filters,
        dateRange: rangeValue,
        dateFrom: dates.dateFrom || '',
        dateTo: dates.dateTo || '',
      });
    },
    [filters, onFiltersChange]
  );

  const handleDateFromChange = useCallback(
    (date) => {
      const nextFrom = formatApiDate(date) || '';
      onFiltersChange({
        ...filters,
        dateRange: 'custom',
        dateFrom: nextFrom,
      });
    },
    [filters, onFiltersChange]
  );

  const handleDateToChange = useCallback(
    (date) => {
      const nextTo = formatApiDate(date) || '';
      onFiltersChange({
        ...filters,
        dateRange: 'custom',
        dateTo: nextTo,
      });
    },
    [filters, onFiltersChange]
  );

  const handleGranularityChange = useCallback(
    (value) => {
      onFiltersChange({ ...filters, granularity: value });
    },
    [filters, onFiltersChange]
  );

  const handleExportExcel = useCallback(() => {
    const transData = widgets?.recentTransactions?.rows || [];
    const payData = widgets?.recentPayments?.rows || [];
    const wb = XLSX.utils.book_new();

    const transHeaders = ['شناسه', 'کاربر', 'سرویس', 'مبلغ (ریال)', 'وضعیت', 'تاریخ'];
    const transRows = transData.map((t) => [
      t.refId || t.referenceCode || '',
      t.username || '',
      t.serviceName || t.transactionType || '',
      t.amount || 0,
      t.statusStr || t.status || '',
      t.createdStr || '',
    ]);
    const transSheet = XLSX.utils.aoa_to_sheet([transHeaders, ...transRows]);
    XLSX.utils.book_append_sheet(wb, transSheet, 'تراکنش‌ها');

    const payHeaders = ['شناسه', 'کاربر', 'سرویس', 'مبلغ (ریال)', 'وضعیت', 'تاریخ'];
    const payRows = payData.map((p) => [
      p.refId || (p.id ? String(p.id).substring(0, 8) : ''),
      p.username || '',
      p.serviceName || p.service || '',
      p.amount || 0,
      p.statusStr || p.status || '',
      p.createdStr || p.createdAtStr || '',
    ]);
    const paySheet = XLSX.utils.aoa_to_sheet([payHeaders, ...payRows]);
    XLSX.utils.book_append_sheet(wb, paySheet, 'پرداخت‌ها');

    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbOut], { type: 'application/octet-stream' }), `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [widgets]);

  const handleExportPdf = useCallback(async () => {
    const transData = widgets?.recentTransactions?.rows || [];
    const blob = await pdf(
      <PdfReport widgets={widgets} dateRange={filters.dateRange} transactions={transData} />
    ).toBlob();
    saveAs(blob, `financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }, [widgets, filters.dateRange]);

  const kpiCards = useMemo(() => {
    if (!widgets) return [];
    const summary = widgets.summary || {};
    const ts = widgets.transactionSummary || {};
    const ps = widgets.paymentSummary || {};
    const totalCount = summary.transactionCount ?? ts.totalCount ?? 0;
    const completedCount = ts.completedCount ?? 0;
    const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const totalRevenue = summary.totalRevenue ?? ts.totalAmount ?? 0;
    const avgAmount = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

    return [
      {
        title: summary.totalRevenueLabel || 'درآمد کل',
        value: formatAmount(totalRevenue),
        unit: 'ریال',
        icon: 'heroicons-solid:currency-dollar',
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.12),
        change: ts.growthRate,
        hint: 'فقط تراکنش‌های موفق افزایش اعتبار',
      },
      {
        title: summary.transactionCountLabel || 'تعداد تراکنش‌ها',
        value: toFarsiDigits(totalCount),
        unit: '',
        icon: 'heroicons-solid:receipt-percent',
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.12),
      },
      {
        title: summary.paymentCountLabel || 'تعداد پرداختی‌ها',
        value: toFarsiDigits(summary.paymentCount ?? ps.totalCount ?? 0),
        unit: '',
        icon: 'heroicons-solid:credit-card',
        color: theme.palette.secondary.main,
        bgColor: alpha(theme.palette.secondary.main, 0.12),
      },
      {
        title: 'نرخ موفقیت',
        value: toFarsiDigits(successRate),
        unit: '٪',
        icon: 'heroicons-solid:check-circle',
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.12),
      },
      {
        title: 'میانگین مبلغ',
        value: formatAmount(avgAmount),
        unit: 'ریال',
        icon: 'heroicons-solid:calculator',
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.12),
      },
      {
        title: 'نرخ رشد',
        value: toFarsiDigits(Math.abs(ts.growthRate || 0)),
        unit: '٪',
        icon: (ts.growthRate || 0) >= 0 ? 'heroicons-solid:trending-up' : 'heroicons-solid:trending-down',
        color: (ts.growthRate || 0) >= 0 ? theme.palette.success.main : theme.palette.error.main,
        bgColor: alpha((ts.growthRate || 0) >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.12),
        change: ts.growthRate,
      },
    ];
  }, [widgets, theme]);

  const baseChartConfig = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        fontFamily: 'inherit',
        foreColor: theme.palette.text.secondary,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: { enabled: true, delay: 120 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
      },
      grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
      tooltip: { theme: theme.palette.mode },
    }),
    [theme]
  );

  const revenueChart = useMemo(() => {
    const { categories, series } = parseTimeSeriesChart(widgets?.revenueChart);
    const data = series[0]?.data || [];
    return {
      options: {
        ...baseChartConfig,
        chart: { ...baseChartConfig.chart, type: 'area', sparkline: { enabled: false } },
        colors: [theme.palette.primary.main],
        fill: {
          type: 'gradient',
          gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
        },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
          categories,
          labels: {
            rotate: -45,
            style: { fontSize: '10px' },
            formatter: (val) => formatChartAxisLabel(val),
          },
        },
        yaxis: {
          labels: { formatter: (val) => formatAmount(Math.round(val)), style: { fontSize: '11px' } },
        },
        tooltip: { y: { formatter: (val) => `${formatAmount(val)} ریال` } },
        dataLabels: { enabled: false },
      },
      series: [{ name: series[0]?.name || 'درآمد', data }],
    };
  }, [widgets, theme, baseChartConfig]);

  const statusDonutChart = useMemo(() => {
    const chartData = widgets?.transactionStatusChart;
    const { labels, series, items } = parsePieChartItems(chartData);
    const total = items.reduce((sum, item) => sum + (item.count || 0), 0);
    return {
      options: {
        ...baseChartConfig,
        chart: { ...baseChartConfig.chart, type: 'donut' },
        labels,
        colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.info.main, theme.palette.warning.main],
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: true, formatter: (val) => `${toFarsiDigits(Math.round(val))}٪` },
        plotOptions: {
          pie: {
            donut: {
              size: '68%',
              labels: {
                show: true,
                total: { show: true, label: 'مجموع', formatter: () => toFarsiDigits(total) },
              },
            },
          },
        },
      },
      series,
      title: chartData?.title,
      subtitle: chartData?.subtitle,
    };
  }, [widgets, theme, baseChartConfig]);

  const typeDonutChart = useMemo(() => {
    const chartData = widgets?.transactionTypeChart;
    const { labels, series, items } = parsePieChartItems(chartData);
    const total = items.reduce((sum, item) => sum + (item.count || 0), 0);
    return {
      options: {
        ...baseChartConfig,
        chart: { ...baseChartConfig.chart, type: 'donut' },
        labels,
        colors: CHART_COLORS,
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: true, formatter: (val) => `${toFarsiDigits(Math.round(val))}٪` },
        plotOptions: {
          pie: {
            donut: {
              size: '68%',
              labels: {
                show: true,
                total: { show: true, label: 'مجموع', formatter: () => toFarsiDigits(total) },
              },
            },
          },
        },
      },
      series,
      title: chartData?.title,
      subtitle: chartData?.subtitle,
    };
  }, [widgets, theme, baseChartConfig]);

  const subCategoryDonutChart = useMemo(() => {
    const chartData = widgets?.buySubscriptionSubCategoryChart;
    const { labels, series } = parsePieChartItems(chartData);
    return {
      options: {
        ...baseChartConfig,
        chart: { ...baseChartConfig.chart, type: 'pie' },
        labels,
        colors: CHART_COLORS,
        legend: { position: 'bottom', fontSize: '11px' },
        dataLabels: { enabled: true, formatter: (val) => `${toFarsiDigits(Math.round(val))}٪` },
      },
      series,
      title: chartData?.title,
      subtitle: chartData?.subtitle,
    };
  }, [widgets, theme, baseChartConfig]);

  const buildColumnChart = useCallback(
    (chartData, color) => {
      const { categories, series } = parseTimeSeriesChart(chartData);
      const data = series[0]?.data || [];
      return {
        options: {
          ...baseChartConfig,
          chart: { ...baseChartConfig.chart, type: 'bar' },
          colors: [color],
          plotOptions: { bar: { borderRadius: 6, columnWidth: '60%' } },
          xaxis: {
            categories,
            labels: {
              rotate: -45,
              style: { fontSize: '10px' },
              formatter: (val) => formatChartAxisLabel(val),
            },
          },
          yaxis: { labels: { formatter: (val) => toFarsiDigits(Math.round(val)), style: { fontSize: '11px' } } },
          dataLabels: { enabled: false },
        },
        series: [{ name: series[0]?.name || '', data }],
      };
    },
    [baseChartConfig]
  );

  const transactionsColumnChart = useMemo(
    () => buildColumnChart(widgets?.transactionsChart, theme.palette.primary.main),
    [widgets, theme, buildColumnChart]
  );

  const paymentsColumnChart = useMemo(
    () => buildColumnChart(widgets?.paymentsChart, theme.palette.secondary.main),
    [widgets, theme, buildColumnChart]
  );

  const topUsers = useMemo(() => widgets?.topUsers?.rows || [], [widgets]);
  const transactionsData = widgets?.recentTransactions?.rows || [];
  const paymentsData = widgets?.recentPayments?.rows || [];
  const budget = widgets?.budget;

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="400px" gap={2}>
        <CircularProgress size={48} />
        <Typography color="text.secondary">در حال بارگذاری داشبورد مالی...</Typography>
      </Box>
    );
  }

  if (!widgets) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography variant="h6" color="textSecondary">
          داده‌ای یافت نشد
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Fade in={isFetching} unmountOnExit>
        <LinearProgress
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderRadius: 2,
            mb: 1,
            height: 3,
          }}
        />
      </Fade>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <ButtonGroup size="small" variant="outlined" sx={{ flexWrap: 'wrap' }}>
                {DATE_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    onClick={() => handleDateRangePreset(range.value)}
                    variant={filters.dateRange === range.value ? 'contained' : 'outlined'}
                    color="primary"
                    sx={{ fontSize: '12px', whiteSpace: 'nowrap', borderRadius: '8px !important', mx: 0.25 }}
                  >
                    {range.label}
                  </Button>
                ))}
              </ButtonGroup>

              <DatePicker
                label="از تاریخ"
                value={parseApiDate(filters.dateFrom)}
                onChange={handleDateFromChange}
                maxDate={parseApiDate(filters.dateTo) || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 160 },
                  },
                }}
              />
              <DatePicker
                label="تا تاریخ"
                value={parseApiDate(filters.dateTo)}
                onChange={handleDateToChange}
                minDate={parseApiDate(filters.dateFrom) || undefined}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: 160 },
                  },
                }}
              />

              <TextField
                select
                size="small"
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                label="وضعیت"
                sx={{ minWidth: 140 }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                value={filters.transactionType || 'all'}
                onChange={(e) => onFiltersChange({ ...filters, transactionType: e.target.value })}
                label="نوع تراکنش"
                sx={{ minWidth: 160 }}
              >
                {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                value={filters.granularity || 'DAILY'}
                onChange={(e) => handleGranularityChange(e.target.value)}
                label="بازه نمودار"
                sx={{ minWidth: 130 }}
              >
                {GRANULARITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="جستجوی کاربر..."
                label="کاربر"
                sx={{ minWidth: 180 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={18} color="action">heroicons-solid:magnifying-glass</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ flexGrow: 1 }} />

              {widgets.appliedFilters && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${widgets.appliedFilters.dateFrom || '—'} تا ${widgets.appliedFilters.dateTo || '—'}`}
                  icon={<FuseSvgIcon size={14}>heroicons-solid:calendar-days</FuseSvgIcon>}
                />
              )}

              <Tooltip title="خروجی اکسل">
                <IconButton onClick={handleExportExcel} color="success" sx={{ borderRadius: 2 }}>
                  <FuseSvgIcon size={22}>heroicons-solid:table-cells</FuseSvgIcon>
                </IconButton>
              </Tooltip>
              <Tooltip title="خروجی PDF">
                <IconButton onClick={handleExportPdf} color="error" sx={{ borderRadius: 2 }}>
                  <FuseSvgIcon size={22}>heroicons-solid:document-arrow-down</FuseSvgIcon>
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={2}>
            <AnimatePresence mode="popLayout">
              {kpiCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={card.title}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        border: `1px solid ${alpha(card.color, 0.2)}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        background: `linear-gradient(145deg, ${alpha(card.bgColor, 0.5)} 0%, ${theme.palette.background.paper} 60%)`,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: -20,
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: alpha(card.color, 0.08),
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: card.bgColor,
                          }}
                        >
                          <FuseSvgIcon size={22} sx={{ color: card.color }}>
                            {card.icon}
                          </FuseSvgIcon>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {card.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, position: 'relative' }}>
                        <Typography variant="h5" fontWeight="bold">
                          {card.value}
                        </Typography>
                        {card.unit && (
                          <Typography variant="caption" color="text.secondary">
                            {card.unit}
                          </Typography>
                        )}
                      </Box>
                      {card.change !== null && card.change !== undefined && (
                        <Typography variant="caption" sx={{ color: card.change >= 0 ? 'success.main' : 'error.main' }}>
                          {card.change >= 0 ? '↑' : '↓'} {toFarsiDigits(Math.abs(card.change))}٪ نسبت به دوره قبل
                        </Typography>
                      )}
                      {card.hint && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                          {card.hint}
                        </Typography>
                      )}
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        </motion.div>

        {/* Revenue Chart — always successful INCREASE_CREDIT; granularity controls all time-series charts */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard
              title={`روند درآمد ${getGranularityLabel(filters.granularity)}`}
              subtitle="بر اساس تراکنش‌های موفق افزایش اعتبار"
              accentColor={theme.palette.primary.main}
              actions={
                <GranularityToggle
                  value={filters.granularity || 'DAILY'}
                  onChange={handleGranularityChange}
                />
              }
            >
              <Box sx={{ width: '100%', minHeight: 320 }}>
                <Chart options={revenueChart.options} series={revenueChart.series} type="area" height={320} />
              </Box>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Status + Type Donuts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <ChartCard
              title={statusDonutChart.title || 'وضعیت تراکنش‌ها'}
              subtitle={statusDonutChart.subtitle || 'توزیع بر اساس وضعیت'}
              accentColor={theme.palette.success.main}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Chart options={statusDonutChart.options} series={statusDonutChart.series} type="donut" height={300} />
              </Box>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ChartCard
              title={typeDonutChart.title || 'تراکنش‌ها'}
              subtitle={typeDonutChart.subtitle || 'توزیع براساس نوع تراکنش'}
              accentColor={theme.palette.info.main}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Chart options={typeDonutChart.options} series={typeDonutChart.series} type="donut" height={300} />
              </Box>
            </ChartCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <ChartCard
              title={subCategoryDonutChart.title || 'خرید اشتراک'}
              subtitle={subCategoryDonutChart.subtitle || 'توزیع براساس زیرشاخه'}
              accentColor={theme.palette.warning.main}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {subCategoryDonutChart.series.length > 0 ? (
                  <Chart options={subCategoryDonutChart.options} series={subCategoryDonutChart.series} type="pie" height={300} />
                ) : (
                  <Typography color="text.secondary" sx={{ py: 8 }}>
                    داده‌ای برای نمایش وجود ندارد
                  </Typography>
                )}
              </Box>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Transactions / Payments Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChartCard
              title={`تراکنش‌های ${getGranularityLabel(filters.granularity)}`}
              subtitle="تعداد تراکنش‌ها در بازه انتخابی"
              accentColor={theme.palette.primary.main}
              actions={
                <GranularityToggle
                  value={filters.granularity || 'DAILY'}
                  onChange={handleGranularityChange}
                />
              }
            >
              <Box sx={{ width: '100%', minHeight: 280 }}>
                <Chart options={transactionsColumnChart.options} series={transactionsColumnChart.series} type="bar" height={280} />
              </Box>
            </ChartCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartCard
              title={`پرداخت‌های ${getGranularityLabel(filters.granularity)}`}
              subtitle="تعداد پرداخت‌ها در بازه انتخابی"
              accentColor={theme.palette.secondary.main}
              actions={
                <GranularityToggle
                  value={filters.granularity || 'DAILY'}
                  onChange={handleGranularityChange}
                />
              }
            >
              <Box sx={{ width: '100%', minHeight: 280 }}>
                <Chart options={paymentsColumnChart.options} series={paymentsColumnChart.series} type="bar" height={280} />
              </Box>
            </ChartCard>
          </Grid>
        </Grid>

        {/* Budget */}
        {budget && false && (
          <motion.div variants={itemVariants}>
            <Grid container spacing={2}>
              {[
                { label: 'هزینه‌ها', value: budget.expenses, limit: budget.expensesLimit, color: theme.palette.error.main },
                { label: 'پس‌انداز', value: budget.savings, limit: budget.savingsGoal, color: theme.palette.success.main },
                { label: 'صورتحساب‌ها', value: budget.bills, limit: budget.billsLimit, color: theme.palette.warning.main },
              ].map((item) => {
                const pct = item.limit > 0 ? Math.min(100, Math.round((item.value / item.limit) * 100)) : 0;
                return (
                  <Grid item xs={12} md={4} key={item.label}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {item.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        {formatAmount(item.value)} / {formatAmount(item.limit)} ریال
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(item.color, 0.12),
                          '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: item.color },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {toFarsiDigits(pct)}٪ از سقف
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </motion.div>
        )}

        {/* Transactions + Top Users */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            <Grid item xs={12} xl={7}>
              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="700">
                      {widgets.recentTransactions?.title || 'تراکنش‌های اخیر'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {toFarsiDigits(transactionsData.length)} تراکنش
                    </Typography>
                  </Box>
                  <Button
                    variant="text"
                    color="primary"
                    component={Link}
                    to="/dashboards/finance/transactions"
                    endIcon={<FuseSvgIcon size={16}>heroicons-solid:arrow-left</FuseSvgIcon>}
                  >
                    مشاهده همه
                  </Button>
                </Box>
                <TableContainer sx={{ maxHeight: 420 }}>
                  <Table size="small" stickyHeader dir="rtl">
                    <TableHead>
                      <TableRow>
                        {(widgets.recentTransactions?.columns || ['شناسه', 'کاربر', 'سرویس', 'مبلغ', 'وضعیت', 'تاریخ']).map((col) => (
                          <TableCell
                            key={col}
                            align="center"
                            sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.06) }}
                          >
                            {col}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactionsData.map((transaction, idx) => (
                        <TableRow
                          key={transaction.id || idx}
                          hover
                          sx={{
                            cursor: 'pointer',
                            animation: 'fadeIn 0.3s ease forwards',
                            animationDelay: `${idx * 30}ms`,
                            opacity: 0,
                            '@keyframes fadeIn': {
                              to: { opacity: 1 },
                            },
                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                          }}
                        >
                          <TableCell align="center">
                            <Typography variant="caption" fontFamily="monospace">
                              {transaction.refId || transaction.referenceCode}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{transaction.username}</TableCell>
                          <TableCell align="center">{transaction.serviceNameFa || transaction.serviceName || transaction.transactionType}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="600">
                              {formatAmount(transaction.amount)} ریال
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={transaction.statusStr || transaction.status}
                              color={getTransactionStatusColor(transaction.status)}
                              size="small"
                              variant="filled"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{transaction.createdStr}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.createdAtTimeStr}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactionsData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                            <Typography color="text.secondary">تراکنشی یافت نشد</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} xl={5}>
              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: '100%' }}
              >
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  {widgets.topUsers?.title || 'کاربران برتر'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  بیشترین تراکنش‌ها در بازه انتخابی
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {topUsers.length > 0 ? (
                    topUsers.map((user, idx) => (
                      <motion.div
                        key={user.userId || idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                            '&:hover': {
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              backgroundColor: alpha(theme.palette.primary.main, 0.03),
                            },
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              fontWeight: 'bold',
                            }}
                          >
                            {toFarsiDigits(idx + 1)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight="600" noWrap>
                              {user.fullName || user.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.username} · {toFarsiDigits(user.transactionCount || 0)} تراکنش
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold" color="primary.main" noWrap>
                            {formatAmount(user.totalAmount || 0)}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))
                  ) : (
                    <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                      اطلاعاتی موجود نیست
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        {/* Recent Payments */}
        <motion.div variants={itemVariants}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight="700">
                  {widgets.recentPayments?.title || 'پرداخت‌های اخیر'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {toFarsiDigits(paymentsData.length)} پرداخت
                </Typography>
              </Box>
              <Button
                variant="text"
                color="primary"
                component={Link}
                to="/dashboards/finance/payments"
                endIcon={<FuseSvgIcon size={16}>heroicons-solid:arrow-left</FuseSvgIcon>}
              >
                مشاهده همه
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader dir="rtl">
                <TableHead>
                  <TableRow>
                    {(widgets.recentPayments?.columns || ['شناسه', 'کاربر', 'سرویس', 'مبلغ', 'وضعیت', 'تاریخ']).map((col) => (
                      <TableCell
                        key={col}
                        align="center"
                        sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.secondary.main, 0.06) }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentsData.map((payment, idx) => (
                    <TableRow
                      key={payment.id || idx}
                      hover
                      sx={{ '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.04) } }}
                    >
                      <TableCell align="center">
                        {payment.refId || (payment.id ? String(payment.id).substring(0, 8) : '-')}
                      </TableCell>
                      <TableCell align="center">{payment.username}</TableCell>
                      <TableCell align="center">{payment.serviceFa || payment.serviceName || payment.service}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="600">
                          {formatAmount(payment.amount)} ریال
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={payment.paymentStatus || payment.status}
                          size="small"
                          color={getPaymentStatusColor(payment.paymentStatusColor)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{payment.createdStr || payment.createdAtStr}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.createdAtTimeStr}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paymentsData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">پرداختی یافت نشد</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>
      </Box>
    </motion.div>
  );
}

export default FinanceDashboardWidgets;
