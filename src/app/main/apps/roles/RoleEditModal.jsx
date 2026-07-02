import { useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  isProtectedRole,
} from "./RoleApi";

const schema = z.object({
  name: z.string().min(1, { message: "نام نقش الزامیست." }),
  displayName: z.string().min(1, { message: "نام نمایشی الزامیست." }),
  description: z.string().optional(),
  roleType: z.string().optional(),
  enabled: z.boolean().optional(),
});

const defaultValues = {
  name: "",
  displayName: "",
  description: "",
  roleType: "CUSTOM",
  enabled: true,
};

function RoleEditModal({ open, onClose, role }) {
  const dispatch = useAppDispatch();
  const isEditMode = Boolean(role?.id);
  const isProtected = isProtectedRole(role);

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const isLoading = isCreating || isUpdating;

  const { control, handleSubmit, reset, formState } = useForm({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    if (open) {
      if (role) {
        reset({
          name: role.name || "",
          displayName: role.displayName || "",
          description: role.description || "",
          roleType: role.roleType || "CUSTOM",
          enabled: role.enabled !== false,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, role, reset]);

  const onSubmit = useCallback(
    async (data) => {
      try {
        if (isEditMode) {
          await updateRole({ id: role.id, ...data }).unwrap();
          dispatch(showMessage({ message: "نقش با موفقیت بروزرسانی شد" }));
        } else {
          await createRole(data).unwrap();
          dispatch(showMessage({ message: "نقش با موفقیت ایجاد شد" }));
        }
        onClose();
      } catch (error) {
        console.error(error);
        dispatch(
          showMessage({
            message: error?.data?.message || "خطا در ذخیره نقش",
            variant: "error",
          })
        );
      }
    },
    [isEditMode, role, createRole, updateRole, dispatch, onClose]
  );

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit(onSubmit),
      }}
    >
      <DialogTitle>
        {isEditMode ? "ویرایش نقش" : "افزودن نقش جدید"}
        {isProtected && (
          <span className="text-12 text-red-500 mr-8">
            (نقش سیستمی - غیرقابل ویرایش)
          </span>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              {...field}
              label="نام نقش (انگلیسی)"
              placeholder="مثال: MANAGER"
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors?.name?.message}
              disabled={isProtected || isEditMode}
              InputProps={{
                style: { direction: "ltr" },
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="displayName"
          render={({ field }) => (
            <TextField
              {...field}
              label="نام نمایشی"
              placeholder="مثال: مدیر"
              fullWidth
              margin="normal"
              error={!!errors.displayName}
              helperText={errors?.displayName?.message}
              disabled={isProtected}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              {...field}
              label="توضیحات"
              placeholder="توضیحات نقش را وارد کنید"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors?.description?.message}
              disabled={isProtected}
            />
          )}
        />

        <Controller
          control={control}
          name="roleType"
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="نوع نقش"
              fullWidth
              margin="normal"
              error={!!errors.roleType}
              helperText={errors?.roleType?.message}
              disabled={isProtected || isEditMode}
            >
              <MenuItem value="SYSTEM">سیستمی</MenuItem>
              <MenuItem value="BUSINESS">کسب‌وکار</MenuItem>
              <MenuItem value="CUSTOM">سفارشی</MenuItem>
            </TextField>
          )}
        />

        <Controller
          control={control}
          name="enabled"
          render={({ field: { value, onChange } }) => (
            <FormControlLabel
              className="mt-16"
              control={
                <Switch
                  checked={Boolean(value)}
                  onChange={(e) => onChange(e.target.checked)}
                  color="primary"
                  disabled={isProtected}
                />
              }
              label="فعال"
            />
          )}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          انصراف
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={
            isProtected ||
            !isValid ||
            Object.keys(dirtyFields).length === 0 ||
            isLoading
          }
        >
          {isLoading ? <CircularProgress size={24} /> : "ذخیره"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RoleEditModal;
