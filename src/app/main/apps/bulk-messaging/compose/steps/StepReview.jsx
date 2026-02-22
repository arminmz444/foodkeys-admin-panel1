import {
  Typography,
  Paper,
  Box,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

const mediumLabels = {
  whatsapp: { label: "واتس‌اپ", color: "#25D366" },
  telegram: { label: "تلگرام", color: "#0088cc" },
  bale: { label: "پیام‌رسان بله", color: "#00B862" },
  email: { label: "ایمیل", color: "#EA4335" },
  sms: { label: "پیامک (SMS)", color: "#FF9800" },
};

function ReviewRow({ icon, label, children }) {
  return (
    <Box className="flex items-start gap-12 py-12">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        <FuseSvgIcon size={18} color="action">
          {icon}
        </FuseSvgIcon>
      </Box>
      <Box className="flex-1 min-w-0">
        <Typography
          variant="caption"
          color="text.secondary"
          className="font-semibold uppercase"
        >
          {label}
        </Typography>
        <Box className="mt-4">{children}</Box>
      </Box>
    </Box>
  );
}

function StepReview({
  targetType,
  selectedSubCategories,
  excludedUsernames,
  selectedMediums,
  messageContent,
}) {
  return (
    <div className="flex flex-col">
      <Typography variant="h6" className="font-bold mb-8" color="text.primary">
        بررسی و تایید نهایی
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-24">
        اطلاعات زیر را بررسی کنید و در صورت تایید، دکمه ارسال را بزنید
      </Typography>

      <Alert
        severity="warning"
        variant="outlined"
        sx={{ mb: 3, borderRadius: 2 }}
        icon={
          <FuseSvgIcon size={20}>
            heroicons-outline:exclamation
          </FuseSvgIcon>
        }
      >
        پس از ارسال، امکان لغو فقط تا زمانی که وضعیت "در انتظار" باشد وجود دارد
      </Alert>

      <Paper
        variant="outlined"
        sx={{ borderRadius: 3, p: { xs: 2, md: 3 } }}
      >
        {/* Target */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ReviewRow icon="heroicons-outline:users" label="مخاطبین هدف">
            <Typography variant="body2" className="font-medium">
              {targetType === "users" ? "تمام کاربران سایت" : "زیردسته‌های انتخابی"}
            </Typography>
          </ReviewRow>
        </motion.div>

        <Divider />

        {/* Subcategories or exclusions */}
        {targetType === "subcategories" && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ReviewRow
                icon="heroicons-outline:collection"
                label="زیردسته‌های انتخابی"
              >
                <Box className="flex flex-wrap gap-6">
                  {selectedSubCategories.map((sc) => (
                    <Chip
                      key={sc.id}
                      label={sc.faName || sc.name || sc.title}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ borderRadius: 1.5 }}
                    />
                  ))}
                </Box>
              </ReviewRow>
            </motion.div>
            <Divider />
          </>
        )}

        {targetType === "users" && excludedUsernames.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ReviewRow
                icon="heroicons-outline:user-remove"
                label="لیست استثنا"
              >
                <Typography variant="body2" className="font-medium mb-4">
                  {excludedUsernames.length} کاربر
                </Typography>
                <Box className="flex flex-wrap gap-6">
                  {excludedUsernames.slice(0, 10).map((u) => (
                    <Chip
                      key={u}
                      label={u}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 1.5 }}
                    />
                  ))}
                  {excludedUsernames.length > 10 && (
                    <Chip
                      label={`+${excludedUsernames.length - 10} دیگر`}
                      size="small"
                      color="default"
                      sx={{ borderRadius: 1.5 }}
                    />
                  )}
                </Box>
              </ReviewRow>
            </motion.div>
            <Divider />
          </>
        )}

        {/* Mediums */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ReviewRow icon="heroicons-outline:share" label="روش‌های ارسال">
            <Box className="flex flex-wrap gap-6">
              {selectedMediums.map((m) => (
                <Chip
                  key={m}
                  label={mediumLabels[m]?.label || m}
                  size="small"
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: `${mediumLabels[m]?.color}18`,
                    color: mediumLabels[m]?.color,
                    fontWeight: 600,
                    border: `1px solid ${mediumLabels[m]?.color}40`,
                  }}
                />
              ))}
            </Box>
          </ReviewRow>
        </motion.div>

        <Divider />

        {/* Message preview */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ReviewRow icon="heroicons-outline:pencil-alt" label="متن پیام">
            <Paper
              sx={{
                bgcolor: "action.hover",
                borderRadius: 2,
                p: 2,
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
              >
                {messageContent}
              </Typography>
            </Paper>
            <Typography variant="caption" color="text.secondary" className="mt-4">
              {messageContent.length} کاراکتر
            </Typography>
          </ReviewRow>
        </motion.div>
      </Paper>
    </div>
  );
}

export default StepReview;
