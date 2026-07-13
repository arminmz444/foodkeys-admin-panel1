import Button from "@mui/material/Button";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import FuseLoading from "@fuse/core/FuseLoading";
import _ from "@lodash";
import { Controller, useForm } from "react-hook-form";
import Box from "@mui/system/Box";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete/Autocomplete";
import Checkbox from "@mui/material/Checkbox/Checkbox";
import history from "@history";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { getServerFile } from "src/utils/string-utils.js";
import JobPositionAutocomplete from "./JobPositionAutocomplete";
import CompanyOption from "./CompanyOption";
import UserModel from "../models/UserModel";
import {
  useGetUsersItemQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesListQuery,
  useGetAccessesListQuery,
  useGetUserRolesQuery,
  useGetUserAccessesQuery,
  useUpdateUserAccessesMutation,
  useGetProvincesQuery,
  useGetCitiesQuery,
} from "../UserApi";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import { BiMinus } from "react-icons/bi";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import CustomSelect from "app/shared-components/custom-select/CustomSelect";
import axios from "axios";

function BirtdayIcon() {
  return <FuseSvgIcon size={20}>heroicons-solid:cake</FuseSvgIcon>;
}

/**
 * Form Validation Schema
 */
const schema = z
  .object({
    avatar: z.string().optional(),
    background: z.string().optional(),
    firstName: z.string().min(1, { message: "نام کاربر الزامیست." }),
    lastName: z.string().min(1, { message: "نام خانوادگی کاربر الزامیست." }),
    email: z
      .string()
      .email({ message: "ایمیل نامعتبر است." })
      .min(1, { message: "ایمیل کاربر الزامیست." }),
    username: z
      .string()
      .min(11, { message: "نام کاربری باید 11 کاراکتر باشد." })
      .max(11, { message: "نام کاربری باید 11 کاراکتر باشد." }),
    phone: z
      .string()
      .min(11, { message: "شماره تلفن باید 11 کاراکتر باشد." })
      .max(11, { message: "شماره تلفن باید 11 کاراکتر باشد." }),
    password: z
      .string()
      .optional()
      .refine((pw) => !pw || pw.length >= 8, {
        message: "کلمه عبور باید حداقل ۸ کاراکتر باشد.",
      }),
    passwordConfirm: z.string().optional(),
    emails: z.array(z.string()).optional(),
    phones: z.array(z.string()).optional(),
    title: z.string().optional(),
    jobPosition: z
      .string()
      .optional()
      .or(z.object({ value: z.string(), label: z.string() })),
    roles: z.array(z.any()).optional(),
    accesses: z.array(z.any()).optional(),
    birthDate: z.string().optional(),
    birthMonth: z.number().min(1).max(12).optional(),
    showOnlyMonth: z.boolean().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    companies: z.array(z.any()).optional(),
    province: z
      .number()
      .optional()
      .or(z.object({ id: z.number(), name: z.string() })),
    city: z
      .number()
      .optional()
      .or(z.object({ id: z.number(), nameFa: z.string(), nameEn: z.string() })),
    postalCode: z.string().optional(),
    nationalCode: z.string().optional(),
    shenasCode: z.string().optional(),
    pelak: z.string().optional(),
    individualType: z.string().optional(),
    active: z.boolean().optional(),
    status: z.number().optional(),
  })
  .refine(
    (data) =>
      !data.password ||
      !data.passwordConfirm ||
      data.password === data.passwordConfirm,
    {
      message: "کلمه عبور و تکرار آن مطابقت ندارند.",
      path: ["passwordConfirm"],
    }
  );

function UserForm() {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const routeParams = useParams();
  const { id: userId } = routeParams;

  // API hooks
  const {
    data: user,
    isError,
    isLoading: isLoadingUser,
  } = useGetUsersItemQuery(userId, {
    skip: !userId || userId === "new",
  });

  const { data: userRoles = [], isLoading: isLoadingRoles } =
    useGetUserRolesQuery(userId, {
      skip: !userId || userId === "new",
    });

  const { data: userAccesses = [], isLoading: isLoadingAccesses } =
    useGetUserAccessesQuery(userId, {
      skip: !userId || userId === "new",
    });

  const { data: rolesList = [], isLoading: isLoadingRolesList } =
    useGetRolesListQuery();
  const { data: accessesList = [], isLoading: isLoadingAccessesList } =
    useGetAccessesListQuery();
  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useGetProvincesQuery();

  const { control, watch, reset, handleSubmit, formState, setValue } = useForm({
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;
  console.log("FormState:")
    console.log(formState)
  console.log("Errors")
  console.log(dirtyFields)
    console.log(isValid)
    console.log(errors)
  const form = watch();
  const showOnlyMonth = watch("showOnlyMonth");

  // Get province ID for city query - handle both number and object cases
  const selectedProvince = watch("province");
  const provinceId = selectedProvince?.id || selectedProvince;

  const { data: cities = [], isLoading: isLoadingCities } = useGetCitiesQuery(
    provinceId,
    {
      skip: !provinceId,
    }
  );

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  // const [updateUserAccesses] = useUpdateUserAccessesMutation();

  const isLoading =
    isLoadingUser ||
    isLoadingRoles ||
    isLoadingAccesses ||
    isLoadingRolesList ||
    isLoadingAccessesList ||
    isCreating ||
    isUpdating ||
    isDeleting ||
    isLoadingProvinces ||
    isLoadingCities;

  useEffect(() => {
    if (userId === "new") {
      reset(UserModel({}));
    } else if (user) {
      const roleIds = userRoles?.data
        ? userRoles.data.map((role) => (typeof role === 'string' ? role : role.name))
        : user?.userRoles?.map((role) => role.name) || [];

      const accessIds = userAccesses?.data
        ? userAccesses.data.map((access) => (typeof access === 'string' ? access : access.name))
        : user?.userAccesses?.map((access) => access.name) || [];

      const formattedUser = {
        ...user,
        // roles: userRoles?.data || [],
        // accesses: userAccesses?.data || [],
        roles: roleIds,
        accesses: accessIds,
        companies:
          user?.companies?.map((company) => ({
            value: company.id || company._id,
            label: company.name,
            ...company,
          })) || [],
        // Ensure province and city are set correctly
        province: user.province?.id || user.province,
        city: user.city?.id || user.city,
        // Ensure active status is boolean
        active: Boolean(user.active),
      };
      reset(formattedUser);
    }
  }, [user, userRoles, userAccesses, reset, userId]);

  /**
   * Form Submit
   */
  const onSubmit = useCallback(
    async (data) => {
      try {
        // Transform province and city to just their IDs before submission
        const formData = {
          ...data,
          companyIds: data.companies?.map(
            (company) => company.value || company.id
          ),
          province: data.province?.id || data.province,
          city: data.city?.id || data.city,
          notes: data.notes,
        };

        if (userId === "new") {
          const result = await createUser(formData).unwrap();

          // If there are accesses, update them
          // if (data.accesses?.length > 0) {
          //   await updateUserAccesses({
          //     userId: result.id,
          //     accesses: formData.accesses.map(id => ({ id }))
          //   }).unwrap();
          // }

          navigate(`/apps/users/${result.id}`);
          dispatch(showMessage({ message: "کاربر با موفقیت ایجاد شد" }));
        } else {
          await updateUser({ id: userId, ...formData }).unwrap();

          // Update user accesses if changed
          // if (_.isEqual(formData.accesses, userAccesses?.data) === false) {
          //   await updateUserAccesses({
          //     userId,
          //     accesses: formData.accesses.map(id => ({ id }))
          //   }).unwrap();
          // }

          dispatch(
            showMessage({ message: "اطلاعات کاربر با موفقیت بروزرسانی شد" })
          );
        }
      } catch (error) {
        console.error(error);
        dispatch(
          showMessage({
            message: "خطا در ذخیره اطلاعات کاربر",
            variant: "error",
          })
        );
      }
    },
    [userId, createUser, updateUser, dispatch, navigate, userAccesses]
  );

  async function handleRemoveUser() {
    if (!user || userId === "new") {
      return;
    }

    try {
      await deleteUser(userId).unwrap();
      navigate("/apps/users");
      dispatch(showMessage({ message: "کاربر با موفقیت حذف شد" }));
    } catch (error) {
      console.error(error);
      dispatch(
        showMessage({
          message: "خطا در حذف کاربر",
          variant: "error",
        })
      );
    }
  }

  const avatar = watch("avatar");
  const firstName = watch("firstName");

  const persianMonths = [
    { value: 1, label: "فروردین" },
    { value: 2, label: "اردیبهشت" },
    { value: 3, label: "خرداد" },
    { value: 4, label: "تیر" },
    { value: 5, label: "مرداد" },
    { value: 6, label: "شهریور" },
    { value: 7, label: "مهر" },
    { value: 8, label: "آبان" },
    { value: 9, label: "آذر" },
    { value: 10, label: "دی" },
    { value: 11, label: "بهمن" },
    { value: 12, label: "اسفند" },
  ];

  if (isError && userId !== "new") {
    setTimeout(() => {
      navigate("/apps/users");
      dispatch(showMessage({ message: "کاربر یافت نشد" }));
    }, 0);
    return null;
  }

  if (isLoading || (_.isEmpty(form) && userId !== "new")) {
    return <FuseLoading className="min-h-screen" />;
  }

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.put("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      dispatch(
        showMessage({
          message:
            error.response?.data?.message || "خطا در آپلود تصویر پروفایل",
          variant: "error",
        })
      );
      throw error;
    }
  };

  const uploadBackground = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.put("/user/background", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data;
    } catch (error) {
      console.error("Error uploading background:", error);
      dispatch(
        showMessage({
          message:
            error.response?.data?.message || "خطا در آپلود تصویر پس‌زمینه",
          variant: "error",
        })
      );
      throw error;
    }
  };

  return (
    <>
      <div className="flex flex-auto">
        <Box
          className="relative w-full h-160 sm:h-192 px-32 sm:px-48"
          sx={{
            backgroundColor: "background.default",
          }}
        >
          <Controller
            control={control}
            name="backgroundAvatar"
            render={({ field: { onChange, value } }) => (
              <>
                <div className="absolute inset-0 bg-grey-400 bg-opacity-50 z-10" />
                <div className="absolute inset-0 z-20">
                  <div className="flex items-center justify-center h-full">
                    <div>
                      <label
                        htmlFor="button-background"
                        className="flex p-8 cursor-pointer"
                      >
                        <input
                          accept="image/*"
                          className="hidden"
                          id="button-background"
                          type="file"
                          onChange={async (e) => {
                            const file = e?.target?.files?.[0];

                            if (!file) {
                              return;
                            }

                            try {
                              // Show loading state
                              dispatch(
                                showMessage({
                                  message: "در حال آپلود تصویر...",
                                })
                              );

                              // Upload the file to the server
                              const result = await uploadBackground(file);

                              // Update the form with the background URL returned from server
                              onChange(result.filePath || result.url || result);

                              // Show success message
                              dispatch(
                                showMessage({
                                  message: "تصویر پس‌زمینه با موفقیت آپلود شد",
                                })
                              );
                            } catch (error) {
                              // Error handling is done in uploadBackground function
                              console.error("Failed to upload background:", error);
                            }
                          }}
                        />
                        <FuseSvgIcon className="text-white">
                          heroicons-outline:camera
                        </FuseSvgIcon>
                      </label>
                    </div>
                    <div>
                      <IconButton
                        onClick={() => {
                          onChange("");
                        }}
                      >
                        <FuseSvgIcon className="text-white">
                          heroicons-solid:trash
                        </FuseSvgIcon>
                      </IconButton>
                    </div>
                  </div>
                </div>
                {value && (
                  <img
                    src={getServerFile(value)}
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </>
            )}
          />
        </Box>
      </div>

      <div className="relative flex flex-col flex-auto items-center px-24 sm:px-48">
        <div className="w-full">
          <div className="flex flex-auto items-end -mt-64">
            <Controller
              control={control}
              name="avatar"
              render={({ field: { onChange, value } }) => (
                <Box
                  sx={{
                    borderWidth: 4,
                    borderStyle: "solid",
                    borderColor: "background.paper",
                  }}
                  className="relative flex items-center justify-center w-128 h-128 rounded-full overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black bg-opacity-80 z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div>
                      <label
                        htmlFor="button-avatar"
                        className="flex p-8 cursor-pointer"
                      >
                        <input
                          accept="image/*"
                          className="hidden"
                          id="button-avatar"
                          type="file"
                          onChange={async (e) => {
                            const file = e?.target?.files?.[0];

                            if (!file) {
                              return;
                            }

                            try {
                              // Show loading state
                              dispatch(
                                showMessage({
                                  message: "در حال آپلود تصویر...",
                                })
                              );

                              // Upload the file to the server
                              const result = await uploadAvatar(file);

                              // Update the form with the avatar URL returned from server
                              onChange(result.filePath || result.url || result);

                              // Show success message
                              dispatch(
                                showMessage({
                                  message: "تصویر پروفایل با موفقیت آپلود شد",
                                })
                              );
                            } catch (error) {
                              // Error handling is done in uploadAvatar function
                              console.error("Failed to upload avatar:", error);
                            }
                          }}
                        />
                        <FuseSvgIcon className="text-white">
                          heroicons-outline:camera
                        </FuseSvgIcon>
                      </label>
                    </div>
                    <div>
                      <IconButton
                        onClick={() => {
                          onChange("");
                        }}
                      >
                        <FuseSvgIcon className="text-white">
                          heroicons-solid:trash
                        </FuseSvgIcon>
                      </IconButton>
                    </div>
                  </div>
                  <Avatar
                    sx={{
                      backgroundColor: "background.default",
                      color: "text.secondary",
                    }}
                    className="object-cover w-full h-full text-64 font-bold"
                    src={avatar && getServerFile(avatar)}
                    alt={firstName}
                  >
                    {firstName?.charAt(0)}
                  </Avatar>
                </Box>
              )}
            />
          </div>
        </div>

        {/* User Status & Type */}
        <div className="flex flex-col sm:flex-row justify-between w-full gap-x-10 mt-32">
          <Controller
            control={control}
            name="active"
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                className="mt-8"
                control={
                  <Switch
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    color="primary"
                  />
                }
                label="وضعیت فعال"
              />
            )}
          />

          <Controller
            control={control}
            name="individualType"
            render={({ field }) => (
              <FormControl component="fieldset" className="mt-8">
                <FormLabel component="legend">نوع کاربر</FormLabel>
                <RadioGroup
                  row
                  aria-label="individual-type"
                  name="individualType"
                  value={field.value || "PERSON"}
                  onChange={field.onChange}
                >
                  <FormControlLabel
                    value="PERSON"
                    control={<Radio />}
                    label="حقیقی"
                  />
                  <FormControlLabel
                    value="ORGANIZATION"
                    control={<Radio />}
                    label="حقوقی"
                  />
                </RadioGroup>
              </FormControl>
            )}
          />
        </div>

        {/* Basic Information */}
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="نام"
              placeholder="نام کاربر را بنویسید"
              id="firstName"
              error={!!errors.firstName}
              helperText={errors?.firstName?.message}
              variant="outlined"
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>
                      heroicons-solid:user-circle
                    </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="نام خانوادگی"
              placeholder="نام خانوادگی کاربر را بنویسید"
              id="lastName"
              error={!!errors.lastName}
              helperText={errors?.lastName?.message}
              variant="outlined"
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>
                      heroicons-solid:user-circle
                    </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <div className="flex flex-col sm:flex-row justify-between w-full gap-x-10">
          <Controller
            control={control}
            name="nationalCode"
            render={({ field }) => (
              <TextField
                className="mt-32"
                {...field}
                label="کد ملی"
                placeholder="کد ملی کاربر را وارد کنید"
                id="nationalCode"
                error={!!errors.nationalCode}
                helperText={errors?.nationalCode?.message}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>
                        heroicons-solid:identification
                      </FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="shenasCode"
            render={({ field }) => (
              <TextField
                className="mt-32"
                {...field}
                label="شناسه"
                placeholder="شناسه کاربر را وارد کنید"
                id="shenasCode"
                error={!!errors.shenasCode}
                helperText={errors?.shenasCode?.message}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>
                        heroicons-solid:identification
                      </FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="username"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="نام کاربری"
              placeholder="نام کاربری را وارد کنید"
              id="username"
              error={!!errors.username}
              helperText={errors?.username?.message}
              variant="outlined"
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>
                      heroicons-solid:identification
                    </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="ایمیل اصلی"
              placeholder="ایمیل اصلی کاربر را وارد کنید"
              id="email"
              error={!!errors.email}
              helperText={errors?.email?.message}
              variant="outlined"
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:inbox</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="شماره تلفن اصلی"
              placeholder="شماره تلفن اصلی کاربر را وارد کنید"
              id="phone"
              error={!!errors.phone}
              helperText={errors?.phone?.message}
              variant="outlined"
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:phone</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* Password fields */}
        <div className="flex flex-col sm:flex-row justify-center items-center w-full gap-x-10">
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextField
                className="mt-32"
                {...field}
                label="کلمه عبور"
                placeholder="کلمه عبور کاربر را بنویسید"
                id="password"
                error={!!errors.password}
                helperText={errors?.password?.message}
                variant="outlined"
                type={showPassword ? "text" : "password"}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        aria-label={
                          showPassword
                            ? "hide the password"
                            : "display the password"
                        }
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field }) => (
              <TextField
                className="mt-32"
                {...field}
                label="تکرار کلمه عبور"
                placeholder="کلمه عبور کاربر را بنویسید"
                id="passwordConfirm"
                error={!!errors.passwordConfirm}
                helperText={errors?.passwordConfirm?.message}
                variant="outlined"
                type={showPassword ? "text" : "password"}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        aria-label={
                          showPassword
                            ? "hide the password"
                            : "display the password"
                        }
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </div>

        {/* Roles Selection */}
        <Controller
          control={control}
          name="roles"
          render={({ field: { onChange, value = [] } }) => (
            <Autocomplete
              multiple
              id="roles"
              className="mt-32"
              options={rolesList?.data || []}
              disableCloseOnSelect
              getOptionLabel={(option) =>
                option?.displayName || option?.name || ""
              }
              renderOption={(_props, option, { selected }) => (
                <li {..._props}>
                  <Checkbox style={{ marginRight: 8 }} checked={selected} />
                  {option?.displayName || option?.name}
                </li>
              )}
              value={(rolesList?.data || []).filter(
                (role) => Array.isArray(value) && value.includes(role.name)
              )}
              onChange={(_event, newValue) => {
                onChange(newValue?.map((item) => item?.name));
              }}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="نقش‌ها"
                  placeholder="نقش‌های کاربر را انتخاب کنید"
                  error={!!errors.roles}
                  helperText={errors?.roles?.message}
                />
              )}
            />
          )}
        />

        {/* Accesses Selection */}
        <Controller
          control={control}
          name="accesses"
          render={({ field: { onChange, value = [] } }) => (
            <Autocomplete
              multiple
              id="accesses"
              className="mt-32"
              options={accessesList?.data || []}
              disableCloseOnSelect
              getOptionLabel={(option) =>
                option?.displayName || option?.name || ""
              }
              renderOption={(_props, option, { selected }) => (
                <li {..._props}>
                  <Checkbox style={{ marginRight: 8 }} checked={selected} />
                  {option?.displayName || option?.name}
                </li>
              )}
              value={(accessesList?.data || []).filter(
                (access) => Array.isArray(value) && value.includes(access.name)
              )}
              onChange={(_event, newValue) => {
                onChange(newValue?.map((item) => item?.name));
              }}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="دسترسی‌ها"
                  placeholder="دسترسی‌های کاربر را انتخاب کنید"
                  error={!!errors.accesses}
                  helperText={errors?.accesses?.message}
                />
              )}
            />
          )}
        />

        <Controller
          control={control}
          name="jobPosition"
          render={({ field }) => (
            <JobPositionAutocomplete
              className="mt-32"
              field={field}
              error={!!errors.jobPosition}
              helperText={errors?.jobPosition?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="emails"
          render={({ field }) => {
            const emails = Array.isArray(field.value) ? field.value : [];
            return (
              <div className="flex flex-col space-y-2 w-full mt-32">
                <label className="font-medium text-gray-700 dark:text-gray-600">
                  ایمیل‌ها
                </label>
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2 w-full">
                    <TextField
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...emails];
                        newEmails[index] = e.target.value;
                        field.onChange(newEmails);
                      }}
                      label={`آدرس ایمیل ${index + 1}`}
                      placeholder={`آدرس ایمیل ${index + 1}`}
                      variant="outlined"
                      fullWidth
                      type="email"
                      className="mt-16"
                      error={!!errors?.emails?.[index]}
                      helperText={errors?.emails?.[index]?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FuseSvgIcon size={20}>
                              heroicons-solid:inbox
                            </FuseSvgIcon>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      onClick={() => {
                        const newEmails = emails.filter((_, i) => i !== index);
                        field.onChange(newEmails);
                      }}
                      variant="flat"
                      color="danger"
                      className="mt-16"
                    >
                      <BiMinus
                        size={30}
                        color="red"
                        className="text-red-light"
                      />
                    </Button>
                  </div>
                ))}
                {emails.length < 3 && (
                  <Button
                    className="group inline-flex items-center mt-8 py-2 px-4 rounded cursor-pointer"
                    onClick={() => {
                      field.onChange([...emails, ""]);
                    }}
                  >
                    <FuseSvgIcon size={20}>
                      heroicons-solid:plus-circle
                    </FuseSvgIcon>
                    <span className="ml-8 font-medium text-secondary group-hover:underline">
                      افزودن ایمیل جدید
                    </span>
                  </Button>
                )}
              </div>
            );
          }}
        />
        <Controller
          control={control}
          name="phones"
          render={({ field }) => {
            const phones = Array.isArray(field.value) ? field.value : [];
            return (
              <div className="flex flex-col space-y-2 w-full">
                <label className="font-medium text-gray-700 dark:text-gray-600">
                  شماره تلفن‌ها
                </label>
                {phones.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2 w-full">
                    <TextField
                      value={phone}
                      onChange={(e) => {
                        const newPhones = [...phones];
                        newPhones[index] = e.target.value;
                        field.onChange(newPhones);
                      }}
                      label={`شماره تلفن ${index + 1}`}
                      placeholder={`شماره تلفن ${index + 1}`}
                      variant="outlined"
                      fullWidth
                      className="mt-16"
                      error={!!errors?.phones?.[index]}
                      helperText={errors?.phones?.[index]?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FuseSvgIcon size={20}>
                              heroicons-solid:phone
                            </FuseSvgIcon>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      onClick={() => {
                        const newPhones = phones.filter((_, i) => i !== index);
                        field.onChange(newPhones);
                      }}
                      variant="flat"
                      color="danger"
                      className="mt-16"
                    >
                      <BiMinus
                        size={30}
                        color="red"
                        className="text-red-light"
                      />
                    </Button>
                  </div>
                ))}
                {phones.length < 3 && (
                  <Button
                    className="group inline-flex items-center mt-8 py-2 px-4 rounded cursor-pointer"
                    onClick={() => {
                      field.onChange([...phones, ""]);
                    }}
                  >
                    <FuseSvgIcon size={20}>
                      heroicons-solid:plus-circle
                    </FuseSvgIcon>
                    <span className="ml-8 font-medium text-secondary group-hover:underline">
                      افزودن شماره تلفن جدید
                    </span>
                  </Button>
                )}
              </div>
            );
          }}
        />

        <Controller
          control={control}
          name="province"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              select
              label="استان"
              placeholder="استان کاربر را انتخاب کنید"
              id="province"
              error={!!errors.province}
              helperText={errors?.province?.message}
              variant="outlined"
              fullWidth
              value={field.value?.id || field.value || ""}
              onChange={(e) => {
                // When province changes, clear city selection
                setValue("city", null);
                field.onChange(parseInt(e.target.value, 10));
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:map-pin</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            >
              {provinces.map((province) => (
                <MenuItem key={province.id} value={province.id}>
                  {province.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              select
              label="شهر"
              placeholder="شهر کاربر را انتخاب کنید"
              id="city"
              error={!!errors.city}
              helperText={errors?.city?.message}
              variant="outlined"
              fullWidth
              disabled={!provinceId}
              value={field.value?.id || field.value || ""}
              onChange={(e) => {
                field.onChange(parseInt(e.target.value, 10));
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:map-pin</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            >
              {cities.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.nameFa}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <TextField
              className="mt-32 flex-1"
              {...field}
              label="آدرس"
              placeholder="آدرس کاربر را وارد کنید"
              id="address"
              error={!!errors.address}
              helperText={errors?.address?.message}
              variant="outlined"
              fullWidth
              multiline
              minRows={4}
              maxRows={8}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>
                      heroicons-solid:location-marker
                    </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <div className="flex flex-col sm:flex-row w-full gap-x-10">
          <Controller
            control={control}
            name="pelak"
            render={({ field }) => (
              <TextField
                className="mt-32"
                {...field}
                label="پلاک"
                placeholder="پلاک کاربر را وارد کنید"
                id="pelak"
                error={!!errors.pelak}
                helperText={errors?.pelak?.message}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>heroicons-solid:home</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            control={control}
            name="postalCode"
            render={({ field }) => (
              <TextField
                className="mt-32"
                {...field}
                label="کد پستی"
                placeholder="کد پستی کاربر را وارد کنید"
                id="postalCode"
                error={!!errors.postalCode}
                helperText={errors?.postalCode?.message}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>heroicons-solid:mail</FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </div>

        <div className="mt-32">
          <Controller
            control={control}
            name="showOnlyMonth"
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    color="primary"
                  />
                }
                label="مایل به وارد کردن تاریخ تولد دقیق خود نیستم"
              />
            )}
          />
        </div>

        {showOnlyMonth ? (
          <Controller
            control={control}
            name="birthMonth"
            render={({ field }) => (
              <TextField
                className="mt-16"
                {...field}
                select
                label="ماه تولد"
                placeholder="ماه تولد را انتخاب کنید"
                id="birthMonth"
                error={!!errors.birthMonth}
                helperText={errors?.birthMonth?.message}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20}>
                        heroicons-solid:calendar
                      </FuseSvgIcon>
                    </InputAdornment>
                  ),
                }}
              >
                {persianMonths.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ) : (
          <Controller
            control={control}
            name="birthDate"
            render={({ field: { value, onChange } }) => (
              <DateTimePicker
                value={value ? new Date(value) : null}
                onChange={(val) => {
                  onChange(val?.toISOString());
                }}
                className="mt-16 w-full"
                slotProps={{
                  textField: {
                    id: "birthDate",
                    label: "تاریخ تولد",
                    InputLabelProps: {
                      shrink: true,
                    },
                    fullWidth: true,
                    variant: "outlined",
                    error: !!errors.birthDate,
                    helperText: errors?.birthDate?.message,
                  },
                  actionBar: {
                    actions: ["clear", "today"],
                  },
                }}
                slots={{
                  openPickerIcon: BirtdayIcon,
                }}
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <TextField
              className="mt-32"
              {...field}
              label="یادداشت‌ها"
              placeholder="اطلاعاتی در مورد کاربر بنویسید"
              id="notes"
              error={!!errors.notes}
              helperText={errors?.notes?.message}
              variant="outlined"
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              InputProps={{
                className: "max-h-min h-min items-start",
                startAdornment: (
                  <InputAdornment className="mt-10" position="start">
                    <FuseSvgIcon size={20}>
                      heroicons-solid:menu-alt-2
                    </FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </div>

      {/* Form Actions */}
      <Box
        className="flex items-center mt-40 py-14 pr-16 pl-4 sm:pr-48 sm:pl-36 border-t"
        sx={{ backgroundColor: "background.default" }}
      >
        {userId !== "new" && (
          <Button color="error" onClick={handleRemoveUser}>
            حذف
          </Button>
        )}
        <Button
          className="ml-auto"
          variant="outlined"
          onClick={() => history.back()}
        >
          لغو
        </Button>
        <Button
          className="ml-8"
          variant="contained"
          color="secondary"
          disabled={_.isEmpty(dirtyFields) || !isValid || isLoading}
          onClick={handleSubmit(onSubmit)}
        >
          {isLoading ? "در حال پردازش..." : "ذخیره"}
        </Button>
      </Box>
    </>
  );
}

export default UserForm;
