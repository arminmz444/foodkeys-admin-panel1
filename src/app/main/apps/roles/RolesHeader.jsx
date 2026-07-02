import Input from "@mui/material/Input";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Box from "@mui/material/Box";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import {
  setSearchText,
  setInputSearchText,
  resetSearchText,
  selectSearchText,
  selectInputSearchText,
} from "./rolesAppSlice";
import { useGetRolesListPaginatedQuery } from "./RoleApi";
import RoleEditModal from "./RoleEditModal";

function RolesHeader() {
  const dispatch = useAppDispatch();
  const searchText = useAppSelector(selectSearchText);
  const inputSearchText = useAppSelector(selectInputSearchText);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data, isLoading } = useGetRolesListPaginatedQuery({
    pageNumber: 1,
    pageSize: 10000,
    search: searchText,
    sortBy: "name",
    sortDir: "asc",
  });

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        dispatch(setSearchText(value));
      }, 400),
    [dispatch]
  );

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
    <>
      <div className="p-24 sm:p-32 w-full border-b-1">
        <div className="flex flex-col gap-y-3">
          <motion.span
            initial={{ x: -20 }}
            animate={{ x: 0, transition: { delay: 0.2 } }}
          >
            <Typography className="text-24 md:text-32 font-extrabold tracking-tight leading-none">
              مدیریت نقش‌ها
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
              {`${data?.totalElements ?? 0} نقش`}
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
              placeholder="جستجوی نقش‌ها"
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
            onClick={() => setCreateModalOpen(true)}
          >
            <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
            <span className="hidden sm:flex mx-8 font-400">
              افزودن نقش جدید
            </span>
          </Button>
        </div>
      </div>

      <RoleEditModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        role={null}
      />
    </>
  );
}

export default RolesHeader;
