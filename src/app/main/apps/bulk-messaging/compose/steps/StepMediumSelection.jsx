import {
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Checkbox,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

const mediumOptions = [
  {
    value: "whatsapp",
    label: "واتس‌اپ",
    icon: "heroicons-outline:chat-alt",
    color: "#25D366",
    bgColor: "rgba(37,211,102,0.1)",
  },
  {
    value: "telegram",
    label: "تلگرام",
    icon: "heroicons-outline:paper-airplane",
    color: "#0088cc",
    bgColor: "rgba(0,136,204,0.1)",
  },
  {
    value: "bale",
    label: "پیام‌رسان بله",
    icon: "heroicons-outline:chat",
    color: "#00B862",
    bgColor: "rgba(0,184,98,0.1)",
  },
  {
    value: "email",
    label: "ایمیل",
    icon: "heroicons-outline:mail",
    color: "#EA4335",
    bgColor: "rgba(234,67,53,0.1)",
  },
  {
    value: "sms",
    label: "پیامک (SMS)",
    icon: "heroicons-outline:device-mobile",
    color: "#FF9800",
    bgColor: "rgba(255,152,0,0.1)",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

function StepMediumSelection({ selectedMediums, onMediumsChange }) {
  const toggleMedium = (value) => {
    if (selectedMediums.includes(value)) {
      onMediumsChange(selectedMediums.filter((m) => m !== value));
    } else {
      onMediumsChange([...selectedMediums, value]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Typography variant="h6" className="font-bold mb-8 text-center" color="text.primary">
        روش‌های ارسال را انتخاب کنید
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-24 text-center max-w-md">
        می‌توانید چند روش ارسال را همزمان انتخاب کنید. پیام از تمام روش‌های
        انتخابی ارسال خواهد شد.
      </Typography>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {mediumOptions.map((medium) => {
          const isSelected = selectedMediums.includes(medium.value);
          return (
            <motion.div key={medium.value} variants={cardVariants}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 2,
                  borderColor: isSelected ? medium.color : "transparent",
                  boxShadow: isSelected
                    ? `0 0 0 1px ${medium.color}, 0 6px 20px -4px ${medium.color}40`
                    : "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: `0 8px 24px -6px ${medium.color}30`,
                  },
                  position: "relative",
                }}
              >
                <CardActionArea
                  onClick={() => toggleMedium(medium.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <CardContent className="flex items-center gap-12 p-16">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: medium.bgColor,
                        transition: "all 0.3s ease",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                        flexShrink: 0,
                      }}
                    >
                      <FuseSvgIcon size={24} sx={{ color: medium.color }}>
                        {medium.icon}
                      </FuseSvgIcon>
                    </Box>
                    <Box className="flex-1 min-w-0">
                      <Typography
                        variant="subtitle2"
                        className="font-bold"
                        sx={{ color: isSelected ? medium.color : "text.primary" }}
                      >
                        {medium.label}
                      </Typography>
                    </Box>
                    <Checkbox
                      checked={isSelected}
                      color="secondary"
                      sx={{
                        "& .MuiSvgIcon-root": {
                          color: isSelected ? medium.color : undefined,
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

      {selectedMediums.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-24"
        >
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>{selectedMediums.length}</strong> روش ارسال انتخاب شده
          </Typography>
        </motion.div>
      )}
    </div>
  );
}

export default StepMediumSelection;
