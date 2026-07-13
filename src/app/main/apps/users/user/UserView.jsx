import Button from "@mui/material/Button";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { useNavigate, useParams } from "react-router-dom";
import FuseLoading from "@fuse/core/FuseLoading";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Box from "@mui/system/Box";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import { format } from "date-fns-jalali";
import {
  useGetUsersItemQuery,
  useGetUserRolesQuery,
  useGetUserAccessesQuery,
  useDeleteUserMutation,
} from "../UserApi.js";
import RoleAccessManagement from "../RoleAccessManagement";
import UserCreditSection from "./UserCreditSection";
import { getServerFile } from "src/utils/string-utils.js";
import { Chip } from "@mui/material";

/**
 * The user view component.
 */
function UserView() {
  const routeParams = useParams();
  const { id: userId } = routeParams;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const {
    data: user,
    isLoading: isLoadingUser,
    isError,
  } = useGetUsersItemQuery(userId, {
    skip: !userId,
  });
  
  const { data: roles = [] } = useGetUserRolesQuery(userId, {
    skip: !userId,
  });
  
  const { data: accesses = [] } = useGetUserAccessesQuery(userId, {
    skip: !userId,
  });
  
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  
  const isLoading = isLoadingUser || isDeleting;

  const handleDeleteUser = async () => {
    if (!user) {
      return;
    }

    try {
      await deleteUser(userId).unwrap();
      navigate("/apps/users");
      dispatch(showMessage({ message: "کاربر با موفقیت حذف شد" }));
    } catch (error) {
      console.error(error);
      dispatch(showMessage({ 
        message: "خطا در حذف کاربر", 
        variant: "error" 
      }));
    }
  };

  if (isLoading) {
    return <FuseLoading className="min-h-screen" />;
  }

  if (isError) {
    setTimeout(() => {
      navigate("/apps/users");
      dispatch(showMessage({ message: "کاربر یافت نشد" }));
    }, 0);
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Box
        className="relative w-full h-160 sm:h-192 px-32 sm:px-48"
        sx={{
          backgroundColor: "background.default",
        }}
      >
        {user.backgroundAvatar && (
          <img
            className="absolute inset-0 object-cover w-full h-full"
            src={getServerFile(user.backgroundAvatar)}
            alt="user background"
          />
        )}
      </Box>
      <div className="relative flex flex-col flex-auto items-center p-24 pt-0 sm:p-48 sm:pt-0">
        <div className="w-full max-w-3xl">
          <div className="flex flex-auto items-end -mt-64">
            <Avatar
              sx={{
                borderWidth: 4,
                borderStyle: "solid",
                borderColor: "background.paper",
                backgroundColor: "background.default",
                color: "text.secondary",
              }}
              className="w-128 h-128 text-64 font-bold"
              src={getServerFile(user.avatar)}
              alt={`${user.firstName} ${user.lastName}`}
            >
              {user.firstName?.charAt(0)}
            </Avatar>
            <div className="flex items-center mr-auto mb-4">
              <Button
                className="me-4"
                variant="outlined"
                color="error"
                onClick={handleDeleteUser}
              >
                <FuseSvgIcon size={20}>heroicons-outline:trash</FuseSvgIcon>
                <span className="mx-8">حذف</span>
              </Button>
              <Button
                variant="contained"
                color="secondary"
                component={NavLinkAdapter}
                to="edit"
              >
                <FuseSvgIcon size={20}>
                  heroicons-outline:pencil-alt
                </FuseSvgIcon>
                <span className="mx-8">ویرایش</span>
              </Button>
            </div>
          </div>

          <Typography className="mt-12 text-4xl font-bold truncate">
            {`${user.firstName} ${user.lastName}`}
          </Typography>
          
          <Typography className="mt-12 text-grey-500 text-md font-bold truncate">
            {user.username}
          </Typography>

          {/* Display Roles */}
          {roles?.data && roles.data.length > 0 && (
            <div className="flex flex-wrap items-center mt-8">
              <Typography className="mr-4 font-medium">نقش‌ها:</Typography>
              {roles.data.map((role) => (
                <Chip
                  key={role.id}
                  label={role.displayName || role.name || role.id}
                  className="mr-12 mb-12"
                  size="small"
                  color="primary"
                />
              ))}
            </div>
          )}
          
          {/* Display Accesses */}
          {accesses?.data && accesses.data.length > 0 && (
            <div className="flex flex-wrap items-center mt-8">
              <Typography className="mr-4 font-medium">دسترسی‌ها:</Typography>
              {accesses.data.map((access) => (
                <Chip
                  key={access.id}
                  label={access.displayName || access.name || access.id}
                  className="mr-12 mb-12"
                  size="small"
                  color="secondary"
                />
              ))}
            </div>
          )}

          <Divider className="mt-16 mb-24" />

          <div className="flex flex-col space-y-32">
            {user.jobPosition && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:briefcase</FuseSvgIcon>
                <div className="mr-10 leading-6">{user.jobPosition}</div>
              </div>
            )}

            {user?.companies && user.companies.length > 0 && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:office-building</FuseSvgIcon>
                <div className="mr-10 leading-6">
                  {user.companies.map(company => company.name).join(', ')}
                </div>
              </div>
            )}

            {user?.email && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:mail</FuseSvgIcon>
                <div className="mr-10 leading-6">{user.email}</div>
              </div>
            )}
            
            {user?.emails && user.emails.length > 0 && (
              <div className="flex">
                <FuseSvgIcon>heroicons-outline:mail</FuseSvgIcon>
                <div className="min-w-0 mr-10 space-y-4">
                  {user.emails.map(
                    (item) =>
                      item.email && (
                        <div
                          className="flex items-center leading-6"
                          key={item.email}
                        >
                          <a
                            className="hover:underline text-primary-500 rounded-6 px-8"
                            href={`mailto:${item.email}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {item.email}
                          </a>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
            
            {user?.phone && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:phone</FuseSvgIcon>
                <div className="mr-10 leading-6">{user.phone}</div>
              </div>
            )}
            
            {user?.phoneNumbers && user.phoneNumbers.length > 0 && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:phone</FuseSvgIcon>
                <div className="min-w-0 mr-10 space-y-4">
                  {user.phoneNumbers.map(
                    (item, index) =>
                      item.phoneNumber && (
                        <div
                          className="flex items-center leading-6"
                          key={index}
                        >
                          <a
                            href={`tel:${item.phoneNumber}`}
                            className="ml-10 font-600 no-underline text-lg"
                          >
                            <Button variant="text" size="small">
                              {item.phoneNumber}
                            </Button>
                          </a>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
            
            {user?.address && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:location-marker</FuseSvgIcon>
                <div className="mr-10 leading-6">{user.address}</div>
              </div>
            )}

            {user?.birthDate && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:cake</FuseSvgIcon>
                <div className="mr-10 leading-6">
                  {format(new Date(user.birthDate), "yyyy/MM/dd")}
                </div>
              </div>
            )}

            {user?.notes && (
              <div className="flex">
                <FuseSvgIcon>heroicons-outline:menu-alt-2</FuseSvgIcon>
                <div
                  className="max-w-none mr-10 prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: user.notes }}
                />
              </div>
            )}
            
            {/* Status */}
            <div className="flex items-center">
              <FuseSvgIcon>heroicons-outline:status-online</FuseSvgIcon>
              <div className="mr-10 leading-6">
                <span className="ml-8">وضعیت حساب کاربری:</span>
                <Chip
                  label={user.active ? "فعال" : "غیرفعال"}
                  color={user.active ? "success" : "error"}
                  size="small"
                  className="mr-8"
                />
              </div>
            </div>
            
            {/* Last login time */}
            {user?.lastLogin && (
              <div className="flex items-center">
                <FuseSvgIcon>heroicons-outline:clock</FuseSvgIcon>
                <div className="mr-10 leading-6">
                  <span className="ml-8">آخرین ورود:</span>
                  {user.lastLogin}
                </div>
              </div>
            )}
          </div>
          
          {/* Role and Access Management Section */}
          <Typography className="mt-32 text-2xl font-bold truncate">
            مدیریت نقش‌ها و دسترسی‌ها
          </Typography>
          <Divider className="mt-8 mb-24" />
          
          <RoleAccessManagement userId={userId} />
          
          {/* Credit Management Section */}
          <Typography className="mt-32 text-2xl font-bold truncate">
            مدیریت اعتبار
          </Typography>
          <Divider className="mt-8 mb-24" />
          
          <UserCreditSection 
            userId={userId} 
          />
        </div>
      </div>
    </>
  );
}

export default UserView;