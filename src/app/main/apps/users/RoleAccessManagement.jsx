import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
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
  Tooltip
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import {
  useGetRolesListQuery,
  useGetAccessesListQuery,
  useGetUserRolesQuery,
  useGetUserAccessesQuery,
  useUpdateUserAccessesMutation,
  groupAccessesByEntity,
  sortAccessesByScope,
  filterDirectlyAssignableAccesses, getOperationDisplayName, useUpdateUserRolesMutation
} from "./UserApi";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-permissions-tabpanel-${index}`}
      aria-labelledby={`user-permissions-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `user-permissions-tab-${index}`,
    'aria-controls': `user-permissions-tabpanel-${index}`,
  };
}

/**
 * Component for managing user roles and accesses
 */
function RoleAccessManagement({ userId }) {
  const [tabValue, setTabValue] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedAccesses, setSelectedAccesses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const dispatch = useAppDispatch();

  // API queries
  const { data: rolesList = { data: [] }, isLoading: isLoadingRoles } = useGetRolesListQuery();
  const { data: accessesList = { data: [] }, isLoading: isLoadingAccesses } = useGetAccessesListQuery();
  const { data: userRoles = { data: [] }, isLoading: isLoadingUserRoles, refetch: refetchUserRoles } = useGetUserRolesQuery(userId);
  const { data: userAccesses = { data: [] }, isLoading: isLoadingUserAccesses, refetch: refetchUserAccesses } = useGetUserAccessesQuery(userId);

  // API mutations
  const [updateUserAccesses] = useUpdateUserAccessesMutation();
  const [updateUserRoles] = useUpdateUserRolesMutation();

  // Set selected roles and accesses when data is loaded
  useEffect(() => {
    if (userRoles?.data) {
      const roleIds = rolesList?.data?.filter(role => 
        // userRoles.data.includes(role.name)
          userRoles?.data?.some(r => r.name === role.name)
      ).map(role => role.id);
      setSelectedRoles(roleIds || []);
    }
  }, [userRoles, rolesList]);

  useEffect(() => {
    if (userAccesses?.data) {
      const accessIds = accessesList?.data?.filter(access => 
        userAccesses.data.includes(access.name)
      ).map(access => access.id);
      setSelectedAccesses(accessIds || []);
    }
  }, [userAccesses, accessesList]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRoleToggle = (roleId) => {
    const currentIndex = selectedRoles.indexOf(roleId);
    const newSelectedRoles = [...selectedRoles];

    if (currentIndex === -1) {
      newSelectedRoles.push(roleId);
    } else {
      newSelectedRoles.splice(currentIndex, 1);
    }
    
    setSelectedRoles(newSelectedRoles);
  };

  const handleAccessToggle = (accessId) => {
    const currentIndex = selectedAccesses.indexOf(accessId);
    const newSelectedAccesses = [...selectedAccesses];

    if (currentIndex === -1) {
      newSelectedAccesses.push(accessId);
    } else {
      newSelectedAccesses.splice(currentIndex, 1);
    }
    
    setSelectedAccesses(newSelectedAccesses);
  };

  const openDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleSaveRoles = async () => {
    try {
      setConfirmLoading(true);

      await updateUserRoles({ userId,
        roles: selectedRoles.map(id => ({ id })) }).unwrap();
      
      await refetchUserRoles();
      dispatch(showMessage({ message: "نقش‌های کاربر با موفقیت بروزرسانی شد" }));
    } catch (error) {
      console.error(error);
      dispatch(showMessage({ 
        message: "خطا در بروزرسانی نقش‌های کاربر", 
        variant: "error" 
      }));
    } finally {
      setConfirmLoading(false);
      setDialogOpen(false);
    }
  };

  const handleSaveAccesses = async () => {
    try {
      setConfirmLoading(true);
      
      await updateUserAccesses({
        userId,
        accesses: selectedAccesses.map(id => ({ id }))
      }).unwrap();
      
      await refetchUserAccesses();
      dispatch(showMessage({ message: "دسترسی‌های کاربر با موفقیت بروزرسانی شد" }));
    } catch (error) {
      console.error(error);
      dispatch(showMessage({ 
        message: "خطا در بروزرسانی دسترسی‌های کاربر", 
        variant: "error" 
      }));
    } finally {
      setConfirmLoading(false);
      setDialogOpen(false);
    }
  };

  const isLoading = isLoadingRoles || isLoadingAccesses || isLoadingUserRoles || isLoadingUserAccesses;

  const filterItems = (items, searchText) => {
    if (!searchText) return items;
    return items.filter(item => 
      (item.name && item.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.displayName && item.displayName.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  // Filter roles: exclude system roles (COMMON_CRM_ROLE / BUSINESS_ROLE)
  // These can only be assigned via roles, not directly
  const assignableRoles = (rolesList?.data || []).filter(role => !role.hidden);
  const filteredRoles = filterItems(assignableRoles, searchText);
  // Filter accesses: only show directly assignable ones
  const assignableAccesses = filterDirectlyAssignableAccesses(accessesList?.data || []);
  const filteredAccesses = filterItems(assignableAccesses, searchText);
  
  // Group accesses by entity for better UX
  const groupedAccesses = groupAccessesByEntity(filteredAccesses);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="user permissions tabs"
            indicatorColor="secondary"
            textColor="secondary"
          >
            <Tab label="نقش‌های کاربر" {...a11yProps(0)} />
            <Tab label="دسترسی‌های کاربر" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="جستجو"
            placeholder="جستجو بر اساس نام یا عنوان نمایشی"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <FuseSvgIcon color="action" size={20}>
                  heroicons-outline:search
                </FuseSvgIcon>
              ),
            }}
          />
        </Box>

        <TabPanel value={tabValue} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {(rolesList?.data || []).some(role => role.hidden) && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  نقش‌های سیستمی (مانند ADMIN، EMPLOYEE) و نقش‌های کسب‌وکار از طریق مدیریت نقش‌ها قابل تخصیص هستند.
                  این نقش‌ها نمی‌توانند مستقیماً به کاربر اختصاص یابند.
                </Alert>
              )}
              
              <List sx={{ width: '100%' }}>
                {filteredRoles.map((role) => {
                  console.log(role)
                  const isSelected = selectedRoles.indexOf(role.id) !== -1;
                  const isAssigned = userRoles.data?.includes(role.name);
                  const roleTypeLabel = role.roleType === 'SYSTEM' ? 'سیستمی' : 
                                       role.roleType === 'BUSINESS' ? 'کسب‌وکار' : 'سفارشی';
                  
                  return (
                    <ListItem 
                      key={role.id}
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          onChange={() => handleRoleToggle(role.id)}
                          checked={isSelected}
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {role.displayName || role.name}
                            </Typography>
                            {isAssigned && (
                              <Chip 
                                size="small" 
                                label="فعال" 
                                color="success" 
                                variant="outlined"
                              />
                            )}
                            {role.roleType && (
                              <Chip 
                                size="small" 
                                label={roleTypeLabel} 
                                color={role.roleType === 'CUSTOM' ? 'primary' : 'default'}
                                variant="filled"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {role.description || role.name}
                            </Typography>
                            {role.accesses && role.accesses.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                شامل {role.accesses.length} دسترسی
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => openDialog('roles')}
                >
                  ذخیره تغییرات نقش‌ها
                </Button>
              </Box>
            </>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                دسترسی‌های دسته‌بندی شده بر اساس موجودیت (Entity) و عملیات (Operation) نمایش داده می‌شوند.
                دسترسی‌های با محدوده ONLINE_POLICY_CHECK برای رکوردها یا محدوده‌های خاصی اعمال می‌شوند.
              </Alert>
              
              {Object.keys(groupedAccesses).length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  دسترسی قابل نمایشی وجود ندارد
                </Typography>
              ) : (
                // const { data: rolesList = { data: [] }, isLoading: isLoadingRoles } = useGetRolesListQuery();

                Object.entries(groupedAccesses).map(([entityName, accessObj]) => {
                  const displayName = accessObj?.displayName || "سایر";
                  const operations = accessObj?.operations || [];

                  return (
                  <Accordion key={entityName} defaultExpanded={Object.keys(groupedAccesses).length === 1}>
                    <AccordionSummary expandIcon={<FuseSvgIcon>heroicons-outline:chevron-down</FuseSvgIcon>}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {displayName}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {Object.entries(operations).map(([operation, accesses]) => {
                        const sortedAccesses = sortAccessesByScope(accesses);
                        
                        return (
                          <Box key={operation} sx={{ mb: 2 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 1, 
                                color: 'text.secondary',
                                textTransform: 'uppercase'
                              }}
                            >
                              {getOperationDisplayName(operation)}
                            </Typography>
                            <List dense>
                              {sortedAccesses.map((access) => {
                                const isSelected = selectedAccesses.indexOf(access.id) !== -1;
                                const isAssigned = userAccesses.data?.includes(access.name);
                                const scopeLabel = access.scope === 'ALL' ? 'همه' : 
                                                  access.scope === 'OWN' ? 'خود' : 
                                                  access.scope === 'ONLINE_POLICY_CHECK' ? 'شرطی' : access.scope;
                                const scopeColor = access.scope === 'ALL' ? 'error' : 
                                                  access.scope === 'OWN' ? 'warning' : 
                                                  access.scope === 'ONLINE_POLICY_CHECK' ? 'info' : 'default';
                                
                                return (
                                  <ListItem 
                                    key={access.id}
                                    sx={{ 
                                      pl: 4, 
                                      borderLeft: isAssigned ? 3 : 0,
                                      borderColor: 'success.main'
                                    }}
                                    secondaryAction={
                                      <Checkbox
                                        edge="end"
                                        onChange={() => handleAccessToggle(access.id)}
                                        checked={isSelected}
                                      />
                                    }
                                  >
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography variant="body2">
                                            {access.displayName || access.name}
                                          </Typography>
                                          <Chip 
                                            size="small" 
                                            label={scopeLabel} 
                                            color={scopeColor}
                                            variant="outlined"
                                          />
                                          {isAssigned && (
                                            <Chip 
                                              size="small" 
                                              label="فعال" 
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
                                          {access.scope === 'ONLINE_POLICY_CHECK' && access.jsonPath && (
                                            <Tooltip title={`شرط: ${access.jsonPath} ${access.policyOperator} ${access.targetValue}`}>
                                              <Typography 
                                                variant="caption" 
                                                color="info.main" 
                                                sx={{ display: 'block', mt: 0.5, cursor: 'help' }}
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
                )})
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => openDialog('accesses')}
                >
                  ذخیره تغییرات دسترسی‌ها
                </Button>
              </Box>
            </>
          )}
        </TabPanel>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'roles' ? 'تأیید بروزرسانی نقش‌ها' : 'تأیید بروزرسانی دسترسی‌ها'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {dialogType === 'roles' 
              ? 'آیا از بروزرسانی نقش‌های کاربر اطمینان دارید؟' 
              : 'آیا از بروزرسانی دسترسی‌های کاربر اطمینان دارید؟'
            }
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {dialogType === 'roles' ? 'نقش‌های انتخاب شده:' : 'دسترسی‌های انتخاب شده:'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dialogType === 'roles' 
                ? selectedRoles.map(id => {
                    const role = rolesList?.data?.find(r => r.id === id);
                    return role ? (
                      <Chip 
                        key={id} 
                        label={role.displayName || role.name} 
                        color="primary" 
                        variant="outlined" 
                      />
                    ) : null;
                  })
                : selectedAccesses.map(id => {
                    const access = accessesList?.data?.find(a => a.id === id);
                    return access ? (
                      <Chip 
                        key={id} 
                        label={access.displayName || access.name} 
                        color="secondary" 
                        variant="outlined" 
                      />
                    ) : null;
                  })
              }
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={confirmLoading}>
            انصراف
          </Button>
          <Button 
            onClick={dialogType === 'roles' ? handleSaveRoles : handleSaveAccesses} 
            color="secondary"
            variant="contained"
            disabled={confirmLoading}
          >
            {confirmLoading ? <CircularProgress size={24} /> : 'تأیید'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RoleAccessManagement;