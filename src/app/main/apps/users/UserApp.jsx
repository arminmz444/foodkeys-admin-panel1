// import FusePageSimple from "@fuse/core/FusePageSimple";
// import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { styled } from "@mui/material/styles";
// import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
// import UsersHeader from "./UsersHeader";
// import UsersList from "./UsersList";
// import {
//   useGetContactsCountriesQuery,
//   useGetContactsTagsQuery,
//   useGetUsersListQuery,
// } from "./UserApi.js";
// import UsersSidebarContent from "./UsersSidebarContent.jsx";
// import BasicSpeedDial from "../documentation/material-ui-components/components/speed-dial/BasicSpeedDial";

// const Root = styled(FusePageSimple)(({ theme }) => ({
//   "& .FusePageSimple-header": {
//     backgroundColor: theme.palette.background.paper,
//   },
// }));

// /**
//  * The UsersApp page.
//  */
// function UsersApp() {
//   const pageLayout = useRef(null);
//   const routeParams = useParams();
//   const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
//   const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
//   useGetUsersListQuery();
//   useGetContactsCountriesQuery();
//   useGetContactsTagsQuery();
//   useEffect(() => {
//     setRightSidebarOpen(Boolean(routeParams.id));
//   }, [routeParams]);
//   return (
//     <>
//     {/* <Root
//       header={<UsersHeader />}
//       content={<UsersList />}
//       ref={pageLayout}
//       rightSidebarContent={<UsersSidebarContent />}
//       rightSidebarOpen={rightSidebarOpen}
//       rightSidebarOnClose={() => setRightSidebarOpen(false)}
//       rightSidebarWidth={640}
//       rightSidebarVariant="temporary"
//       scroll={isMobile ? "normal" : "content"}
//     /> */}
//           <Root
//             header={<UsersHeader />}
//             content={
//               <>
//                 <UsersList />
//                 <BasicSpeedDial sx={{ position: 'fixed', bottom: 16, left: 16 }} />
//               </>
//             }
//             ref={pageLayout}
//             rightSidebarContent={<UsersSidebarContent />}
//             rightSidebarOpen={rightSidebarOpen}
//             rightSidebarOnClose={() => setRightSidebarOpen(false)}
//             rightSidebarWidth={640}
//             rightSidebarVariant="temporary"
//             scroll={isMobile ? "normal" : "content"}
//           />

//     </>
//   );
// }

// export default UsersApp;


import FusePageSimple from "@fuse/core/FusePageSimple";
import withReducer from "app/store/withReducer";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDeepCompareEffect } from "@fuse/hooks";
import { styled } from "@mui/material/styles";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import usersAppSlice from "./usersAppSlice";
import UsersList from "./UsersList";
import UsersHeader from "./UsersHeader";
import UsersSidebarContent from "./UsersSidebarContent";
import { useGetRolesListQuery, useGetUsersItemQuery } from "./UserApi";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
  },
}));

/**
 * The UsersApp component.
 */
function UsersApp() {
  const pageLayout = useRef(null);
  const routeParams = useParams();
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  useEffect(() => {
		setRightSidebarOpen(Boolean(routeParams.id));
	}, [routeParams]);
  useDeepCompareEffect(() => {
    if (pageLayout.current && pageLayout.current.FuseScrollbars) {
      pageLayout.current.FuseScrollbars.scrollTop(0);
    }
  }, [routeParams]);

  return (
    <Root
      header={<UsersHeader />}
      content={<UsersList />}
      ref={pageLayout}
      rightSidebarContent={<UsersSidebarContent />}
      rightSidebarOpen={Boolean(routeParams.id)}
      rightSidebarWidth={640}
      rightSidebarOnClose={() => {
        // Navigate to the users route when the sidebar is closed
        window.location.href = "/apps/users";
      }}
      scroll={isMobile ? "normal" : "content"}
    />
  );
}

export default UsersApp;