import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import FuseLoading from "@fuse/core/FuseLoading";
import { useAppSelector } from "app/store/hooks";
import UserListItem from "./UserListItem";
import {
  groupUsersByFirstLetter,
  useGetUsersListQuery,
} from "./UserApi";
import { selectSearchText } from "./usersAppSlice";

const PAGE_SIZE = 10;

/**
 * The UsersList component with infinite scroll.
 */
function UsersList() {
  const searchText = useAppSelector(selectSearchText);
  const [pageNumber, setPageNumber] = useState(1);

  // Reset to page 1 whenever the search text changes
  useEffect(() => {
    setPageNumber(1);
  }, [searchText]);

  const queryArgs = useMemo(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      search: searchText,
      sortBy: "firstName",
      sortDir: "asc",
    }),
    [pageNumber, searchText]
  );

  const { data, isLoading, isFetching } = useGetUsersListQuery(queryArgs);

  const users = data?.data;
  const totalPages = data?.totalPages ?? 1;
  const hasMore = pageNumber < totalPages;

  // Keep hasMore and isFetching in refs so IntersectionObserver callback is never stale
  const hasMoreRef = useRef(hasMore);
  const isFetchingRef = useRef(isFetching);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isFetchingRef.current = isFetching; }, [isFetching]);

  const groupedUsers = useMemo(
    () => groupUsersByFirstLetter(users),
    [users]
  );

  // Intersection observer for infinite scroll
  const observerRef = useRef(null);
  const sentinelRef = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
            setPageNumber((prev) => prev + 1);
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(node);
    },
    [] // No deps — we read from refs so it's always fresh
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (isLoading && pageNumber === 1) {
    return <FuseLoading />;
  }

  if (!users || users.length === 0) {
    if (isFetching) {
      return <FuseLoading />;
    }
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          کاربری وجود ندارد!
        </Typography>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      className="flex flex-col flex-auto w-full max-h-full"
    >
      {Object.entries(groupedUsers).map(([key, group]) => (
        <div key={key} className="relative">
          <Typography
            color="text.secondary"
            className="px-32 py-4 text-14 font-medium"
          >
            {key}
          </Typography>
          <Divider />
          <List className="w-full m-0 p-0">
            {group?.children?.map((item) => (
              <UserListItem key={item.id} user={item} />
            ))}
          </List>
        </div>
      ))}

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="flex justify-center py-16" style={{ minHeight: 48 }}>
        {isFetching && (
          <CircularProgress size={28} />
        )}
        {!hasMore && !isFetching && users.length > 0 && (
          <Typography color="text.secondary" className="text-13">
            تمامی کاربران بارگذاری شدند
          </Typography>
        )}
      </div>
    </motion.div>
  );
}

export default UsersList;