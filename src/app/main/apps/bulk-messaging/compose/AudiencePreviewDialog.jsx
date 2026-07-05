import { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Skeleton,
  IconButton,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { usePreviewAudienceMutation } from "../BulkMessagingApi";

const PAGE_SIZE = 50;

const mediumColors = {
  whatsapp: "#25D366",
  telegram: "#0088cc",
  bale: "#00B862",
  email: "#EA4335",
  sms: "#FF9800",
};

const summaryVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08 },
  }),
};

function buildPreviewPayload({
  targetType,
  selectedSubCategories,
  audienceCriteria,
  bundleId,
  companyStatus,
  excludedUsernames,
  selectedMediums,
}) {
  const payload = {
    targetType,
    subcategoryIds: selectedSubCategories.map((sc) => sc.id),
    audienceCriteria,
    bundleId: bundleId ? Number(bundleId) : null,
    companyStatus: companyStatus || null,
    excludedUsernames: excludedUsernames || [],
    mediums: selectedMediums || [],
  };
  return payload;
}

function AudiencePreviewDialog({
  open,
  onClose,
  targetType,
  selectedSubCategories,
  audienceCriteria,
  bundleId,
  companyStatus,
  excludedUsernames,
  selectedMediums,
}) {
  const [previewAudience] = usePreviewAudienceMutation();
  const [audiences, setAudiences] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(
    async (page, reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      if (reset) {
        setIsInitialLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const body = buildPreviewPayload({
          targetType,
          selectedSubCategories,
          audienceCriteria,
          bundleId,
          companyStatus,
          excludedUsernames,
          selectedMediums,
        });

        const result = await previewAudience({
          pageNumber: page,
          pageSize: PAGE_SIZE,
          ...body,
        }).unwrap();

        const pageAudiences = result?.audiences || [];
        setAudiences((prev) => (reset ? pageAudiences : [...prev, ...pageAudiences]));
        setSummary({
          totalAudienceCount: result?.totalAudienceCount ?? 0,
          totalDeliveries: result?.totalDeliveries ?? 0,
          deliverableDeliveries: result?.deliverableDeliveries ?? 0,
          totalPages: result?.totalPages ?? 1,
          pageNumber: result?.pageNumber ?? page,
          pageSize: result?.pageSize ?? PAGE_SIZE,
        });
        setHasMore(page < (result?.totalPages ?? 1));
        setCurrentPage(page);
      } catch (err) {
        setError("خطا در دریافت پیش‌نمایش مخاطبین");
        if (reset) {
          setAudiences([]);
          setSummary(null);
        }
      } finally {
        loadingRef.current = false;
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      previewAudience,
      targetType,
      selectedSubCategories,
      audienceCriteria,
      bundleId,
      companyStatus,
      excludedUsernames,
      selectedMediums,
    ]
  );

  useEffect(() => {
    if (open) {
      setAudiences([]);
      setSummary(null);
      setCurrentPage(1);
      setHasMore(true);
      setError(null);
      loadPage(1, true);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(
    (e) => {
      const el = e.target;
      const nearBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 80;
      if (nearBottom && hasMore && !isInitialLoading && !isLoadingMore && !loadingRef.current) {
        loadPage(currentPage + 1, false);
      }
    },
    [hasMore, isInitialLoading, isLoadingMore, currentPage, loadPage]
  );

  const handleClose = () => {
    setAudiences([]);
    setSummary(null);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    onClose();
  };

  const loadedCount = audiences.length;
  const totalCount = summary?.totalAudienceCount ?? 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-12">
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 40,
                height: 40,
              }}
            >
              <FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>
            </Avatar>
            <Box>
              <Typography variant="h6" className="font-bold">
                پیش‌نمایش مخاطبین
              </Typography>
              <Typography variant="caption" color="text.secondary">
                لیست کاربرانی که پیام به آن‌ها ارسال می‌شود
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        {/* Summary stats */}
        {!isInitialLoading && summary && (
          <Box className="grid grid-cols-3 gap-8 p-16 bg-action-hover">
            {[
              {
                label: "کل مخاطبین",
                value: summary.totalAudienceCount,
                icon: "heroicons-outline:users",
                color: "#3b82f6",
              },
              {
                label: "کل ارسال‌ها",
                value: summary.totalDeliveries,
                icon: "heroicons-outline:paper-airplane",
                color: "#8b5cf6",
              },
              {
                label: "قابل ارسال",
                value: summary.deliverableDeliveries,
                icon: "heroicons-outline:check-circle",
                color: "#10b981",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={summaryVariants}
                initial="hidden"
                animate="show"
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    textAlign: "center",
                    bgcolor: `${stat.color}10`,
                    border: `1px solid ${stat.color}25`,
                  }}
                >
                  <FuseSvgIcon size={18} sx={{ color: stat.color, mb: 0.5 }}>
                    {stat.icon}
                  </FuseSvgIcon>
                  <Typography variant="h6" className="font-bold" sx={{ color: stat.color }}>
                    {stat.value.toLocaleString("fa-IR")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Scrollable audience list */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            overflow: "auto",
            maxHeight: 480,
            p: 2,
          }}
        >
          {isInitialLoading && (
            <Box className="flex flex-col gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          )}

          {!isInitialLoading && audiences.length === 0 && !error && (
            <Box className="flex flex-col items-center py-48 opacity-60">
              <FuseSvgIcon size={48} color="disabled">
                heroicons-outline:user-group
              </FuseSvgIcon>
              <Typography variant="body2" color="text.secondary" className="mt-12">
                مخاطبی یافت نشد
              </Typography>
            </Box>
          )}

          <AnimatePresence>
            {!isInitialLoading &&
              audiences.map((audience, index) => (
                <motion.div
                  key={`${audience.userId}-${index}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min((index % PAGE_SIZE) * 0.02, 0.4) }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "secondary.main",
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Box className="flex items-start gap-12">
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "secondary.light",
                          color: "secondary.contrastText",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                        }}
                      >
                        {(audience.firstName?.[0] || audience.username?.[0] || "?").toUpperCase()}
                      </Avatar>
                      <Box className="flex-1 min-w-0">
                        <Typography variant="subtitle2" className="font-bold">
                          {[audience.firstName, audience.lastName].filter(Boolean).join(" ") ||
                            audience.username}
                        </Typography>
                        <Box className="flex flex-wrap gap-8 mt-4">
                          {audience.username && (
                            <Typography variant="caption" color="text.secondary">
                              @{audience.username}
                            </Typography>
                          )}
                          {audience.email && (
                            <Typography variant="caption" color="text.secondary">
                              {audience.email}
                            </Typography>
                          )}
                          {audience.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {audience.phone}
                            </Typography>
                          )}
                        </Box>
                        {audience.deliveries?.length > 0 && (
                          <Box className="flex flex-wrap gap-6 mt-8">
                            {audience.deliveries.map((delivery, di) => {
                              const color = mediumColors[delivery.medium] || "#64748b";
                              return (
                                <Chip
                                  key={`${delivery.medium}-${di}`}
                                  size="small"
                                  label={
                                    delivery.deliverable
                                      ? `${delivery.mediumDisplayName || delivery.medium}: ${delivery.recipient}`
                                      : `${delivery.mediumDisplayName || delivery.medium}: ${delivery.skipReason || "غیرقابل ارسال"}`
                                  }
                                  sx={{
                                    borderRadius: 1.5,
                                    fontSize: "0.7rem",
                                    height: 24,
                                    bgcolor: delivery.deliverable ? `${color}15` : "action.hover",
                                    color: delivery.deliverable ? color : "text.disabled",
                                    border: delivery.deliverable
                                      ? `1px solid ${color}35`
                                      : "1px dashed",
                                    fontWeight: delivery.deliverable ? 600 : 400,
                                  }}
                                  icon={
                                    delivery.deliverable ? (
                                      <FuseSvgIcon size={12} sx={{ color: `${color} !important` }}>
                                        heroicons-solid:check
                                      </FuseSvgIcon>
                                    ) : (
                                      <FuseSvgIcon size={12} color="disabled">
                                        heroicons-solid:x
                                      </FuseSvgIcon>
                                    )
                                  }
                                />
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
          </AnimatePresence>

          {isLoadingMore && (
            <Box className="flex justify-center py-16">
              <CircularProgress size={28} color="secondary" />
            </Box>
          )}

          {!isInitialLoading && !hasMore && audiences.length > 0 && (
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                همه مخاطبین بارگذاری شد
              </Typography>
            </Divider>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          {loadedCount > 0 && (
            <>
              نمایش {loadedCount.toLocaleString("fa-IR")}
              {totalCount > 0 && ` از ${totalCount.toLocaleString("fa-IR")}`} مخاطب
            </>
          )}
        </Typography>
        <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>
          بستن
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AudiencePreviewDialog;
