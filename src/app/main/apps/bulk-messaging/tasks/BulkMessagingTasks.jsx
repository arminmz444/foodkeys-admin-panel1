import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import FusePageCarded from "@fuse/core/FusePageCarded";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useThemeMediaQuery } from "@fuse/hooks";
import { enqueueSnackbar } from "notistack";
import BulkMessagingHeader from "../compose/BulkMessagingHeader";
import {
  useGetBulkMessagingTasksQuery,
  useCancelBulkMessagingTaskMutation,
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

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

function BulkMessagingTasks() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelDialogId, setCancelDialogId] = useState(null);

  const { data, isLoading, isError, refetch } = useGetBulkMessagingTasksQuery({
    pageNumber: page + 1,
    pageSize: rowsPerPage,
    search,
    status: statusFilter,
  });

  const [cancelTask, { isLoading: isCancelling }] =
    useCancelBulkMessagingTaskMutation();

  const tasks = data?.data || [];
  const totalElements = data?.totalElements || 0;

  const handleCancelTask = async () => {
    try {
      await cancelTask(cancelDialogId).unwrap();
      enqueueSnackbar("عملیات با موفقیت لغو شد", {
        variant: "success",
        style: { fontSize: "medium" },
      });
      setCancelDialogId(null);
    } catch {
      enqueueSnackbar("خطا در لغو عملیات", {
        variant: "error",
        style: { fontSize: "medium" },
      });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <FusePageCarded
      header={<BulkMessagingHeader />}
      content={
        <div className="w-full p-16 md:p-24">
          {/* Filters */}
          <Paper
            className="p-12 md:p-16 mb-16 rounded-xl"
            elevation={0}
            sx={{
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
            }}
          >
            <Box className="flex flex-col sm:flex-row gap-12 items-stretch sm:items-center">
              <TextField
                size="small"
                placeholder="جستجو..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  sx: { borderRadius: 2 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={18} color="action">
                        heroicons-outline:search
                      </FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  label="وضعیت"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">همه</MenuItem>
                  <MenuItem value="pending">در انتظار</MenuItem>
                  <MenuItem value="in-progress">در حال ارسال</MenuItem>
                  <MenuItem value="completed">تکمیل شده</MenuItem>
                  <MenuItem value="failed">ناموفق</MenuItem>
                  <MenuItem value="cancelled">لغو شده</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="بروزرسانی">
                <IconButton onClick={refetch} color="secondary">
                  <FuseSvgIcon size={20}>heroicons-outline:refresh</FuseSvgIcon>
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Table */}
          <Paper className="rounded-xl shadow-sm overflow-hidden" elevation={0}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 360px)" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, minWidth: 60 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                      مخاطبین
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>
                      روش‌های ارسال
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>
                      پیش‌نمایش پیام
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>
                      وضعیت
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>
                      تاریخ ایجاد
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 100 }} align="center">
                      عملیات
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading &&
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                  {isError && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                          خطا در دریافت لیست وظایف
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading && !isError && tasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box className="flex flex-col items-center py-40 opacity-50">
                          <FuseSvgIcon size={56} color="disabled">
                            heroicons-outline:inbox
                          </FuseSvgIcon>
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            className="mt-12 font-medium"
                          >
                            هنوز عملیات ارسال گروهی ثبت نشده
                          </Typography>
                          <Button
                            component={Link}
                            to="/apps/bulk-messaging/compose"
                            variant="contained"
                            color="secondary"
                            sx={{ mt: 2, borderRadius: 2 }}
                            startIcon={
                              <FuseSvgIcon size={16}>
                                heroicons-outline:plus
                              </FuseSvgIcon>
                            }
                          >
                            ایجاد ارسال جدید
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  <AnimatePresence>
                    {!isLoading &&
                      tasks.map((task, index) => {
                        const status = statusConfig[task.status] || statusConfig.pending;
                        return (
                          <motion.tr
                            key={task.id}
                            custom={index}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            style={{ display: "table-row" }}
                            className="hover:bg-grey-50 dark:hover:bg-grey-900 transition-colors cursor-pointer"
                            onClick={() => {
                              if (
                                task.status === "completed" ||
                                task.status === "failed"
                              ) {
                                navigate(
                                  `/apps/bulk-messaging/tasks/${task.id}/report`
                                );
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" className="font-mono">
                                {task.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  task.targetType === "users"
                                    ? "تمام کاربران"
                                    : `${task.subcategoryCount || "—"} زیردسته`
                                }
                                size="small"
                                variant="outlined"
                                color={
                                  task.targetType === "users"
                                    ? "primary"
                                    : "secondary"
                                }
                                sx={{ borderRadius: 1.5 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box className="flex flex-wrap gap-4">
                                {(task.mediums || []).map((m) => (
                                  <Chip
                                    key={m}
                                    label={mediumLabels[m] || m}
                                    size="small"
                                    sx={{ borderRadius: 1, fontSize: "0.7rem" }}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                className="truncate max-w-[200px]"
                                title={task.messageContent}
                              >
                                {task.messageContent?.substring(0, 40)}
                                {task.messageContent?.length > 40 ? "..." : ""}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={
                                  <FuseSvgIcon size={14}>
                                    {status.icon}
                                  </FuseSvgIcon>
                                }
                                label={status.label}
                                size="small"
                                color={status.color}
                                variant="filled"
                                sx={{ borderRadius: 1.5, fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" dir="ltr">
                                {formatDate(task.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box className="flex items-center justify-center gap-4">
                                {(task.status === "completed" ||
                                  task.status === "failed") && (
                                  <Tooltip title="مشاهده گزارش">
                                    <IconButton
                                      size="small"
                                      color="info"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/apps/bulk-messaging/tasks/${task.id}/report`
                                        );
                                      }}
                                    >
                                      <FuseSvgIcon size={18}>
                                        heroicons-outline:document-report
                                      </FuseSvgIcon>
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {task.status === "pending" && (
                                  <Tooltip title="لغو">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCancelDialogId(task.id);
                                      }}
                                    >
                                      <FuseSvgIcon size={18}>
                                        heroicons-outline:x-circle
                                      </FuseSvgIcon>
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>

            {!isLoading && tasks.length > 0 && (
              <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="تعداد در صفحه:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} از ${count !== -1 ? count : `بیش از ${to}`}`
                }
                sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  ".MuiTablePagination-toolbar": { direction: "ltr" },
                }}
              />
            )}
          </Paper>

          {/* Cancel Confirmation Dialog */}
          <Dialog
            open={!!cancelDialogId}
            onClose={() => setCancelDialogId(null)}
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle className="font-bold">لغو عملیات ارسال</DialogTitle>
            <DialogContent>
              <DialogContentText>
                آیا از لغو این عملیات ارسال گروهی اطمینان دارید؟ این عمل قابل
                بازگشت نیست.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => setCancelDialogId(null)}
                color="inherit"
                disabled={isCancelling}
              >
                انصراف
              </Button>
              <Button
                onClick={handleCancelTask}
                variant="contained"
                color="error"
                disabled={isCancelling}
                sx={{ borderRadius: 2 }}
              >
                {isCancelling ? "در حال لغو..." : "لغو عملیات"}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      }
      scroll={isMobile ? "normal" : "content"}
    />
  );
}

export default BulkMessagingTasks;
