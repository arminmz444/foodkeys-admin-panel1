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
import StepAudienceCriteria from "./steps/StepAudienceCriteria";
import StepMediumSelection from "./steps/StepMediumSelection";
import StepMessageCompose from "./steps/StepMessageCompose";
import StepReview from "./steps/StepReview";
import { useCreateBulkMessagingTaskMutation, useGetAudienceCriteriaQuery } from "../BulkMessagingApi";

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

  const [targetType, setTargetType] = useState("");
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [audienceCriteria, setAudienceCriteria] = useState([]);
  const [bundleId, setBundleId] = useState("");
  const [companyStatus, setCompanyStatus] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [excludedUsernames, setExcludedUsernames] = useState([]);
  const [selectedMediums, setSelectedMediums] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [createTask, { isLoading: isSubmitting }] =
    useCreateBulkMessagingTaskMutation();
  const { data: criteriaOptions = [] } = useGetAudienceCriteriaQuery();

  const getSteps = useCallback(() => {
    const list = [
      { key: "target", label: "مخاطبین هدف", icon: "heroicons-outline:users" },
    ];
    if (targetType === "subcategories") {
      list.push(
        { key: "subcategories", label: "انتخاب زیردسته‌ها", icon: "heroicons-outline:collection" },
        { key: "audienceCriteria", label: "نوع مخاطبین", icon: "heroicons-outline:funnel" }
      );
    }
    if (targetType === "users") {
      list.push({ key: "exclusions", label: "لیست استثنا", icon: "heroicons-outline:user-remove" });
    }
    list.push(
      { key: "medium", label: "روش ارسال", icon: "heroicons-outline:share" },
      { key: "message", label: "متن پیام", icon: "heroicons-outline:pencil-alt" },
      { key: "review", label: "بررسی و ارسال", icon: "heroicons-outline:check-circle" }
    );
    return list;
  }, [targetType]);

  const stepList = getSteps();
  const currentStepKey = stepList[activeStep]?.key;

  const handleNext = () => {
    setDirection(1);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setActiveStep((prev) => prev - 1);
  };

  const canProceed = () => {
    switch (currentStepKey) {
      case "target":
        return !!targetType;
      case "subcategories":
        return selectedSubCategories.length > 0;
      case "audienceCriteria": {
        if (audienceCriteria.length === 0) return false;
        const needsBundle = audienceCriteria.some((c) => {
          const opt = criteriaOptions.find((o) => o.code === c);
          return opt && (opt.requiresBundleId === true || opt.requiresBundleId === "true");
        });
        const needsStatus = audienceCriteria.some((c) => {
          const opt = criteriaOptions.find((o) => o.code === c);
          return opt && (opt.requiresCompanyStatus === true || opt.requiresCompanyStatus === "true");
        });
        if (needsBundle && !bundleId.trim()) return false;
        if (needsStatus && !companyStatus.trim()) return false;
        return true;
      }
      case "medium":
        return selectedMediums.length > 0;
      case "message":
        return messageContent.trim().length > 0;
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
        payload.audienceCriteria = audienceCriteria;
        if (bundleId) {
          payload.bundleId = Number(bundleId);
        }
        if (companyStatus) {
          payload.companyStatus = companyStatus;
        }
      }
      if (excludedUsernames.length > 0) {
        payload.excludedUsernames = excludedUsernames;
      }
      if (selectedTemplateId) {
        payload.templateId = selectedTemplateId;
      }
      if (scheduledAt) {
        payload.scheduledAt = scheduledAt;
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
    switch (currentStepKey) {
      case "target":
        return (
          <StepTargetAudience
            targetType={targetType}
            onTargetTypeChange={(val) => {
              setTargetType(val);
              setSelectedSubCategories([]);
              setAudienceCriteria([]);
              setBundleId("");
              setCompanyStatus("");
              setExcludedUsernames([]);
              setActiveStep(0);
            }}
          />
        );
      case "subcategories":
        return (
          <StepSubCategorySelection
            selectedSubCategories={selectedSubCategories}
            onSubCategoriesChange={setSelectedSubCategories}
          />
        );
      case "audienceCriteria":
        return (
          <StepAudienceCriteria
            audienceCriteria={audienceCriteria}
            onAudienceCriteriaChange={setAudienceCriteria}
            bundleId={bundleId}
            onBundleIdChange={setBundleId}
            companyStatus={companyStatus}
            onCompanyStatusChange={setCompanyStatus}
            scheduledAt={scheduledAt}
            onScheduledAtChange={setScheduledAt}
          />
        );
      case "exclusions":
        return (
          <StepExclusions
            excludedUsernames={excludedUsernames}
            onExcludedUsernamesChange={setExcludedUsernames}
          />
        );
      case "medium":
        return (
          <StepMediumSelection
            selectedMediums={selectedMediums}
            onMediumsChange={setSelectedMediums}
            showAudiencePreview={targetType === "subcategories"}
            targetType={targetType}
            selectedSubCategories={selectedSubCategories}
            audienceCriteria={audienceCriteria}
            bundleId={bundleId}
            companyStatus={companyStatus}
            excludedUsernames={excludedUsernames}
          />
        );
      case "message":
        return (
          <StepMessageCompose
            messageContent={messageContent}
            onMessageContentChange={setMessageContent}
            selectedTemplateId={selectedTemplateId}
            onTemplateIdChange={setSelectedTemplateId}
          />
        );
      case "review":
        return (
          <StepReview
            targetType={targetType}
            selectedSubCategories={selectedSubCategories}
            audienceCriteria={audienceCriteria}
            bundleId={bundleId}
            companyStatus={companyStatus}
            scheduledAt={scheduledAt}
            excludedUsernames={excludedUsernames}
            selectedMediums={selectedMediums}
            messageContent={messageContent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FusePageCarded
      header={<BulkMessagingHeader />}
      content={
        <div className="flex flex-col w-full p-16 md:p-24 max-w-4xl mx-auto">
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
              {stepList.map((step) => (
                <Step key={step.key}>
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
            <Box className="sm:hidden mb-16">
              <Typography
                variant="subtitle1"
                className="font-bold text-center"
                color="secondary"
              >
                {stepList[activeStep]?.label}
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

              {activeStep < stepList.length - 1 ? (
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
