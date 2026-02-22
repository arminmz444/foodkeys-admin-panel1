import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import FusePageCarded from "@fuse/core/FusePageCarded";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useThemeMediaQuery } from "@fuse/hooks";
import {
  useGetBulkMessagingTaskQuery,
  useGetBulkMessagingReportQuery,
} from "../BulkMessagingApi";

const statusConfig = {
  pending: {
    label: "در انتظار",
    color: "warning",
    icon: "heroicons-outline:clock",
  },
  "in-progress": {
    label: "در حال ارسال",
    color: "info",
    icon: "heroicons-outline:refresh",
  },
  completed: {
    label: "تکمیل شده",
    color: "success",
    icon: "heroicons-outline:check-circle",
  },
  failed: {
    label: "ناموفق",
    color: "error",
    icon: "heroicons-outline:x-circle",
  },
  cancelled: {
    label: "لغو شده",
    color: "default",
    icon: "heroicons-outline:ban",
  },
};

const mediumLabels = {
  whatsapp: "واتس‌اپ",
  telegram: "تلگرام",
  bale: "بله",
  email: "ایمیل",
  sms: "پیامک",
};

function StatCard({ icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          transition: "all 0.3s",
          "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
        }}
      >
        <CardContent className="flex items-center gap-16 p-16">
          <Avatar
            sx={{
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
              width: 48,
              height: 48,
            }}
          >
            <FuseSvgIcon size={24}>{icon}</FuseSvgIcon>
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" className="font-medium">
              {label}
            </Typography>
            <Typography variant="h5" className="font-bold" color={`${color}.main`}>
              {value ?? "—"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BulkMessagingReport() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const {
    data: task,
    isLoading: isTaskLoading,
    isError: isTaskError,
  } = useGetBulkMessagingTaskQuery(taskId);

  const {
    data: report,
    isLoading: isReportLoading,
    isError: isReportError,
  } = useGetBulkMessagingReportQuery(taskId);

  const isLoading = isTaskLoading || isReportLoading;
  const isError = isTaskError || isReportError;

  const status = statusConfig[task?.status] || statusConfig.pending;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const successRate =
    report?.totalRecipients > 0
      ? Math.round((report.successCount / report.totalRecipients) * 100)
      : 0;

  const header = (
    <div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 flex-1 w-full items-center justify-between py-8 sm:py-16 px-16 md:px-24">
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1, transition: { delay: 0.2 } }}
        className="flex items-center gap-12"
      >
        <Button
          component={Link}
          to="/apps/bulk-messaging/tasks"
          color="inherit"
          sx={{ minWidth: 0, p: 1, borderRadius: 2 }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:arrow-right</FuseSvgIcon>
        </Button>
        <FuseSvgIcon size={28} color="action">
          heroicons-outline:document-report
        </FuseSvgIcon>
        <Typography
          className="flex text-24 md:text-32 font-extrabold tracking-tight"
          component="h1"
        >
          گزارش ارسال گروهی
        </Typography>
        {task && (
          <Chip
            icon={<FuseSvgIcon size={14}>{status.icon}</FuseSvgIcon>}
            label={status.label}
            color={status.color}
            size="small"
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          />
        )}
      </motion.div>
    </div>
  );

  if (isLoading) {
    return (
      <FusePageCarded
        header={header}
        content={
          <div className="p-24 max-w-5xl mx-auto w-full">
            <Grid container spacing={2} className="mb-24">
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
          </div>
        }
        scroll={isMobile ? "normal" : "content"}
      />
    );
  }

  if (isError) {
    return (
      <FusePageCarded
        header={header}
        content={
          <div className="p-24 max-w-5xl mx-auto w-full">
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.
            </Alert>
            <Button
              onClick={() => navigate("/apps/bulk-messaging/tasks")}
              variant="outlined"
              sx={{ mt: 2, borderRadius: 2 }}
            >
              بازگشت به لیست
            </Button>
          </div>
        }
        scroll={isMobile ? "normal" : "content"}
      />
    );
  }

  return (
    <FusePageCarded
      header={header}
      content={
        <div className="p-16 md:p-24 max-w-5xl mx-auto w-full">
          {/* Stats Cards */}
          <Grid container spacing={2} className="mb-24">
            <Grid item xs={6} md={3}>
              <StatCard
                icon="heroicons-outline:users"
                label="کل گیرندگان"
                value={report?.totalRecipients?.toLocaleString("fa-IR")}
                color="primary"
                delay={0.1}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon="heroicons-outline:check-circle"
                label="موفق"
                value={report?.successCount?.toLocaleString("fa-IR")}
                color="success"
                delay={0.2}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon="heroicons-outline:x-circle"
                label="ناموفق"
                value={report?.failureCount?.toLocaleString("fa-IR")}
                color="error"
                delay={0.3}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon="heroicons-outline:chart-bar"
                label="نرخ موفقیت"
                value={`${successRate}%`}
                color={successRate >= 80 ? "success" : successRate >= 50 ? "warning" : "error"}
                delay={0.4}
              />
            </Grid>
          </Grid>

          {/* Success Rate Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ transformOrigin: "right" }}
          >
            <Paper sx={{ borderRadius: 3, p: 2, mb: 3 }} elevation={0}>
              <Box className="flex items-center justify-between mb-8">
                <Typography variant="body2" className="font-medium">
                  نرخ موفقیت
                </Typography>
                <Typography variant="body2" className="font-bold">
                  {successRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={successRate}
                color={
                  successRate >= 80
                    ? "success"
                    : successRate >= 50
                    ? "warning"
                    : "error"
                }
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: "action.hover",
                }}
              />
            </Paper>
          </motion.div>

          {/* Task Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Paper sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, mb: 3 }} elevation={0}>
              <Typography variant="subtitle1" className="font-bold mb-12">
                اطلاعات عملیات
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    مخاطبین
                  </Typography>
                  <Typography variant="body2" className="font-medium">
                    {task?.targetType === "users"
                      ? "تمام کاربران"
                      : `زیردسته‌ها (${task?.subcategoryCount || 0})`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    روش‌های ارسال
                  </Typography>
                  <Box className="flex flex-wrap gap-4 mt-4">
                    {(task?.mediums || []).map((m) => (
                      <Chip
                        key={m}
                        label={mediumLabels[m] || m}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    تاریخ ایجاد
                  </Typography>
                  <Typography variant="body2" dir="ltr" className="font-medium">
                    {formatDate(task?.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    تاریخ اتمام
                  </Typography>
                  <Typography variant="body2" dir="ltr" className="font-medium">
                    {formatDate(task?.completedAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    متن پیام
                  </Typography>
                  <Paper
                    sx={{
                      bgcolor: "action.hover",
                      borderRadius: 2,
                      p: 2,
                      mt: 1,
                      maxHeight: 160,
                      overflow: "auto",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
                    >
                      {task?.messageContent}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Detailed Report Table */}
          {report?.details?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Paper sx={{ borderRadius: 3, overflow: "hidden" }} elevation={0}>
                <Box className="p-16 pb-0">
                  <Typography variant="subtitle1" className="font-bold">
                    جزئیات ارسال
                  </Typography>
                </Box>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>کاربر</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>روش</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>پیام خطا</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>زمان</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.details.map((detail, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Typography variant="body2" className="font-medium">
                              {detail.username || detail.recipient}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={mediumLabels[detail.medium] || detail.medium}
                              size="small"
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={detail.success ? "موفق" : "ناموفق"}
                              size="small"
                              color={detail.success ? "success" : "error"}
                              variant="filled"
                              sx={{ borderRadius: 1.5 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              color="error"
                              className="truncate max-w-[200px]"
                            >
                              {detail.errorMessage || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" dir="ltr">
                              {formatDate(detail.sentAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </motion.div>
          )}
        </div>
      }
      scroll={isMobile ? "normal" : "content"}
    />
  );
}

export default BulkMessagingReport;
