import { motion } from "framer-motion";
import {
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Avatar,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

const targetOptions = [
  {
    value: "users",
    label: "تمام کاربران",
    description:
      "پیام به تمام کاربران سایت ارسال می‌شود. امکان اضافه کردن لیست استثنا وجود دارد.",
    icon: "heroicons-outline:users",
    color: "#3b82f6",
    bgColor: "rgba(59,130,246,0.1)",
  },
  {
    value: "subcategories",
    label: "زیردسته‌ها (شرکت‌ها)",
    description:
      "پیام به شرکت‌ها یا کاربرانی که در زیردسته‌های انتخابی ثبت‌نام کرده‌اند ارسال می‌شود.",
    icon: "heroicons-outline:office-building",
    color: "#8b5cf6",
    bgColor: "rgba(139,92,246,0.1)",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

function StepTargetAudience({ targetType, onTargetTypeChange }) {
  return (
    <div className="flex flex-col items-center">
      <Typography
        variant="h6"
        className="font-bold mb-8 text-center"
        color="text.primary"
      >
        مخاطبین پیام را انتخاب کنید
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        className="mb-32 text-center max-w-md"
      >
        ابتدا مشخص کنید پیام گروهی به چه گروهی از کاربران ارسال شود
      </Typography>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-24 w-full max-w-2xl items-stretch"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {targetOptions.map((option) => {
          const isSelected = targetType === option.value;
          return (
            <motion.div key={option.value} variants={cardVariants} style={{ height: "100%" }}>
              <Card
                sx={{
                  borderRadius: 4,
                  border: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderColor: isSelected ? option.color : "transparent",
                  boxShadow: isSelected
                    ? `0 0 0 1px ${option.color}, 0 8px 25px -5px ${option.color}40`
                    : "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 30px -8px ${option.color}30`,
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
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 10,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: option.color,
                      }}
                    >
                      <FuseSvgIcon size={14} sx={{ color: "#fff" }}>
                        heroicons-solid:check
                      </FuseSvgIcon>
                    </Avatar>
                  </motion.div>
                )}
                <CardActionArea
                  onClick={() => onTargetTypeChange(option.value)}
                  sx={{ borderRadius: 4, p: 1, flex: 1, display: "flex", alignItems: "stretch" }}
                >
                  <CardContent className="flex flex-col items-center text-center p-16 md:p-24">
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: option.bgColor,
                        mb: 2,
                        transition: "all 0.3s ease",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      <FuseSvgIcon size={32} sx={{ color: option.color }}>
                        {option.icon}
                      </FuseSvgIcon>
                    </Box>
                    <Typography
                      variant="h6"
                      className="font-bold mb-8"
                      sx={{ color: isSelected ? option.color : "text.primary" }}
                    >
                      {option.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default StepTargetAudience;
