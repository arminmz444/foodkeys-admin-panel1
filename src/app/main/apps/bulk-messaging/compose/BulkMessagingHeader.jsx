import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

const navTabs = [
  {
    label: "ارسال جدید",
    icon: "heroicons-outline:pencil-alt",
    path: "/apps/bulk-messaging/compose",
  },
  {
    label: "لیست وظایف",
    icon: "heroicons-outline:clipboard-list",
    path: "/apps/bulk-messaging/tasks",
  },
];

function BulkMessagingHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = useMemo(() => {
    const idx = navTabs.findIndex((t) => location.pathname.startsWith(t.path));
    return idx >= 0 ? idx : 0;
  }, [location.pathname]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col sm:flex-row space-y-12 sm:space-y-0 flex-1 w-full items-center justify-between py-8 sm:py-16 px-16 md:px-24">
        <motion.span
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { delay: 0.2 } }}
          className="flex items-center gap-12"
        >
          <FuseSvgIcon size={28} color="action">
            heroicons-outline:speakerphone
          </FuseSvgIcon>
          <Typography
            className="flex text-24 md:text-32 font-extrabold tracking-tight"
            component="h1"
          >
            ارسال پیام گروهی
          </Typography>
        </motion.span>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
          className="flex items-center gap-8"
        >
          <Button
            component={Link}
            to="/apps/bulk-messaging/compose"
            variant="contained"
            color="secondary"
            startIcon={
              <FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>
            }
            sx={{
              borderRadius: 3,
              transition: "all 0.2s ease",
              "&:hover": { transform: "translateY(-1px)" },
            }}
          >
            ارسال جدید
          </Button>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 1, md: 3 } }}>
        <Tabs
          value={currentTab}
          onChange={(_, newVal) => navigate(navTabs[newVal].path)}
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              minHeight: 52,
              fontWeight: 700,
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              transition: "all 0.2s ease",
            },
          }}
        >
          {navTabs.map((tab) => (
            <Tab
              key={tab.path}
              label={tab.label}
              icon={<FuseSvgIcon size={22}>{tab.icon}</FuseSvgIcon>}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>
    </div>
  );
}

export default BulkMessagingHeader;
