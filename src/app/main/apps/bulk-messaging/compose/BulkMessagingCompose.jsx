import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  Box,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FusePageCarded from "@fuse/core/FusePageCarded";
import { useThemeMediaQuery } from "@fuse/hooks";
import { enqueueSnackbar } from "notistack";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import BulkMessagingHeader from "./BulkMessagingHeader";
import StepTargetAudience from "./steps/StepTargetAudience";
import StepExclusions from "./steps/StepExclusions";
import StepSubCategorySelection from "./steps/StepSubCategorySelection";
import StepMediumSelection from "./steps/StepMediumSelection";
import StepMessageCompose from "./steps/StepMessageCompose";
import StepReview from "./steps/StepReview";
import { useCreateBulkMessagingTaskMutation } from "../BulkMessagingApi";

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? -120 : 120,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? -120 : 120,
    opacity: 0,
  }),
};

function BulkMessagingCompose() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(0);

  // Form state
  const [targetType, setTargetType] = useState(""); // "users" | "subcategories"
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [excludedUsernames, setExcludedUsernames] = useState([]);
  const [selectedMediums, setSelectedMediums] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [createTask, { isLoading: isSubmitting }] =
    useCreateBulkMessagingTaskMutation();

  // Dynamically build steps based on target type
  const getSteps = useCallback(() => {
    const steps = [
      { label: "مخاطبین هدف", icon: "heroicons-outline:users" },
    ];
    if (targetType === "subcategories") {
      steps.push({
        label: "انتخاب زیردسته‌ها",
        icon: "heroicons-outline:collection",
      });
    }
    if (targetType === "users") {
      steps.push({
        label: "لیست استثنا",
        icon: "heroicons-outline:user-remove",
      });
    }
    steps.push(
      { label: "روش ارسال", icon: "heroicons-outline:share" },
      { label: "متن پیام", icon: "heroicons-outline:pencil-alt" },
      { label: "بررسی و ارسال", icon: "heroicons-outline:check-circle" }
    );
    return steps;
  }, [targetType]);

  const steps = getSteps();

  const handleNext = () => {
    setDirection(1);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setActiveStep((prev) => prev - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return !!targetType;
      case 1:
        if (targetType === "subcategories")
          return selectedSubCategories.length > 0;
        return true; // exclusions are optional for users
      case 2:
        return selectedMediums.length > 0;
      case 3:
        return messageContent.trim().length > 0;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        targetType,
        mediums: selectedMediums,
        messageContent,
      };
      if (targetType === "subcategories") {
        payload.subcategoryIds = selectedSubCategories.map((sc) => sc.id);
      }
      if (excludedUsernames.length > 0) {
        payload.excludedUsernames = excludedUsernames;
      }
      if (selectedTemplateId) {
        payload.templateId = selectedTemplateId;
      }

      await createTask(payload).unwrap();
      enqueueSnackbar("عملیات ارسال گروهی با موفقیت ایجاد شد", {
        variant: "success",
        style: { fontSize: "medium" },
      });
      navigate("/apps/bulk-messaging/tasks");
    } catch (error) {
      enqueueSnackbar("خطا در ایجاد عملیات ارسال گروهی", {
        variant: "error",
        style: { fontSize: "medium" },
      });
    }
  };

  const renderStepContent = () => {
    // Map step index to component based on dynamic steps
    let stepIndex = activeStep;
    // Step 0 = target audience
    if (stepIndex === 0) {
      return (
        <StepTargetAudience
          targetType={targetType}
          onTargetTypeChange={(val) => {
            setTargetType(val);
            // Reset dependent state
            setSelectedSubCategories([]);
            setExcludedUsernames([]);
          }}
        />
      );
    }

    // Step 1 = subcategory selection OR exclusions
    if (stepIndex === 1) {
      if (targetType === "subcategories") {
        return (
          <StepSubCategorySelection
            selectedSubCategories={selectedSubCategories}
            onSubCategoriesChange={setSelectedSubCategories}
          />
        );
      }
      return (
        <StepExclusions
          excludedUsernames={excludedUsernames}
          onExcludedUsernamesChange={setExcludedUsernames}
        />
      );
    }

    // Step 2 = medium selection
    if (stepIndex === 2) {
      return (
        <StepMediumSelection
          selectedMediums={selectedMediums}
          onMediumsChange={setSelectedMediums}
        />
      );
    }

    // Step 3 = message compose
    if (stepIndex === 3) {
      return (
        <StepMessageCompose
          messageContent={messageContent}
          onMessageContentChange={setMessageContent}
          selectedTemplateId={selectedTemplateId}
          onTemplateIdChange={setSelectedTemplateId}
        />
      );
    }

    // Step 4 = review
    if (stepIndex === 4) {
      return (
        <StepReview
          targetType={targetType}
          selectedSubCategories={selectedSubCategories}
          excludedUsernames={excludedUsernames}
          selectedMediums={selectedMediums}
          messageContent={messageContent}
        />
      );
    }

    return null;
  };

  return (
    <FusePageCarded
      header={<BulkMessagingHeader />}
      content={
        <div className="flex flex-col w-full p-16 md:p-24 max-w-4xl mx-auto">
          {/* Stepper */}
          <Paper
            className="p-16 md:p-24 mb-24 rounded-xl shadow-md"
            elevation={0}
            sx={{
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
            }}
          >
            <Stepper
              activeStep={activeStep}
              alternativeLabel={!isSmall}
              orientation={isSmall ? "vertical" : "horizontal"}
              sx={{
                "& .MuiStepLabel-label": {
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                  fontWeight: 700,
                },
                "& .MuiStepIcon-root": {
                  fontSize: { xs: "1.6rem", sm: "1.85rem" },
                  transition: "all 0.3s ease",
                },
                "& .MuiStepIcon-root.Mui-active": {
                  color: "secondary.main",
                  transform: "scale(1.2)",
                  transition: "transform 0.3s ease",
                },
                "& .MuiStepIcon-root.Mui-completed": {
                  color: "success.main",
                },
              }}
            >
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconProps={{
                      sx: { transition: "all 0.3s ease" },
                    }}
                  >
                    <span className="hidden sm:inline">{step.label}</span>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Step Content with Animation */}
          <Paper
            className="p-16 md:p-32 rounded-xl shadow-lg min-h-[400px] relative overflow-hidden"
            elevation={0}
            sx={{
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "#fff",
            }}
          >
            {/* Mobile step title */}
            <Box className="sm:hidden mb-16">
              <Typography
                variant="subtitle1"
                className="font-bold text-center"
                color="secondary"
              >
                {steps[activeStep]?.label}
              </Typography>
            </Box>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </Paper>

          {/* Navigation Buttons */}
          <Box className="flex justify-between items-center mt-24 gap-12">
            <Button
              variant="outlined"
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={
                <FuseSvgIcon size={20}>
                  heroicons-outline:arrow-right
                </FuseSvgIcon>
              }
              sx={{ borderRadius: 3, px: 3, py: 1 }}
            >
              مرحله قبل
            </Button>

            <Box className="flex gap-8">
              <Button
                variant="text"
                color="inherit"
                onClick={() => navigate("/apps/bulk-messaging/tasks")}
                sx={{ borderRadius: 3 }}
              >
                لیست وظایف
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!canProceed()}
                  onClick={handleNext}
                  endIcon={
                    <FuseSvgIcon size={20}>
                      heroicons-outline:arrow-left
                    </FuseSvgIcon>
                  }
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-1px)", boxShadow: 6 },
                  }}
                >
                  مرحله بعد
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <FuseSvgIcon size={20}>
                        heroicons-outline:paper-airplane
                      </FuseSvgIcon>
                    )
                  }
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1,
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-1px)", boxShadow: 6 },
                  }}
                >
                  {isSubmitting ? "در حال ارسال..." : "ارسال پیام گروهی"}
                </Button>
              )}
            </Box>
          </Box>
        </div>
      }
      scroll={isMobile ? "normal" : "content"}
    />
  );
}

export default BulkMessagingCompose;
