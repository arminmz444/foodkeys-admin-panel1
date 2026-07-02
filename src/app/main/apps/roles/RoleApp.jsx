import FusePageSimple from "@fuse/core/FusePageSimple";
import { useRef } from "react";
import { styled } from "@mui/material/styles";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import RolesHeader from "./RolesHeader";
import RolesTable from "./RolesTable";
import RoleAccessManagement from "./RoleAccessManagement";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
  },
}));

/**
 * The RoleApp component - main role management page.
 */
function RoleApp() {
  const pageLayout = useRef(null);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  return (
    <>
      <Root
        header={<RolesHeader />}
        content={<RolesTable />}
        ref={pageLayout}
        scroll={isMobile ? "normal" : "content"}
      />
      <RoleAccessManagement />
    </>
  );
}

export default RoleApp;
