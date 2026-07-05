import {
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Checkbox,
  Avatar,
  TextField,
  Skeleton,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useGetAudienceCriteriaQuery } from "../../BulkMessagingApi";

const criterionMeta = {
  USERS_WITH_ACTIVE_SUBSCRIPTION: {
    icon: "heroicons-outline:badge-check",
    color: "#10b981",
    bgColor: "rgba(16,185,129,0.1)",
  },
  USERS_WITH_EXPIRED_SUBSCRIPTION: {
    icon: "heroicons-outline:clock",
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.1)",
  },
  USERS_WITH_EXPIRED_IN_SUBCAT_AND_ACTIVE_IN_OTHER: {
    icon: "heroicons-outline:switch-horizontal",
    color: "#6366f1",
    bgColor: "rgba(99,102,241,0.1)",
  },
  USERS_WITH_ACTIVE_SUBSCRIPTION_AND_BUNDLE: {
    icon: "heroicons-outline:collection",
    color: "#8b5cf6",
    bgColor: "rgba(139,92,246,0.1)",
  },
  USERS_WITH_SUBMITTED_COMPANY_OR_SERVICE: {
    icon: "heroicons-outline:office-building",
    color: "#3b82f6",
    bgColor: "rgba(59,130,246,0.1)",
  },
  USERS_WITH_PENDING_SUBMISSION_REQUEST: {
    icon: "heroicons-outline:document-text",
    color: "#ec4899",
    bgColor: "rgba(236,72,153,0.1)",
  },
  USERS_WITH_COMPANY_STATUS: {
    icon: "heroicons-outline:status-online",
    color: "#14b8a6",
    bgColor: "rgba(20,184,166,0.1)",
  },
  USERS_WITH_PUBLISHED_COMPANY: {
    icon: "heroicons-outline:globe",
    color: "#06b6d4",
    bgColor: "rgba(6,182,212,0.1)",
  },
};

const defaultMeta = {
  icon: "heroicons-outline:user-group",
  color: "#64748b",
  bgColor: "rgba(100,116,139,0.1)",
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

function getMeta(code) {
  return criterionMeta[code] || defaultMeta;
}

function StepAudienceCriteria({
  audienceCriteria,
  onAudienceCriteriaChange,
  bundleId,
  onBundleIdChange,
  companyStatus,
  onCompanyStatusChange,
  scheduledAt,
  onScheduledAtChange,
}) {
  const {
    data: criteriaOptions = [],
    isLoading,
    isError,
  } = useGetAudienceCriteriaQuery();

  const toggleCriterion = (code) => {
    if (audienceCriteria.includes(code)) {
      onAudienceCriteriaChange(audienceCriteria.filter((c) => c !== code));
    } else {
      onAudienceCriteriaChange([...audienceCriteria, code]);
    }
  };

  const requiresBundleId = audienceCriteria.some((c) => {
    const opt = criteriaOptions.find((o) => o.code === c);
    return opt && (opt.requiresBundleId === true || opt.requiresBundleId === "true");
  });

  const requiresCompanyStatus = audienceCriteria.some((c) => {
    const opt = criteriaOptions.find((o) => o.code === c);
    return opt && (opt.requiresCompanyStatus === true || opt.requiresCompanyStatus === "true");
  });

  return (
    <div className="flex flex-col items-center">
      <Typography
        variant="h6"
        className="font-bold mb-8 text-center"
        color="text.primary"
      >
        نوع مخاطبین را انتخاب کنید
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        className="mb-24 text-center max-w-lg"
      >
        یک یا چند معیار برای فیلتر کاربران در زیردسته‌های انتخابی مشخص کنید
      </Typography>

      {isLoading && (
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-16 w-full max-w-3xl">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ borderRadius: 2, width: "100%", maxWidth: 480 }}>
          خطا در دریافت معیارهای مخاطبین
        </Alert>
      )}

      {!isLoading && !isError && (
        <>
          {audienceCriteria.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl mb-16"
            >
              <Paper variant="outlined" sx={{ borderRadius: 3, p: 1.5 }}>
                <Typography variant="caption" color="text.secondary" className="mb-8 block">
                  {audienceCriteria.length} معیار انتخاب شده
                </Typography>
                <Box className="flex flex-wrap gap-6">
                  <AnimatePresence>
                    {audienceCriteria.map((code) => {
                      const opt = criteriaOptions.find((o) => o.code === code);
                      const meta = getMeta(code);
                      return (
                        <motion.div
                          key={code}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                        >
                          <Chip
                            label={opt?.displayName || code}
                            onDelete={() => toggleCriterion(code)}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              bgcolor: `${meta.color}18`,
                              color: meta.color,
                              fontWeight: 600,
                              border: `1px solid ${meta.color}40`,
                              "& .MuiChip-deleteIcon": { color: meta.color },
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </Box>
              </Paper>
            </motion.div>
          )}

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-16 w-full max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {criteriaOptions.map((option) => {
              const isSelected = audienceCriteria.includes(option.code);
              const meta = getMeta(option.code);
              return (
                <motion.div key={option.code} variants={cardVariants}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: 2,
                      borderColor: isSelected ? meta.color : "transparent",
                      boxShadow: isSelected
                        ? `0 0 0 1px ${meta.color}, 0 6px 20px -4px ${meta.color}40`
                        : "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: `0 8px 24px -6px ${meta.color}30`,
                      },
                      position: "relative",
                      overflow: "visible",
                    }}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          position: "absolute",
                          top: -10,
                          left: 16,
                          zIndex: 10,
                        }}
                      >
                        <Avatar sx={{ width: 22, height: 22, bgcolor: meta.color }}>
                          <FuseSvgIcon size={12} sx={{ color: "#fff" }}>
                            heroicons-solid:check
                          </FuseSvgIcon>
                        </Avatar>
                      </motion.div>
                    )}
                    <CardActionArea
                      onClick={() => toggleCriterion(option.code)}
                      sx={{ borderRadius: 3 }}
                    >
                      <CardContent className="flex items-start gap-12 p-16">
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: meta.bgColor,
                            transition: "all 0.3s ease",
                            transform: isSelected ? "scale(1.1)" : "scale(1)",
                            flexShrink: 0,
                          }}
                        >
                          <FuseSvgIcon size={22} sx={{ color: meta.color }}>
                            {meta.icon}
                          </FuseSvgIcon>
                        </Box>
                        <Box className="flex-1 min-w-0">
                          <Typography
                            variant="subtitle2"
                            className="font-bold mb-4"
                            sx={{ color: isSelected ? meta.color : "text.primary" }}
                          >
                            {option.displayName}
                          </Typography>
                          {option.description && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {option.description}
                            </Typography>
                          )}
                        </Box>
                        <Checkbox
                          checked={isSelected}
                          color="secondary"
                          sx={{
                            mt: -0.5,
                            "& .MuiSvgIcon-root": {
                              color: isSelected ? meta.color : undefined,
                            },
                          }}
                        />
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <AnimatePresence>
            {(requiresBundleId || requiresCompanyStatus || audienceCriteria.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-3xl mt-24"
              >
                <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                  <Typography variant="subtitle2" className="font-bold mb-12">
                    تنظیمات تکمیلی
                  </Typography>
                  {requiresBundleId && (
                    <TextField
                      fullWidth
                      size="small"
                      label="شناسه پلن (bundleId)"
                      value={bundleId}
                      onChange={(e) => onBundleIdChange(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  )}
                  {requiresCompanyStatus && (
                    <TextField
                      fullWidth
                      size="small"
                      label="وضعیت شرکت (مثلاً PUBLISHED)"
                      value={companyStatus}
                      onChange={(e) => onCompanyStatusChange(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  )}
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    label="زمان‌بندی ارسال (اختیاری)"
                    value={scheduledAt}
                    onChange={(e) => onScheduledAtChange(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default StepAudienceCriteria;
