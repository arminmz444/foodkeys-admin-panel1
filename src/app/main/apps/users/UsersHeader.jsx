// // import Button from '@mui/material/Button';
// // import Typography from '@mui/material/Typography';
// // import { motion } from 'framer-motion';
// // import FuseSvgIcon from '@fuse/core/FuseSvgIcon/index.js';
// // import NavLinkAdapter from '@fuse/core/NavLinkAdapter/index.js';
// // import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery.js';
// //
// // /**
// //  * The users header.
// //  */
// // function UserHeader() {
// // 	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
// // 	return (
// // 		<div className="flex space-y-12 sm:space-y-0 flex-1 w-full items-center justify-between py-8 sm:py-16 px-16 md:px-24">
// // 			<motion.span
// // 				initial={{ x: -20 }}
// // 				animate={{ x: 0, transition: { delay: 0.2 } }}
// // 			>
// // 				<Typography className="text-24 md:text-32 font-extrabold tracking-tight">کاربران سایت</Typography>
// // 			</motion.span>
// //
// // 			<div className="flex flex-1 items-center justify-end space-x-8">
// // 				<motion.div
// // 					className="flex flex-grow-0"
// // 					initial={{ opacity: 0, x: 20 }}
// // 					animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
// // 				>
// // 					<Button
// // 						className=""
// // 						variant="contained"
// // 						color="secondary"
// // 						component={NavLinkAdapter}
// // 						to="/apps/users/new"
// // 						size={isMobile ? 'small' : 'medium'}
// // 					>
// // 						<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
// // 						<span className="mx-4 sm:mx-8">ثبت کاربر جدید</span>
// // 					</Button>
// // 				</motion.div>
// // 			</div>
// // 		</div>
// // 	);
// // }
// //
// // export default UserHeader;

// import Input from "@mui/material/Input";
// import Typography from "@mui/material/Typography";
// import { motion } from "framer-motion";
// import Button from "@mui/material/Button";
// import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
// import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import Box from "@mui/material/Box";
// import { useAppDispatch, useAppSelector } from "app/store/hooks";
// import { useEffect } from "react";
// import {
//   setSearchText,
//   resetSearchText,
//   selectSearchText,
// } from "./usersAppSlice.js";
// import {
//   selectFilteredContactList,
//   useGetContactsListQuery,
// } from "./UserApi.js";
// /**
//  * The users' header.
//  */
// function UsersHeader() {
//   const dispatch = useAppDispatch();
//   const searchText = useAppSelector(selectSearchText);
//   const { data, isLoading } = useGetContactsListQuery();
//   const filteredData = useAppSelector(selectFilteredContactList(data));
//   useEffect(() => {
//     return () => {
//       dispatch(resetSearchText());
//     };
//   }, []);

//   if (isLoading) {
//     return null;
//   }

//   return (
//     <div className="p-24 sm:p-32 w-full border-b-1">
//       <div className="flex flex-col gap-y-3">
//         <motion.span
//           initial={{ x: -20 }}
//           animate={{ x: 0, transition: { delay: 0.2 } }}
//         >
//           <Typography className="text-24 md:text-32 font-extrabold tracking-tight leading-none">
//             لیست کاربران{" "}
//           </Typography>
//         </motion.span>
//         <motion.span
//           initial={{ y: -20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
//         >
//           <Typography
//             component={motion.span}
//             className="text-14 font-medium mr-2"
//             color="text.secondary"
//           >
//             {`${filteredData?.length} کاربر`}
//           </Typography>
//         </motion.span>
//       </div>
//       <div className="flex flex-1 items-center mt-16 -mx-8">
//         <Box
//           component={motion.div}
//           initial={{ y: -20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
//           className="flex flex-1 w-full sm:w-auto items-center px-16 mx-8 border-1 rounded-full"
//         >
//           <FuseSvgIcon color="action" size={20}>
//             heroicons-outline:search
//           </FuseSvgIcon>

//           <Input
//             placeholder="جستجوی کاربران"
//             className="flex flex-grow px-16"
//             disableUnderline
//             value={searchText}
//             inputProps={{
//               "aria-label": "Search",
//             }}
//             onChange={(ev) => dispatch(setSearchText(ev))}
//           />
//         </Box>
//         <Button
//           className="mx-8"
//           variant="contained"
//           color="secondary"
//           component={NavLinkAdapter}
//           to="new/edit"
//         >
//           <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
//           <span className="hidden sm:flex mx-8 font-400">
//             افزودن کاربر جدید
//           </span>
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default UsersHeader;

import Input from "@mui/material/Input";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Box from "@mui/material/Box";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { useCallback, useEffect, useMemo } from "react";
import debounce from "lodash/debounce";
import {
  setSearchText,
  setInputSearchText,
  resetSearchText,
  selectSearchText,
  selectInputSearchText,
} from "./usersAppSlice";
import {
  useGetUsersListQuery,
} from "./UserApi";

/**
 * The UsersHeader component.
 */
function UsersHeader() {
  const dispatch = useAppDispatch();
  const searchText = useAppSelector(selectSearchText);
  const inputSearchText = useAppSelector(selectInputSearchText);

  // Query with current search text to get totalElements for the count display
  const { data, isLoading } = useGetUsersListQuery({
    pageNumber: 1,
    pageSize: 10,
    search: searchText,
    sortBy: "firstName",
    sortDir: "asc",
  });

  // Debounced dispatch: updates the actual search text after 400ms of no typing
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(setSearchText(value));
      }, 400),
    [dispatch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
      dispatch(resetSearchText());
    };
  }, [dispatch, debouncedSetSearch]);

  const handleSearchChange = useCallback(
    (ev) => {
      const value = ev.target.value;
      dispatch(setInputSearchText(value));
      debouncedSetSearch(value);
    },
    [dispatch, debouncedSetSearch]
  );

  if (isLoading) {
    return null;
  }

  return (
    <div className="p-24 sm:p-32 w-full border-b-1">
      <div className="flex flex-col gap-y-3">
        <motion.span
          initial={{ x: -20 }}
          animate={{ x: 0, transition: { delay: 0.2 } }}
        >
          <Typography className="text-24 md:text-32 font-extrabold tracking-tight leading-none">
            مدیریت کاربران
          </Typography>
        </motion.span>
        <motion.span
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
        >
          <Typography
            component={motion.span}
            className="text-14 font-medium mr-2"
            color="text.secondary"
          >
            {`${data?.totalElements ?? 0} کاربر`}
          </Typography>
        </motion.span>
      </div>
      <div className="flex flex-1 items-center mt-16 -mx-8">
        <Box
          component={motion.div}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
          className="flex flex-1 w-full sm:w-auto items-center px-16 mx-8 border-1 rounded-full"
        >
          <FuseSvgIcon color="action" size={20}>
            heroicons-outline:search
          </FuseSvgIcon>

          <Input
            placeholder="جستجوی کاربران"
            className="flex flex-grow px-16"
            disableUnderline
            value={inputSearchText}
            inputProps={{
              "aria-label": "جستجو",
            }}
            onChange={handleSearchChange}
          />
        </Box>
        <Button
          className="mx-8"
          variant="contained"
          color="secondary"
          component={NavLinkAdapter}
          to="new/edit"
        >
          <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
          <span className="hidden sm:flex mx-8 font-400">
            افزودن کاربر جدید
          </span>
        </Button>
      </div>
    </div>
  );
}

export default UsersHeader;