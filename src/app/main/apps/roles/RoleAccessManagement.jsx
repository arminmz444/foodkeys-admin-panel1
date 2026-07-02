import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
  Drawer,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import {
  useGetRoleAccessesQuery,
  useGetAllAccessesQuery,
  useSetRoleAccessesMutation,
  useGetRoleItemQuery,
  groupAccessesByEntity,
  sortAccessesByScope,
  getOperationDisplayName,
  getScopeLabel,
  getScopeColor,
  isProtectedRole,
} from "./RoleApi";
import {
  selectSelectedRoleId,
  selectAccessManagementOpen,
  selectAccessManagementViewOnly,
  closeAccessManagement,
} from "./rolesAppSlice";

function RoleAccessManagement() {
  const dispatch = useAppDispatch();
  const roleId = useAppSelector(selectSelectedRoleId);
  const isOpen = useAppSelector(selectAccessManagementOpen);
  const viewOnly = useAppSelector(selectAccessManagementViewOnly);

  const [selectedAccesses, setSelectedAccesses] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);
  const [expandedEntities, setExpandedEntities] = useState({});

  const { data: role, isLoading: isLoadingRole } = useGetRoleItemQuery(roleId, {
    skip: !roleId,
  });

  const { data: roleAccesses = [], isLoading: isLoadingRoleAccesses, refetch: refetchRoleAccesses } = useGetRoleAccessesQuery(roleId, {
    skip: !roleId,
  });

  const { data: allAccesses = [], isLoading: isLoadingAllAccesses } = useGetAllAccessesQuery(undefined, {
    skip: viewOnly,
  });

  const [setRoleAccesses, { isLoading: isSaving }] = useSetRoleAccessesMutation();

  const isProtected = isProtectedRole(role);
  const isReadOnly = viewOnly || isProtected;
  const isLoading = isLoadingRole || isLoadingRoleAccesses || (!viewOnly && isLoadingAllAccesses);

  useEffect(() => {
    if (roleAccesses && roleAccesses.length >= 0) {
      const accessIds = roleAccesses.map((access) => access.id);
      setSelectedAccesses(accessIds);
    }
  }, [roleAccesses]);

  useEffect(() => {
    if (!isOpen) {
      setSearchText("");
      setShowOnlyAssigned(false);
      setExpandedEntities({});
    }
  }, [isOpen]);

  const handleClose = () => {
    dispatch(closeAccessManagement());
  };

  const handleAccessToggle = (accessId) => {
    if (isProtected) return;

    const currentIndex = selectedAccesses.indexOf(accessId);
    const newSelectedAccesses = [...selectedAccesses];

    if (currentIndex === -1) {
      newSelectedAccesses.push(accessId);
    } else {
      newSelectedAccesses.splice(currentIndex, 1);
    }

    setSelectedAccesses(newSelectedAccesses);
  };

  const handleSelectAll = (accessIds) => {
    if (isProtected) return;
    
    const newSelectedAccesses = [...new Set([...selectedAccesses, ...accessIds])];
    setSelectedAccesses(newSelectedAccesses);
  };

  const handleDeselectAll = (accessIds) => {
    if (isProtected) return;
    
    const newSelectedAccesses = selectedAccesses.filter(id => !accessIds.includes(id));
    setSelectedAccesses(newSelectedAccesses);
  };

  const handleSave = async () => {
    try {
      await setRoleAccesses({
        roleId,
        accessIds: selectedAccesses,
      }).unwrap();

      await refetchRoleAccesses();
      dispatch(showMessage({ message: "دسترسی‌های نقش با موفقیت بروزرسانی شد" }));
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error(error);
      dispatch(
        showMessage({
          message: error?.data?.message || "خطا در بروزرسانی دسترسی‌های نقش",
          variant: "error",
        })
      );
    }
  };

  const filterAccesses = (accesses) => {
    let filtered = accesses;

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (access) =>
          (access.name && access.name.toLowerCase().includes(search)) ||
          (access.displayName && access.displayName.toLowerCase().includes(search)) ||
          (access.description && access.description.toLowerCase().includes(search)) ||
          (access.entityName && access.entityName.toLowerCase().includes(search))
      );
    }

    if (!viewOnly && showOnlyAssigned) {
      filtered = filtered.filter((access) => selectedAccesses.includes(access.id));
    }

    return filtered;
  };

  const sourceAccesses = viewOnly ? roleAccesses : allAccesses;

  const filteredAccesses = useMemo(() => {
    return filterAccesses(sourceAccesses);
  }, [sourceAccesses, searchText, showOnlyAssigned, selectedAccesses, viewOnly]);

  const groupedAccesses = useMemo(() => {
    return groupAccessesByEntity(filteredAccesses);
  }, [filteredAccesses]);

  const roleAccessIds = useMemo(() => {
    return new Set(roleAccesses.map((a) => a.id));
  }, [roleAccesses]);

  const hasChanges = useMemo(() => {
    const currentSet = new Set(selectedAccesses);
    if (currentSet.size !== roleAccessIds.size) return true;
    for (const id of roleAccessIds) {
      if (!currentSet.has(id)) return true;
    }
    return false;
  }, [selectedAccesses, roleAccessIds]);

  const handleEntityExpand = (entityName) => {
    setExpandedEntities((prev) => ({
      ...prev,
      [entityName]: !prev[entityName],
    }));
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 600, md: 700 } },
      }}
    >
      <Box className="flex flex-col h-full">
        <Box className="flex items-center justify-between p-16 border-b">
          <div>
            <Typography variant="h6" className="font-bold">
              {viewOnly ? "مشاهده دسترسی‌های نقش" : "مدیریت دسترسی‌های نقش"}
            </Typography>
            {role && (
              <Typography variant="body2" color="text.secondary">
                {role.displayName || role.name}
                {viewOnly && (
                  <Chip
                    size="small"
                    label="فقط مشاهده"
                    color="info"
                    variant="outlined"
                    className="mr-8"
                  />
                )}
                {!viewOnly && isProtected && (
                  <Chip
                    size="small"
                    label="محافظت شده - فقط مشاهده"
                    color="warning"
                    variant="outlined"
                    className="mr-8"
                  />
                )}
              </Typography>
            )}
          </div>
          <IconButton onClick={handleClose}>
            <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
          </IconButton>
        </Box>

        <Box className="p-16 border-b">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="جستجو بر اساس نام، عنوان یا موجودیت"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <FuseSvgIcon color="action" size={20} className="mr-8">
                  heroicons-outline:search
                </FuseSvgIcon>
              ),
            }}
          />
          <FormControlLabel
            className="mt-8"
            control={
              <Switch
                checked={viewOnly ? true : showOnlyAssigned}
                onChange={(e) => setShowOnlyAssigned(e.target.checked)}
                color="primary"
                disabled={viewOnly}
              />
            }
            label="نمایش فقط دسترسی‌های فعال"
          />
        </Box>

        <Box className="flex-1 overflow-auto p-16">
          {isLoading ? (
            <Box className="flex justify-center items-center h-full">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {viewOnly && (
                <Alert severity="info" className="mb-16">
                  در حال مشاهده دسترسی‌های اختصاص‌یافته به این نقش هستید. این حالت فقط خواندنی است.
                </Alert>
              )}

              {!viewOnly && isProtected && (
                <Alert severity="warning" className="mb-16">
                  این نقش سیستمی است و دسترسی‌های آن قابل تغییر نیست.
                </Alert>
              )}

              <Alert severity="info" className="mb-16">
                دسترسی‌ها بر اساس موجودیت و عملیات دسته‌بندی شده‌اند.
                {(viewOnly ? roleAccesses.length : selectedAccesses.length) > 0 && (
                  <Typography variant="body2" className="mt-8">
                    <strong>{viewOnly ? roleAccesses.length : selectedAccesses.length}</strong> دسترسی
                    {viewOnly ? " اختصاص‌یافته" : " انتخاب شده"}
                  </Typography>
                )}
              </Alert>

              {Object.keys(groupedAccesses).length === 0 ? (
                <Typography color="text.secondary" className="text-center py-32">
                  دسترسی قابل نمایشی وجود ندارد
                </Typography>
              ) : (
                Object.entries(groupedAccesses).map(([entityName, entityData]) => {
                  const allEntityAccessIds = Object.values(entityData.operations)
                    .flat()
                    .map((a) => a.id);
                  const selectedCount = viewOnly
                    ? allEntityAccessIds.length
                    : allEntityAccessIds.filter((id) => selectedAccesses.includes(id)).length;
                  const isExpanded = expandedEntities[entityName] !== false;

                  return (
                    <Accordion
                      key={entityName}
                      expanded={isExpanded}
                      onChange={() => handleEntityExpand(entityName)}
                      className="mb-8"
                    >
                      <AccordionSummary
                        expandIcon={<FuseSvgIcon>heroicons-outline:chevron-down</FuseSvgIcon>}
                      >
                        <Box className="flex items-center justify-between w-full pr-16">
                          <Typography variant="subtitle1" className="font-bold">
                            {entityData.displayName || entityName}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${selectedCount}/${allEntityAccessIds.length}`}
                            color={selectedCount > 0 ? "primary" : "default"}
                            variant="outlined"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {!isReadOnly && (
                          <Box className="flex gap-8 mb-16">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSelectAll(allEntityAccessIds)}
                            >
                              انتخاب همه
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="inherit"
                              onClick={() => handleDeselectAll(allEntityAccessIds)}
                            >
                              لغو انتخاب همه
                            </Button>
                          </Box>
                        )}

                        {Object.entries(entityData.operations).map(([operation, accesses]) => {
                          const sortedAccesses = sortAccessesByScope(accesses);

                          return (
                            <Box key={operation} className="mb-16">
                              <Typography
                                variant="subtitle2"
                                className="font-bold mb-8"
                                color="text.secondary"
                              >
                                {getOperationDisplayName(operation)}
                              </Typography>
                              <Divider className="mb-8" />
                              <List dense disablePadding>
                                {sortedAccesses.map((access) => {
                                  const isSelected = viewOnly
                                    ? true
                                    : selectedAccesses.includes(access.id);
                                  const wasAssigned = roleAccessIds.has(access.id);

                                  return (
                                    <ListItem
                                      key={access.id}
                                      className="rounded-lg mb-4"
                                      sx={{
                                        backgroundColor: isSelected
                                          ? "action.selected"
                                          : "transparent",
                                        borderLeft: wasAssigned || viewOnly ? 3 : 0,
                                        borderColor: "success.main",
                                      }}
                                      secondaryAction={
                                        !viewOnly ? (
                                          <Checkbox
                                            edge="end"
                                            onChange={() => handleAccessToggle(access.id)}
                                            checked={isSelected}
                                            disabled={isProtected}
                                          />
                                        ) : (
                                          <FuseSvgIcon color="success" size={20}>
                                            heroicons-solid:check-circle
                                          </FuseSvgIcon>
                                        )
                                      }
                                    >
                                      <ListItemText
                                        primary={
                                          <Box className="flex items-center gap-8">
                                            <Typography variant="body2">
                                              {access.displayName || access.name}
                                            </Typography>
                                            <Chip
                                              size="small"
                                              label={getScopeLabel(access.scope)}
                                              color={getScopeColor(access.scope)}
                                              variant="outlined"
                                            />
                                            {!viewOnly && wasAssigned && !isSelected && (
                                              <Chip
                                                size="small"
                                                label="حذف خواهد شد"
                                                color="error"
                                                variant="filled"
                                              />
                                            )}
                                            {!viewOnly && !wasAssigned && isSelected && (
                                              <Chip
                                                size="small"
                                                label="جدید"
                                                color="success"
                                                variant="filled"
                                              />
                                            )}
                                          </Box>
                                        }
                                        secondary={
                                          <Box>
                                            {access.description && (
                                              <Typography variant="caption" color="text.secondary">
                                                {access.description}
                                              </Typography>
                                            )}
                                            {access.scope === "ONLINE_POLICY_CHECK" &&
                                              access.jsonPath && (
                                                <Tooltip
                                                  title={`شرط: ${access.jsonPath} ${access.policyOperator} ${access.targetValue}`}
                                                >
                                                  <Typography
                                                    variant="caption"
                                                    color="info.main"
                                                    className="block mt-4 cursor-help"
                                                  >
                                                    دارای شرط سیاست (Policy)
                                                  </Typography>
                                                </Tooltip>
                                              )}
                                          </Box>
                                        }
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </Box>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </>
          )}
        </Box>

        <Box className="flex items-center justify-between p-16 border-t bg-grey-50">
          {!viewOnly && (
            <Typography variant="body2" color="text.secondary">
              {hasChanges ? "تغییرات ذخیره نشده وجود دارد" : "بدون تغییر"}
            </Typography>
          )}
          <Box className={`flex gap-8 ${viewOnly ? "w-full justify-end" : ""}`}>
            <Button onClick={handleClose}>بستن</Button>
            {!viewOnly && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setConfirmDialogOpen(true)}
                disabled={!hasChanges || isProtected || isSaving}
              >
                {isSaving ? <CircularProgress size={24} /> : "ذخیره تغییرات"}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تأیید بروزرسانی دسترسی‌ها</DialogTitle>
        <DialogContent>
          <Typography variant="body1" className="mb-16">
            آیا از بروزرسانی دسترسی‌های این نقش اطمینان دارید؟
          </Typography>

          <Alert severity="warning" className="mb-16">
            این عمل تمام دسترسی‌های قبلی را حذف کرده و دسترسی‌های انتخاب شده را جایگزین می‌کند.
          </Alert>

          <Typography variant="subtitle2" className="mb-8">
            دسترسی‌های انتخاب شده ({selectedAccesses.length}):
          </Typography>
          <Box className="flex flex-wrap gap-4 max-h-200 overflow-auto">
            {selectedAccesses.map((id) => {
              const access = allAccesses.find((a) => a.id === id);
              return access ? (
                <Chip
                  key={id}
                  size="small"
                  label={access.displayName || access.name}
                  color="secondary"
                  variant="outlined"
                />
              ) : null;
            })}
            {selectedAccesses.length === 0 && (
              <Typography color="text.secondary" variant="body2">
                هیچ دسترسی انتخاب نشده است
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={isSaving}>
            انصراف
          </Button>
          <Button
            onClick={handleSave}
            color="secondary"
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? <CircularProgress size={24} /> : "تأیید و ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

export default RoleAccessManagement;
