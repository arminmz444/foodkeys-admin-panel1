import { useState, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  useGetFinanceDashboardWidgetsQuery,
  useGetFilteredTransactionsQuery,
  useGetFilteredPaymentsQuery,
} from '../FinanceDashboardApi';

const DATE_RANGES = [
  { label: '۳۰ روز اخیر', value: '30d', days: 30 },
  { label: '۳ ماه اخیر', value: '3m', days: 90 },
  { label: '۶ ماه اخیر', value: '6m', days: 180 },
  { label: 'یک سال اخیر', value: '1y', days: 365 },
  { label: 'همه', value: 'all', days: null },
];

const STATUS_OPTIONS = [
  { label: 'همه', value: '' },
  { label: 'موفق', value: 'COMPLETED' },
  { label: 'در انتظار', value: 'PENDING' },
  { label: 'ناموفق', value: 'FAILED' },
];

function toFarsiDigits(num) {
  if (num === null || num === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => farsiDigits[d]);
}

function formatAmount(amount) {
  if (!amount && amount !== 0) return '۰';
  return new Intl.NumberFormat('fa-IR').format(amount);
}

function getDateRange(days) {
  if (!days) return { startDate: null, endDate: null };
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: { padding: 30, direction: 'rtl' },
  header: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  subHeader: { fontSize: 12, marginBottom: 10, textAlign: 'center', color: '#666' },
  table: { display: 'table', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#333', backgroundColor: '#f5f5f5' },
  tableCell: { flex: 1, padding: 6, fontSize: 9, textAlign: 'center' },
  tableHeaderCell: { flex: 1, padding: 6, fontSize: 10, textAlign: 'center', fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', padding: 10 },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  summaryLabel: { fontSize: 10, color: '#666', marginTop: 4 },
});

function PdfReport({ widgets, dateRange, transactions }) { return (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.header}>گزارش مالی داشبورد</Text>
      <Text style={pdfStyles.subHeader}>
        {dateRange === 'all' ? 'تمام دوره‌ها' : `بازه زمانی: ${DATE_RANGES.find(d => d.value === dateRange)?.label || ''}`}
      </Text>
      <View style={pdfStyles.summaryRow}>
        <View style={pdfStyles.summaryItem}>
          <Text style={pdfStyles.summaryValue}>{widgets?.transactionSummary?.totalCount || 0}</Text>
          <Text style={pdfStyles.summaryLabel}>تعداد کل تراکنش</Text>
        </View>
        <View style={pdfStyles.summaryItem}>
          <Text style={pdfStyles.summaryValue}>{widgets?.transactionSummary?.completedCount || 0}</Text>
          <Text style={pdfStyles.summaryLabel}>تراکنش موفق</Text>
        </View>
        <View style={pdfStyles.summaryItem}>
          <Text style={pdfStyles.summaryValue}>{widgets?.transactionSummary?.totalAmount || 0}</Text>
          <Text style={pdfStyles.summaryLabel}>مجموع مبالغ (ریال)</Text>
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
              <Text style={pdfStyles.tableCell}>{t.id || t.referenceCode || '-'}</Text>
              <Text style={pdfStyles.tableCell}>{t.username || '-'}</Text>
              <Text style={pdfStyles.tableCell}>{t.amount || 0}</Text>
              <Text style={pdfStyles.tableCell}>{t.statusStr || t.status || '-'}</Text>
              <Text style={pdfStyles.tableCell}>{t.createdStr || t.createdAtStr || '-'}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
); }

function FinanceDashboardWidgets() {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');

  const { data: widgets, isLoading, error } = useGetFinanceDashboardWidgetsQuery();

  const dateParams = useMemo(() => {
    const range = DATE_RANGES.find((r) => r.value === dateRange);
    return getDateRange(range?.days);
  }, [dateRange]);

  const filterParams = useMemo(() => ({
    ...dateParams,
    status: statusFilter || undefined,
    username: usernameFilter || undefined,
    page: 0,
    size: 20,
  }), [dateParams, statusFilter, usernameFilter]);

  const { data: filteredTransactions } = useGetFilteredTransactionsQuery(filterParams);
  const { data: filteredPayments } = useGetFilteredPaymentsQuery(filterParams);

  const handleExportExcel = useCallback(() => {
    const transData = filteredTransactions?.data || widgets?.recentTransactions?.rows || [];
    const payData = filteredPayments?.data || widgets?.recentPayments?.rows || [];

    const wb = XLSX.utils.book_new();

    const transHeaders = ['شناسه', 'کاربر', 'خدمت', 'مبلغ (ریال)', 'وضعیت', 'تاریخ'];
    const transRows = transData.map((t) => [
      t.id || t.referenceCode || '',
      t.username || '',
      t.serviceNameFa || t.serviceName || t.service || '',
      t.amount || 0,
      t.statusStr || t.status || '',
      t.createdStr || t.createdAtStr || '',
    ]);
    const transSheet = XLSX.utils.aoa_to_sheet([transHeaders, ...transRows]);
    transSheet['!cols'] = transHeaders.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, transSheet, 'تراکنش‌ها');

    const payHeaders = ['شناسه', 'کاربر', 'خدمت', 'مبلغ (ریال)', 'وضعیت', 'تاریخ'];
    const payRows = payData.map((p) => [
      p.id ? String(p.id).substring(0, 8) : '',
      p.username || '',
      p.serviceFa || p.service || '',
      p.amount || 0,
      p.paymentStatus || p.status || '',
      p.createdAtStr || '',
    ]);
    const paySheet = XLSX.utils.aoa_to_sheet([payHeaders, ...payRows]);
    paySheet['!cols'] = payHeaders.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, paySheet, 'پرداخت‌ها');

    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbOut], { type: 'application/octet-stream' });
    saveAs(blob, `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredTransactions, filteredPayments, widgets]);

  const handleExportPdf = useCallback(async () => {
    const transData = filteredTransactions?.data || widgets?.recentTransactions?.rows || [];
    const blob = await pdf(
      <PdfReport widgets={widgets} dateRange={dateRange} transactions={transData} />
    ).toBlob();
    saveAs(blob, `financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }, [filteredTransactions, widgets, dateRange]);

  const kpiCards = useMemo(() => {
    if (!widgets) return [];
    const ts = widgets.transactionSummary || {};
    const totalCount = ts.totalCount || 0;
    const completedCount = ts.completedCount || 0;
    const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const avgAmount = totalCount > 0 ? Math.round((ts.totalAmount || 0) / totalCount) : 0;

    return [
      {
        title: 'درآمد کل',
        value: formatAmount(ts.totalAmount),
        unit: 'ریال',
        icon: 'heroicons-solid:currency-dollar',
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        change: ts.growthRate,
      },
      {
        title: 'تعداد تراکنش‌ها',
        value: toFarsiDigits(totalCount),
        unit: '',
        icon: 'heroicons-solid:receipt-percent',
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.1),
        change: null,
      },
      {
        title: 'نرخ موفقیت',
        value: toFarsiDigits(successRate),
        unit: '٪',
        icon: 'heroicons-solid:check-circle',
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        change: null,
      },
      {
        title: 'میانگین مبلغ',
        value: formatAmount(avgAmount),
        unit: 'ریال',
        icon: 'heroicons-solid:calculator',
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        change: null,
      },
      {
        title: 'مبلغ در انتظار',
        value: formatAmount(ts.pendingAmount || (ts.pendingCount || 0) * avgAmount),
        unit: 'ریال',
        icon: 'heroicons-solid:clock',
        color: theme.palette.warning.dark,
        bgColor: alpha(theme.palette.warning.dark, 0.1),
        change: null,
      },
      {
        title: 'نرخ رشد',
        value: toFarsiDigits(Math.abs(ts.growthRate || 0)),
        unit: '٪',
        icon: ts.growthRate >= 0 ? 'heroicons-solid:trending-up' : 'heroicons-solid:trending-down',
        color: (ts.growthRate || 0) >= 0 ? theme.palette.success.main : theme.palette.error.main,
        bgColor: (ts.growthRate || 0) >= 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
        change: ts.growthRate,
      },
    ];
  }, [widgets, theme]);

  const revenueChartOptions = useMemo(() => {
    const monthlyData = widgets?.monthlyRevenue || widgets?.revenueChart || [];
    const categories = monthlyData.map?.((d) => d.month || d.label || '') || [];
    const data = monthlyData.map?.((d) => d.amount || d.value || 0) || [];

    return {
      options: {
        chart: {
          type: 'area',
          toolbar: { show: false },
          fontFamily: 'inherit',
          foreColor: theme.palette.text.secondary,
        },
        colors: [theme.palette.primary.main],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 100],
          },
        },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
          categories,
          labels: { style: { fontSize: '11px' } },
        },
        yaxis: {
          labels: {
            formatter: (val) => formatAmount(Math.round(val)),
            style: { fontSize: '11px' },
          },
        },
        tooltip: {
          y: { formatter: (val) => `${formatAmount(val)} ریال` },
        },
        dataLabels: { enabled: false },
        grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
      },
      series: [{ name: 'درآمد', data }],
    };
  }, [widgets, theme]);

  const statusDonutOptions = useMemo(() => {
    const ts = widgets?.transactionSummary || {};
    const completed = ts.completedCount || 0;
    const pending = ts.pendingCount || 0;
    const failed = ts.failedCount || 0;

    return {
      options: {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: ['موفق', 'در انتظار', 'ناموفق'],
        colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
        legend: {
          position: 'bottom',
          fontSize: '13px',
          labels: { colors: theme.palette.text.primary },
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => `${toFarsiDigits(Math.round(val))}٪`,
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'مجموع',
                  formatter: () => toFarsiDigits(completed + pending + failed),
                },
              },
            },
          },
        },
      },
      series: [completed, pending, failed],
    };
  }, [widgets, theme]);

  const monthlyBarOptions = useMemo(() => {
    const monthlyData = widgets?.monthlyRevenue || widgets?.revenueChart || [];
    const categories = monthlyData.map?.((d) => d.month || d.label || '') || [];
    const data = monthlyData.map?.((d) => d.amount || d.value || 0) || [];

    return {
      options: {
        chart: {
          type: 'bar',
          toolbar: { show: false },
          fontFamily: 'inherit',
          foreColor: theme.palette.text.secondary,
        },
        colors: [theme.palette.secondary.main],
        plotOptions: {
          bar: { borderRadius: 6, columnWidth: '55%' },
        },
        xaxis: {
          categories,
          labels: { style: { fontSize: '11px' } },
        },
        yaxis: {
          labels: {
            formatter: (val) => formatAmount(Math.round(val)),
            style: { fontSize: '11px' },
          },
        },
        tooltip: {
          y: { formatter: (val) => `${formatAmount(val)} ریال` },
        },
        dataLabels: { enabled: false },
        grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
      },
      series: [{ name: 'درآمد ماهانه', data }],
    };
  }, [widgets, theme]);

  const topUsers = useMemo(() => {
    return widgets?.topUsers || [];
  }, [widgets]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography variant="h6" color="error">
          خطا در بارگذاری داده‌ها: {error.message || 'خطای نامشخص'}
        </Typography>
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

  const transactionsData = filteredTransactions?.data || widgets?.recentTransactions?.rows || [];
  const paymentsData = filteredPayments?.data || widgets?.recentPayments?.rows || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Filter Bar */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <ButtonGroup size="small" variant="outlined" sx={{ flexWrap: 'wrap' }}>
                {DATE_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    onClick={() => setDateRange(range.value)}
                    variant={dateRange === range.value ? 'contained' : 'outlined'}
                    color="secondary"
                    sx={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    {range.label}
                  </Button>
                ))}
              </ButtonGroup>

              <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="وضعیت"
                sx={{ minWidth: 120 }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                value={usernameFilter}
                onChange={(e) => setUsernameFilter(e.target.value)}
                placeholder="جستجوی کاربر..."
                label="کاربر"
                sx={{ minWidth: 160 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={18} color="action">heroicons-solid:magnifying-glass</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ flexGrow: 1 }} />

              <Tooltip title="خروجی اکسل">
                <IconButton onClick={handleExportExcel} color="success">
                  <FuseSvgIcon size={22}>heroicons-solid:table-cells</FuseSvgIcon>
                </IconButton>
              </Tooltip>
              <Tooltip title="خروجی PDF">
                <IconButton onClick={handleExportPdf} color="error">
                  <FuseSvgIcon size={22}>heroicons-solid:document-arrow-down</FuseSvgIcon>
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={2}>
            {kpiCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '4px',
                        height: '100%',
                        backgroundColor: card.color,
                        borderRadius: '0 8px 8px 0',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: card.bgColor,
                        }}
                      >
                        <FuseSvgIcon size={20} sx={{ color: card.color }}>
                          {card.icon}
                        </FuseSvgIcon>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                        {card.value}
                      </Typography>
                      {card.unit && (
                        <Typography variant="caption" color="text.secondary">
                          {card.unit}
                        </Typography>
                      )}
                    </Box>
                    {card.change !== null && card.change !== undefined && (
                      <Typography
                        variant="caption"
                        sx={{ color: card.change >= 0 ? 'success.main' : 'error.main' }}
                      >
                        {card.change >= 0 ? '↑' : '↓'} {toFarsiDigits(Math.abs(card.change))}٪ نسبت به دوره قبل
                      </Typography>
                    )}
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            {/* Revenue Area Chart */}
            <Grid item xs={12} lg={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="600">
                  روند درآمد
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  نمودار درآمد در بازه زمانی انتخابی
                </Typography>
                <Box sx={{ width: '100%', minHeight: 300 }}>
                  <Chart
                    options={revenueChartOptions.options}
                    series={revenueChartOptions.series}
                    type="area"
                    height={300}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Donut Chart */}
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="600">
                  وضعیت تراکنش‌ها
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  توزیع بر اساس وضعیت
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Chart
                    options={statusDonutOptions.options}
                    series={statusDonutOptions.series}
                    type="donut"
                    height={280}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        {/* Monthly Bar Chart */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="600">
              درآمد ماهانه
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              مقایسه درآمد ماهانه در ۱۲ ماه اخیر
            </Typography>
            <Box sx={{ width: '100%', minHeight: 300 }}>
              <Chart
                options={monthlyBarOptions.options}
                series={monthlyBarOptions.series}
                type="bar"
                height={300}
              />
            </Box>
          </Paper>
        </motion.div>

        {/* Tables Row */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3}>
            {/* Recent Transactions */}
            <Grid item xs={12} xl={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      تراکنش‌های اخیر
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

                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader dir="rtl">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>شناسه</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>کاربر</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>خدمت</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>مبلغ</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>وضعیت</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>تاریخ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactionsData.map((transaction, idx) => (
                        <TableRow
                          key={transaction.id || idx}
                          hover
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: idx % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.03),
                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                          }}
                        >
                          <TableCell align="center">{transaction.id || transaction.referenceCode}</TableCell>
                          <TableCell align="center">{transaction.username}</TableCell>
                          <TableCell align="center">{transaction.serviceNameFa || transaction.serviceName || transaction.service}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="500">
                              {formatAmount(transaction.amount)} ریال
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={transaction.statusStr || transaction.status}
                              color={(() => {
                                if (transaction.status === 'COMPLETED') return 'success';
                                if (transaction.status === 'PENDING') return 'warning';
                                return 'error';
                              })()}
                              size="small"
                              variant="filled"
                              sx={{ minWidth: 60 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box dir="rtl">
                              <Typography variant="body2" component="div">
                                {transaction.createdStr || transaction.createdAtStr}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" component="div">
                                {transaction.createdTimeStr || transaction.createdAtTimeStr}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactionsData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="textSecondary">
                              تراکنشی یافت نشد
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Top Users */}
            <Grid item xs={12} xl={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="600">
                  کاربران برتر
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  بیشترین تراکنش‌ها
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {topUsers.length > 0 ? (
                    topUsers.slice(0, 8).map((user, idx) => (
                      <Box
                        key={user.id || idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: idx % 2 === 0 ? alpha(theme.palette.action.hover, 0.03) : 'transparent',
                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {toFarsiDigits(idx + 1)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="500">
                            {user.username || user.name || `کاربر ${idx + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {toFarsiDigits(user.transactionCount || 0)} تراکنش
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {formatAmount(user.totalAmount || 0)} ریال
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        اطلاعاتی موجود نیست
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        {/* Recent Payments */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  پرداخت‌های اخیر
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
                    <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>شناسه</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>کاربر</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>خدمت</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>مبلغ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>وضعیت</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: alpha(theme.palette.secondary.main, 0.05) }}>تاریخ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentsData.map((payment, idx) => (
                    <TableRow
                      key={payment.id || idx}
                      hover
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.03),
                        '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.04) },
                      }}
                    >
                      <TableCell align="center">{payment.id ? String(payment.id).substring(0, 8) : '-'}</TableCell>
                      <TableCell align="center">{payment.username}</TableCell>
                      <TableCell align="center">{payment.serviceFa || payment.service}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="500">
                          {formatAmount(payment.amount)} ریال
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={payment.paymentStatus || payment.statusStr || payment.status}
                          size="small"
                          variant="filled"
                          color={(() => {
                            if (payment.paymentStatusColor === 'success' || payment.status === 'COMPLETED') return 'success';
                            if (payment.paymentStatusColor === 'warning' || payment.status === 'PENDING') return 'warning';
                            if (payment.paymentStatusColor === 'danger' || payment.status === 'FAILED') return 'error';
                            return 'default';
                          })()}
                          sx={{ minWidth: 60 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box dir="rtl">
                          <Typography variant="body2" component="div">
                            {payment.createdAtStr}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" component="div">
                            {payment.createdAtTimeStr}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paymentsData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="textSecondary">
                          پرداختی یافت نشد
                        </Typography>
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
};

export default FinanceDashboardWidgets;
