import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import FuseLoading from "@fuse/core/FuseLoading";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import {
  useGetRolesListPaginatedQuery,
  useDeleteRoleMutation,
  isProtectedRole,
  getRoleTypeLabel,
} from "./RoleApi";
import { selectSearchText, openAccessManagement } from "./rolesAppSlice";
import RoleEditModal from "./RoleEditModal";

const PAGE_SIZE = 10000;

function RolesTable() {
  const dispatch = useAppDispatch();
  const searchText = useAppSelector(selectSearchText);
  const [pageNumber, setPageNumber] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  useEffect(() => {
    setPageNumber(1);
  }, [searchText]);

  const queryArgs = useMemo(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      search: searchText,
      sortBy: "name",
      sortDir: "asc",
    }),
    [pageNumber, searchText]
  );

  const { data, isLoading, isFetching } = useGetRolesListPaginatedQuery(queryArgs);

  const roles = data?.data;
  const totalPages = data?.totalPages ?? 1;
  const hasMore = pageNumber < totalPages;

  const hasMoreRef = useRef(hasMore);
  const isFetchingRef = useRef(isFetching);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isFetchingRef.current = isFetching; }, [isFetching]);

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
    []
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handlePermissionsClick = (role) => {
    dispatch(openAccessManagement({ roleId: role.id, viewOnly: false }));
  };

  const handleViewAccessesClick = (role) => {
    dispatch(openAccessManagement({ roleId: role.id, viewOnly: true }));
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole(selectedRole.id).unwrap();
      dispatch(showMessage({ message: "نقش با موفقیت حذف شد" }));
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error(error);
      dispatch(
        showMessage({
          message: error?.data?.message || "خطا در حذف نقش",
          variant: "error",
        })
      );
    }
  };

  const canDelete = (role) => {
    if (isProtectedRole(role)) return false;
    return true;
  };

  const canEdit = (role) => {
    return !isProtectedRole(role);
  };

  const canEditPermissions = (role) => {
    return !isProtectedRole(role);
  };

  if (isLoading && pageNumber === 1) {
    return <FuseLoading />;
  }

  if (!roles || roles.length === 0) {
    if (isFetching) {
      return <FuseLoading />;
    }
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          نقشی وجود ندارد!
        </Typography>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      className="flex flex-col flex-auto w-full max-h-full p-24"
    >
      <TableContainer component={Paper} className="rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="font-bold">نام</TableCell>
              <TableCell className="font-bold">نام نمایشی</TableCell>
              <TableCell className="font-bold">توضیحات</TableCell>
              <TableCell className="font-bold">نوع</TableCell>
              <TableCell className="font-bold">وضعیت</TableCell>
              <TableCell className="font-bold" align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => {
              const isProtected = isProtectedRole(role);
              
              return (
                <TableRow
                  key={role.id}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    opacity: role.enabled === false ? 0.5 : 1,
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-8">
                      <Typography variant="body2" className="font-medium" dir="ltr">
                        {role.name}
                      </Typography>
                      {isProtected && (
                        <Chip
                          size="small"
                          label="محافظت شده"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{role.displayName || "-"}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="max-w-xs truncate"
                    >
                      {role.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getRoleTypeLabel(role.roleType)}
                      color={role.roleType === "SYSTEM" ? "error" : role.roleType === "BUSINESS" ? "warning" : "primary"}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={role.enabled !== false ? "فعال" : "غیرفعال"}
                      color={role.enabled !== false ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-4">
                      <Tooltip title="مشاهده دسترسی‌های نقش">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewAccessesClick(role)}
                        >
                          <FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={canEditPermissions(role) ? "مدیریت دسترسی‌ها" : "دسترسی‌های نقش سیستمی قابل تغییر نیست"}>
                        <span>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handlePermissionsClick(role)}
                            disabled={!canEditPermissions(role)}
                          >
                            <FuseSvgIcon size={20}>heroicons-outline:key</FuseSvgIcon>
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip title={canEdit(role) ? "ویرایش" : "نقش سیستمی قابل ویرایش نیست"}>
                        <span>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEditClick(role)}
                            disabled={!canEdit(role)}
                          >
                            <FuseSvgIcon size={20}>heroicons-outline:pencil</FuseSvgIcon>
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip title={canDelete(role) ? "حذف" : "نقش سیستمی قابل حذف نیست"}>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(role)}
                            disabled={!canDelete(role)}
                          >
                            <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                          </IconButton>
                        </span>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <div ref={sentinelRef} className="flex justify-center py-16" style={{ minHeight: 48 }}>
        {isFetching && <CircularProgress size={28} />}
        {!hasMore && !isFetching && roles.length > 0 && (
          <Typography color="text.secondary" className="text-13">
            تمامی نقش‌ها بارگذاری شدند
          </Typography>
        )}
      </div>

      <RoleEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRole(null);
        }}
        role={selectedRole}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>تأیید حذف نقش</DialogTitle>
        <DialogContent>
          <DialogContentText>
            آیا از حذف نقش "{selectedRole?.displayName || selectedRole?.name}" اطمینان دارید؟
            <br />
            <Typography variant="caption" color="error">
              توجه: در صورتی که کاربری به این نقش اختصاص داده شده باشد، حذف با خطا مواجه خواهد شد.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            انصراف
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : "حذف"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

export default RolesTable;
