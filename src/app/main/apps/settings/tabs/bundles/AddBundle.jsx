// import * as React from "react";
// import Button from "@mui/material/Button";
// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";
// import Slide from "@mui/material/Slide";
// import { AiFillPlusCircle } from "react-icons/ai";
// import { FiEdit2 } from "react-icons/fi";
// import { Controller, useForm } from "react-hook-form";
// import {
//   Alert,
//   Checkbox,
//   CircularProgress,
//   FormControlLabel,
//   InputAdornment,
//   TextField,
//   Typography
// } from "@mui/material";
// import z from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { useTheme } from "@mui/material/styles";
// import { MdOutlineTitle } from "react-icons/md";
// import { GrMoney } from "react-icons/gr";
// import { NumericFormat } from "react-number-format";
// import InputLabel from "@mui/material/InputLabel";
// import Select from "@mui/material/Select";
// import MenuItem from "@mui/material/MenuItem";
// import { CiTextAlignJustify } from "react-icons/ci";
// import FormControl from "@mui/material/FormControl";
// import { useParams } from "react-router-dom";
// import { useCreateBundleMutation, useUpdateBundleMutation } from "./store/bundleApi";
//
// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });
//
// const schema = z.object({
//   title: z.string().nonempty("عنوان الزامی می‌باشد."),
//   price: z.string().nonempty("مبلغ الزامی می‌باشد."),
//   timeDuration: z.string().nonempty("مدت زمان الزامی می‌باشد."),
//   status: z.string().nonempty("وضعیت الزامی می‌باشد."),
//   description: z.string().nonempty("توضیحات الزامی می‌باشد."),
//   features: z.string().nonempty("ویژگی‌ها الزامی می‌باشد."),
//   providedAccess: z.array(z.string()).optional(),
// });
//
// function AddBundle({ onBundleAdded, editData, onBundleEdited }) {
//   const theme = useTheme();
//   const { subCategoryId } = useParams();
//   const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
//   const [open, setOpen] = React.useState(false);
//   const [error, setError] = React.useState(null);
//   const [success, setSuccess] = React.useState(false);
//
//   const [createBundle, { isLoading: isCreating }] = useCreateBundleMutation();
//   const [updateBundle, { isLoading: isUpdating }] = useUpdateBundleMutation();
//
//   const loading = isCreating || isUpdating;
//
//   const [availableAccessTypes, setAvailableAccessTypes] = React.useState([
//     "MOBILE_APP_ACCESS",
//     "WEB_APP_ACCESS",
//     "PREMIUM_CONTENT_ACCESS",
//     "ANALYTICS_ACCESS",
//     "API_ACCESS"
//   ]);
//
//   const defaultValues = {
//     title: "",
//     price: "",
//     timeDuration: "",
//     status: "ACTIVE",
//     description: "",
//     features: "",
//     providedAccess: [],
//   };
//
//   const isEditMode = React.useMemo(() => !!editData, [editData]);
//
//   const editedDefaultValues = React.useMemo(() => {
//     if (editData) {
//       return {
//         title: editData.title || "",
//         price: editData.price ? String(editData.price) : "",
//         timeDuration: editData.timeDuration ? String(editData.timeDuration) : "",
//         status: editData.status || "ACTIVE",
//         description: editData.description || "",
//         features: editData.features || "",
//         providedAccess: editData.providedAccess || [],
//       };
//     }
//     return defaultValues;
//   }, [editData]);
//
//   const { control, reset, handleSubmit, formState, setValue, watch, getValues } = useForm({
//     defaultValues: isEditMode ? editedDefaultValues : defaultValues,
//     resolver: zodResolver(schema),
//     mode: "onChange",
//   });
//
//   const { errors, isValid, isDirty } = formState;
//   const watchedProvidedAccess = watch("providedAccess");
//
//   React.useEffect(() => {
//     if (editData && open) {
//       reset({
//         title: editData.title || "",
//         price: editData.price ? String(editData.price) : "",
//         timeDuration: editData.timeDuration ? String(editData.timeDuration) : "",
//         status: editData.status || "ACTIVE",
//         description: editData.description || "",
//         features: editData.features || "",
//         providedAccess: editData.providedAccess || [],
//       });
//     }
//   }, [editData, reset, open]);
//
//   const handleClickOpen = () => {
//     setOpen(true);
//     setError(null);
//     setSuccess(false);
//     if (!isEditMode) {
//       reset(defaultValues);
//     }
//   };
//
//   const handleClose = () => {
//     setOpen(false);
//     setTimeout(() => {
//       reset(defaultValues);
//       setError(null);
//       setSuccess(false);
//     }, 300);
//   };
//
//   const handleAccessTypeToggle = (accessType) => {
//     const currentAccess = watchedProvidedAccess || [];
//     if (currentAccess.includes(accessType)) {
//       setValue("providedAccess", currentAccess.filter(type => type !== accessType));
//     } else {
//       setValue("providedAccess", [...currentAccess, accessType]);
//     }
//   };
//
//   const onSubmit = async (data) => {
//     if (!subCategoryId && !isEditMode) {
//       setError("شناسه زیرشاخه مشخص نشده است.");
//       return;
//     }
//
//     setError(null);
//
//       const bundleData = {
//         title: data.title,
//         price: 2000,
//         // price: Number(data.price.replace(/[^\d]/g, '')), // Remove non-digit characters
//         timeDuration: Number(data.timeDuration),
//         status: data.status,
//         description: data.description,
//         features: data.features,
//       };
//       console.log("data: " + JSON.stringify(bundleData))
//       if (!isEditMode) {
//         bundleData.subCategoryId = Number(subCategoryId);
//       }
//
//       let response;
//
//       if (isEditMode) {
//         // Update existing bundle
//         response = await updateBundle({
//           id: editData.id,
//           ...bundleData
//         })
//
//         setSuccess(true);
//
//         // Callback to refresh parent component if provided
//         if (onBundleEdited && typeof onBundleEdited === 'function') {
//           onBundleEdited(response);
//         }
//
//         // Close the dialog after a short delay
//         // setTimeout(() => {
//         //   handleClose();
//         // }, 1500);
//       } else {
//         // Create new bundle
//         response = await createBundle(bundleData);
//
//         setSuccess(true);
//         reset(defaultValues);
//
//         // Callback to refresh parent component if provided
//         if (onBundleAdded && typeof onBundleAdded === 'function') {
//           onBundleAdded(response);
//         }
//
//         // Close the dialog after a short delay
//         // setTimeout(() => {
//         //   handleClose();
//         // }, 1500);
//       }
//     // } catch (err) {
//     //   console.error("Error saving bundle:", err);
//     //   setError(err.error || err.data?.message || "خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.");
//     // }
//   };
//
//   return (
//     <>
//       {!isEditMode ? (
//         <Button
//           variant="outlined"
//           color="secondary"
//           className="flex gap-5 place-self-end mb-28"
//           onClick={handleClickOpen}
//         >
//           پلن جدید
//           <AiFillPlusCircle size={20} />
//         </Button>
//       ) : (
//         <Button
//           variant="outlined"
//           color="info"
//           className="flex gap-5"
//           onClick={handleClickOpen}
//           startIcon={<FiEdit2 size={18} />}
//         >
//           ویرایش
//         </Button>
//       )}
//
//       <Dialog
//         open={open}
//         TransitionComponent={Transition}
//         keepMounted
//         onClose={handleClose}
//         aria-describedby="alert-dialog-slide-description"
//         fullScreen={fullScreen}
//         maxWidth="md"
//       >
//         <DialogTitle variant="h5" className="font-800">
//           {isEditMode ? "ویرایش پلن" : "مشخصات پلن جدید"}
//         </DialogTitle>
//
//         <DialogContent>
//           <DialogContentText
//             className="w-auto max-w-4xl"
//             id="alert-dialog-slide-description"
//           >
//             {/*<form className="w-full" onSubmit={handleSubmit(onSubmit)}>*/}
//               <div className="flex flex-col gap-20 w-full mt-10">
//                 {error && (
//                   <Alert severity="error" className="mb-16">
//                     {error}
//                   </Alert>
//                 )}
//
//                 {success && (
//                   <Alert severity="success" className="mb-16">
//                     {isEditMode ? "پلن با موفقیت بروزرسانی شد." : "پلن با موفقیت ثبت شد."}
//                   </Alert>
//                 )}
//
//                 <Controller
//                   control={control}
//                   name="title"
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="عنوان"
//                       placeholder="عنوان پلن را بنویسید"
//                       id="title"
//                       error={!!errors.title}
//                       helperText={errors?.title?.message}
//                       variant="outlined"
//                       required
//                       fullWidth
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <MdOutlineTitle size={20} />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                   )}
//                 />
//
//                 <Controller
//                   control={control}
//                   name="price"
//                   render={({ field }) => (
//                     <NumericFormat
//                       {...field}
//                       id="price"
//                       customInput={TextField}
//                       thousandSeparator
//                       valueIsNumericString
//                       // suffix=" تومان"
//                        variant="outlined"
//                       label="مبلغ"
//                       required
//                       placeholder="مبلغ پلن را بنویسید"
//                       error={!!errors.price}
//                       helperText={errors?.price?.message}
//                       fullWidth
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <GrMoney size={20} />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                   )}
//                 />
//
//                 <div className="flex flex-col md:flex-row justify-between items-center w-full gap-16">
//                   <Controller
//                     control={control}
//                     name="timeDuration"
//                     render={({ field }) => (
//                       <FormControl
//                         className="w-full"
//                         error={!!errors.timeDuration}
//                       >
//                         <InputLabel id="duration-label">مدت زمان (ماه)</InputLabel>
//                         <Select
//                           {...field}
//                           labelId="duration-label"
//                           id="timeDuration"
//                           variant="outlined"
//                           label="مدت زمان (ماه)"
//                           placeholder="مدت زمان"
//                           fullWidth
//                         >
//                           <MenuItem value="1">1 ماه</MenuItem>
//                           <MenuItem value="2">2 ماه</MenuItem>
//                           <MenuItem value="3">3 ماه</MenuItem>
//                           <MenuItem value="6">6 ماه</MenuItem>
//                           <MenuItem value="12">12 ماه</MenuItem>
//                         </Select>
//                         {errors.timeDuration && (
//                           <Typography color="error" variant="caption">
//                             {errors.timeDuration.message}
//                           </Typography>
//                         )}
//                       </FormControl>
//                     )}
//                   />
//
//                   <Controller
//                     control={control}
//                     name="status"
//                     render={({ field }) => (
//                       <FormControl
//                         className="w-full"
//                         error={!!errors.status}
//                       >
//                         <InputLabel id="status-label">وضعیت</InputLabel>
//                         <Select
//                           {...field}
//                           labelId="status-label"
//                           id="status"
//                           variant="outlined"
//                           label="وضعیت"
//                           placeholder="وضعیت"
//                           fullWidth
//                         >
//                           <MenuItem value="ACTIVE">فعال</MenuItem>
//                           <MenuItem value="DISABLED">غیرفعال</MenuItem>
//                         </Select>
//                         {errors.status && (
//                           <Typography color="error" variant="caption">
//                             {errors.status.message}
//                           </Typography>
//                         )}
//                       </FormControl>
//                     )}
//                   />
//                 </div>
//
//                 <Controller
//                   control={control}
//                   name="description"
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       id="description"
//                       label="توضیحات"
//                       multiline
//                       minRows={3}
//                       error={!!errors.description}
//                       helperText={errors?.description?.message}
//                       fullWidth
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <CiTextAlignJustify size={20} />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                   )}
//                 />
//
//                 <Controller
//                   control={control}
//                   name="features"
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       id="features"
//                       label="ویژگی‌ها (با نقطه جدا شود)"
//                       multiline
//                       minRows={3}
//                       error={!!errors.features}
//                       helperText={errors?.features?.message || "ویژگی‌ها را با نقطه از هم جدا کنید. مثال: ویژگی اول. ویژگی دوم. ویژگی سوم"}
//                       fullWidth
//                       InputProps={{
//                         startAdornment: (
//                           <InputAdornment position="start">
//                             <CiTextAlignJustify size={20} />
//                           </InputAdornment>
//                         ),
//                       }}
//                     />
//                   )}
//                 />
//
//                 <div className="mt-16">
//                   <Typography variant="subtitle1" className="mb-8 font-semibold">
//                     دسترسی‌های ارائه شده:
//                   </Typography>
//
//                   <div className="flex flex-wrap gap-16">
//                     {availableAccessTypes.map((accessType) => (
//                       <FormControlLabel
//                         key={accessType}
//                         control={
//                           <Checkbox
//                             checked={watchedProvidedAccess?.includes(accessType) || false}
//                             onChange={() => handleAccessTypeToggle(accessType)}
//                             color="secondary"
//                           />
//                         }
//                         label={accessType}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             {/*</form>*/}
//           </DialogContentText>
//         </DialogContent>
//
//         <DialogActions>
//           <Button onClick={handleClose} disabled={loading}>
//             لغو
//           </Button>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={handleSubmit(onSubmit)}
//             disabled={loading || !isDirty || !isValid}
//           >
//             {loading ? <CircularProgress size={24} /> : isEditMode ? "بروزرسانی" : "ذخیره"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// }
//
// export default AddBundle;


import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { AiFillPlusCircle } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { MdOutlineTitle } from "react-icons/md";
import { GrMoney } from "react-icons/gr";
import { NumericFormat } from "react-number-format";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { CiTextAlignJustify } from "react-icons/ci";
import FormControl from "@mui/material/FormControl";
import { useParams } from "react-router-dom";
import { useCreateBundleMutation, useUpdateBundleMutation } from "./store/bundleApi";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const schema = z.object({
  title: z.string().nonempty("عنوان الزامی می‌باشد."),
  price: z.string().nonempty("مبلغ الزامی می‌باشد."),
  timeDuration: z.string().nonempty("مدت زمان الزامی می‌باشد."),
  status: z.string().nonempty("وضعیت الزامی می‌باشد."),
  description: z.string().optional(),
  features: z.string().nonempty("ویژگی‌ها الزامی می‌باشد."),
  providedAccess: z.array(z.string()).optional(),
});

function AddBundle({ onBundleAdded, editData, onBundleEdited, onClose }) {
  const theme = useTheme();
  const { subCategoryId } = useParams();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const [createBundle, { isLoading: isCreating }] = useCreateBundleMutation();
  const [updateBundle, { isLoading: isUpdating }] = useUpdateBundleMutation();

  const loading = isCreating || isUpdating;

  const [availableAccessTypes, setAvailableAccessTypes] = React.useState([
    "MOBILE_APP_ACCESS",
    "WEB_APP_ACCESS",
    "PREMIUM_CONTENT_ACCESS",
    "ANALYTICS_ACCESS",
    "API_ACCESS"
  ]);

  const defaultValues = {
    title: "",
    price: "",
    timeDuration: "",
    status: "ACTIVE",
    description: "",
    features: "",
    providedAccess: [],
  };

  const isEditMode = React.useMemo(() => !!editData, [editData]);

  const editedDefaultValues = React.useMemo(() => {
    if (editData) {
      return {
        title: editData.title || "",
        price: editData.price ? String(editData.price) : "",
        timeDuration: editData.timeDuration ? String(editData.timeDuration) : "",
        status: editData.status || "ACTIVE",
        description: editData.description || "",
        features: editData.features || "",
        providedAccess: editData.providedAccess || [],
      };
    }
    return defaultValues;
  }, [editData]);

  const { control, reset, handleSubmit, formState, setValue, watch, getValues } = useForm({
    defaultValues: isEditMode ? editedDefaultValues : defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { errors, isValid, isDirty } = formState;
  const watchedProvidedAccess = watch("providedAccess");

  // Auto-open dialog when in edit mode
  React.useEffect(() => {
    if (isEditMode) {
      setOpen(true);
    }
  }, [isEditMode]);

  React.useEffect(() => {
    if (editData && open) {
      const editFormData = {
        title: editData.title || "",
        price: editData.price ? String(editData.price) : "",
        timeDuration: editData.timeDuration ? String(editData.timeDuration) : "",
        status: editData.status || "ACTIVE",
        description: editData.description || "",
        features: editData.features || "",
        providedAccess: editData.providedAccess || [],
      };
      reset(editFormData);
    }
  }, [editData, reset, open]);

  const handleClickOpen = () => {
    setOpen(true);
    setError(null);
    setSuccess(false);
    if (!isEditMode) {
      reset(defaultValues);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      reset(defaultValues);
      setError(null);
      setSuccess(false);
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    }, 300);
  };

  const handleAccessTypeToggle = (accessType) => {
    const currentAccess = watchedProvidedAccess || [];
    if (currentAccess.includes(accessType)) {
      setValue("providedAccess", currentAccess.filter(type => type !== accessType));
    } else {
      setValue("providedAccess", [...currentAccess, accessType]);
    }
  };

  const onSubmit = async (data) => {
    if (!subCategoryId && !isEditMode) {
      setError("شناسه زیرشاخه مشخص نشده است.");
      return;
    }

    setError(null);

    try {
      const bundleData = {
        title: data.title,
        price: Number(data.price.replace(/[^\d]/g, '')), // Remove non-digit characters
        timeDuration: Number(data.timeDuration),
        status: data.status,
        description: data.description,
        features: data.features,
        providedAccess: data.providedAccess || [],
      };

      // Add subCategoryId for new bundles
      if (!isEditMode) {
        bundleData.subCategoryId = Number(subCategoryId);
      }

      let response;

      if (isEditMode) {
        // Update existing bundle
        response = await updateBundle({
          id: editData.id,
          ...bundleData
        }).unwrap();

        setSuccess(true);

        // Callback to refresh parent component if provided
        if (onBundleEdited && typeof onBundleEdited === 'function') {
          onBundleEdited(response);
        }

        // Close the dialog after a short delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        // Create new bundle
        response = await createBundle(bundleData).unwrap();

        setSuccess(true);
        reset(defaultValues);

        // Callback to refresh parent component if provided
        if (onBundleAdded && typeof onBundleAdded === 'function') {
          onBundleAdded(response);
        }

        // Close the dialog after a short delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving bundle:", err);
      setError(err.data?.message || "خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.");
    }
  };

  return (
      <>
        {!isEditMode ? (
            <Button
                variant="outlined"
                color="secondary"
                className="flex gap-5 place-self-end mb-28"
                onClick={handleClickOpen}
            >
              پلن جدید
              <AiFillPlusCircle size={20} />
            </Button>
        ) : (
            <Button
                variant="outlined"
                color="info"
                className="flex gap-5"
                onClick={handleClickOpen}
                startIcon={<FiEdit2 size={18} />}
            >
              ویرایش
            </Button>
        )}

        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
            fullScreen={fullScreen}
            maxWidth="md"
        >
          <DialogTitle variant="h5" className="font-800">
            {isEditMode ? "ویرایش پلن" : "مشخصات پلن جدید"}
          </DialogTitle>

          <DialogContent>
            <DialogContentText
                className="w-auto max-w-4xl"
                id="alert-dialog-slide-description"
            >
              <div className="flex flex-col gap-20 w-full mt-10">
                {error && (
                    <Alert severity="error" className="mb-16">
                      {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" className="mb-16">
                      {isEditMode ? "پلن با موفقیت بروزرسانی شد." : "پلن با موفقیت ثبت شد."}
                    </Alert>
                )}

                <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="عنوان"
                            placeholder="عنوان پلن را بنویسید"
                            id="title"
                            error={!!errors.title}
                            helperText={errors?.title?.message}
                            variant="outlined"
                            required
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                  <InputAdornment position="start">
                                    <MdOutlineTitle size={20} />
                                  </InputAdornment>
                              ),
                            }}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="price"
                    render={({ field }) => (
                        <NumericFormat
                            {...field}
                            id="price"
                            customInput={TextField}
                            thousandSeparator
                            valueIsNumericString
                            suffix=" تومان"
                            variant="outlined"
                            label="مبلغ"
                            required
                            placeholder="مبلغ پلن را بنویسید"
                            error={!!errors.price}
                            helperText={errors?.price?.message}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                  <InputAdornment position="start">
                                    <GrMoney size={20} />
                                  </InputAdornment>
                              ),
                            }}
                        />
                    )}
                />

                <div className="flex flex-col md:flex-row justify-between items-center w-full gap-16">
                  <Controller
                      control={control}
                      name="timeDuration"
                      render={({ field }) => (
                          <FormControl
                              className="w-full"
                              error={!!errors.timeDuration}
                          >
                            <InputLabel id="duration-label">مدت زمان (ماه)</InputLabel>
                            <Select
                                {...field}
                                labelId="duration-label"
                                id="timeDuration"
                                variant="outlined"
                                label="مدت زمان (ماه)"
                                placeholder="مدت زمان"
                                fullWidth
                            >
                              <MenuItem value="1">1 ماه</MenuItem>
                              <MenuItem value="2">2 ماه</MenuItem>
                              <MenuItem value="3">3 ماه</MenuItem>
                              <MenuItem value="6">6 ماه</MenuItem>
                              <MenuItem value="12">12 ماه</MenuItem>
                            </Select>
                            {errors.timeDuration && (
                                <Typography color="error" variant="caption">
                                  {errors.timeDuration.message}
                                </Typography>
                            )}
                          </FormControl>
                      )}
                  />

                  <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                          <FormControl
                              className="w-full"
                              error={!!errors.status}
                          >
                            <InputLabel id="status-label">وضعیت</InputLabel>
                            <Select
                                {...field}
                                labelId="status-label"
                                id="status"
                                variant="outlined"
                                label="وضعیت"
                                placeholder="وضعیت"
                                fullWidth
                            >
                              <MenuItem value="ACTIVE">فعال</MenuItem>
                              <MenuItem value="DISABLED">غیرفعال</MenuItem>
                            </Select>
                            {errors.status && (
                                <Typography color="error" variant="caption">
                                  {errors.status.message}
                                </Typography>
                            )}
                          </FormControl>
                      )}
                  />
                </div>

                <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <TextField
                            {...field}
                            id="description"
                            label="توضیحات"
                            multiline
                            minRows={3}
                            error={!!errors.description}
                            helperText={errors?.description?.message}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                  <InputAdornment position="start">
                                    <CiTextAlignJustify size={20} />
                                  </InputAdornment>
                              ),
                            }}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="features"
                    render={({ field }) => (
                        <TextField
                            {...field}
                            id="features"
                            label="ویژگی‌ها (با نقطه جدا شود)"
                            multiline
                            minRows={3}
                            error={!!errors.features}
                            helperText={errors?.features?.message || "ویژگی‌ها را با نقطه از هم جدا کنید. مثال: ویژگی اول. ویژگی دوم. ویژگی سوم"}
                            fullWidth
                            required
                            InputProps={{
                              startAdornment: (
                                  <InputAdornment position="start">
                                    <CiTextAlignJustify size={20} />
                                  </InputAdornment>
                              ),
                            }}
                        />
                    )}
                />

                <div className="mt-16">
                  <Typography variant="subtitle1" className="mb-8 font-semibold">
                    دسترسی‌های ارائه شده:
                  </Typography>

                  <div className="flex flex-wrap gap-16">
                    {availableAccessTypes.map((accessType) => (
                        <FormControlLabel
                            key={accessType}
                            control={
                              <Checkbox
                                  checked={watchedProvidedAccess?.includes(accessType) || false}
                                  onChange={() => handleAccessTypeToggle(accessType)}
                                  color="secondary"
                              />
                            }
                            label={accessType}
                        />
                    ))}
                  </div>
                </div>
              </div>
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              لغو
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmit(onSubmit)}
                disabled={loading || !isDirty || !isValid}
            >
              {loading ? <CircularProgress size={24} /> : isEditMode ? "بروزرسانی" : "ذخیره"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
}

export default AddBundle;