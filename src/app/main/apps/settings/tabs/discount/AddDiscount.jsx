import {zodResolver} from "@hookform/resolvers/zod";
import {
    Autocomplete,
    InputAdornment,
    ListSubheader,
    TextField,
    Typography,
    FormControlLabel,
    Checkbox,
    Chip,
    Box, CircularProgress,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slide from "@mui/material/Slide";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as React from "react";
import {Controller, useForm} from "react-hook-form";
import {CiTextAlignJustify} from "react-icons/ci";
import {GrMoney} from "react-icons/gr";
import {IoMdAddCircle} from "react-icons/io";
import {MdOutlineTitle} from "react-icons/md";
import {NumericFormat} from "react-number-format";
import z from "zod";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {formatISO} from "date-fns/formatISO";
import axios from "axios";
import {showMessage} from "@fuse/core/FuseMessage/fuseMessageSlice";
import {useDispatch} from "react-redux";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const defaultValues = {
    name: "",
    displayName: "",
    percentage: "",
    description: "",
    startDateTime: formatISO(new Date()),
    expireDateTime: formatISO(new Date()),
    status: "ACTIVE",
    maxUses: null,
    maxUsesPerUser: 1,
    includedUsers: [],
    excludedUsers: [],
    includedBundles: [],
    excludedBundles: [],
    constraintMode: "all", // all, includeOnly, excludeOnly
};
const requiredNumber = (msg, shape) =>
    z.preprocess(
        v => (v === '' || v === null || v === undefined ? undefined : v),
        (shape ? shape(z.coerce.number({required_error: msg}))
            : z.coerce.number({required_error: msg}))
            .finite()
    );

const optionalNullableInt = () =>
    z.preprocess(
        v => (v === '' || v === undefined ? null : v),
        z.union([
            z.coerce.number().int().positive(),
            z.literal(null),
        ])
    );
const schema = z.object({
    name: z.string().nonempty("کد تخفیف الزامی می‌باشد."),
    displayName: z.string().nonempty("عنوان نمایشی الزامی می‌باشد."),
    percentage: requiredNumber("درصد تخفیف الزامی می‌باشد.", s => s.min(0).max(100)),
    description: z.string().optional(),
    startDateTime: z.string().nonempty("تاریخ شروع الزامیست."),
    expireDateTime: z.string().nonempty("تاریخ پایان الزامیست."),
    status: z.string(),
    maxUses: z.string().optional().nullable(),
    maxUsesPerUser: requiredNumber("حداکثر استفاده برای هر کاربر الزامیست.", s => s.int().min(1)),
});

function AddDiscount({open, setOpen, handleClickOpen, handleClose, discountId = null, onSuccess}) {
    const dispatch = useDispatch();
    const [loading, setLoading] = React.useState(false);
    const [users, setUsers] = React.useState([]);
    const [bundles, setBundles] = React.useState([]);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
    const [isFetching, setIsFetching] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const {control, watch, reset, handleSubmit, formState, setValue} = useForm({
        defaultValues,
        mode: "all",
        resolver: zodResolver(schema),
    });

    const start = watch("startDateTime");
    const end = watch("expireDateTime");
    const constraintMode = watch("constraintMode");
    const {isValid, dirtyFields, errors} = formState;
    const now = new Date();
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    const isExpired = endDate && endDate < now;
    const notStarted = startDate && startDate > now;
    const effectiveStatus = (isExpired || notStarted) ? "INACTIVE" : "ACTIVE";

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                if (discountId) setIsFetching(true);
                setLoading(true);

                // Fetch users
                // const usersResponse = await axios.get('/user/all');
                // setUsers(usersResponse.data.data || []);
                setUsers([]);
                // const bundlesResponse = await axios.get('/bundle');
                // setBundles(bundlesResponse.data.data || []);
                setBundles([]);

                // If editing, fetch discount details
                if (discountId) {
                    const discountResponse = await axios.get(`/discount/${discountId}`);
                    const discount = discountResponse.data.data;

                    // Populate form with discount data
                    Object.keys(discount).forEach(key => {
                        if (defaultValues.hasOwnProperty(key)) {
                            setValue(key, discount[key]);
                        }
                    });

                    // Set constraint users and bundles
                    if (discount.includedUserIds) {
                        const includedUsers = users.filter(u => discount.includedUserIds.includes(u.id));
                        setValue("includedUsers", includedUsers);
                    }
                    if (discount.excludedUserIds) {
                        const excludedUsers = users.filter(u => discount.excludedUserIds.includes(u.id));
                        setValue("excludedUsers", excludedUsers);
                    }
                    if (discount.includedBundleIds) {
                        const includedBundles = bundles.filter(b => discount.includedBundleIds.includes(b.id));
                        setValue("includedBundles", includedBundles);
                    }
                    if (discount.excludedBundleIds) {
                        const excludedBundles = bundles.filter(b => discount.excludedBundleIds.includes(b.id));
                        setValue("excludedBundles", excludedBundles);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                dispatch(showMessage({
                    message: "خطا در دریافت اطلاعات",
                    severity: "error",
                    autoHideDuration: 3000,
                }));
            } finally {
                setLoading(false);
                if (discountId) setIsFetching(false);
            }
        };

        if (open) {
            fetchData();
        }
    }, [open, discountId]);

    const onSubmit = async (data) => {
        try {
            setIsSaving(true);
            setLoading(true);

            // Prepare the DTO
            const discountDTO = {
                name: data.name,
                displayName: data.displayName,
                percentage: parseFloat(data.percentage),
                description: data.description,
                startDateTime: data.startDateTime,
                expireDateTime: data.expireDateTime,
                status: data.status,
                maxUses: data.maxUses,
                maxUsesPerUser: data.maxUsesPerUser,
                includedUserIds: data.includedUsers?.map(u => u.id),
                excludedUserIds: data.excludedUsers?.map(u => u.id),
                includedBundleIds: data.includedBundles?.map(b => b.id),
                excludedBundleIds: data.excludedBundles?.map(b => b.id),
            };

            if (discountId) {
                // Update existing discount
                await axios.put(`/discount/${discountId}`, discountDTO);
                dispatch(showMessage({
                    message: "تخفیف با موفقیت بروزرسانی شد",
                    severity: "success",
                    autoHideDuration: 3000,
                }));
            } else {
                // Create new discount
                await axios.post('/discount', discountDTO);
                dispatch(showMessage({
                    message: "تخفیف با موفقیت ایجاد شد",
                    severity: "success",
                    autoHideDuration: 3000,
                }));
            }

            reset();
            handleClose();
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Error saving discount:", error);
            dispatch(showMessage({
                message: error.response?.data?.message || "خطا در ذخیره تخفیف",
                severity: "error",
                autoHideDuration: 3000,
            }));
        } finally {
            setIsSaving(false);
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                className="w-1/2 sm:w-1/4 flex items-center gap-5 group text-sm sm:text-base"
                onClick={handleClickOpen}
            >
                تخفیف جدید
                <IoMdAddCircle
                    size={20}
                    className="group-hover:scale-110 transition-all group-active:scale-90"
                />
            </Button>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                fullScreen={fullScreen}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle variant="h5" className="font-800">
                    {discountId ? "ویرایش تخفیف" : "مشخصات تخفیف جدید"}
                </DialogTitle>
                <DialogContent>
                    {discountId && isFetching ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={6} minHeight={200}>
                            <CircularProgress/>
                        </Box>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                            <div className="flex flex-col gap-20 mt-10">
                                {/* Basic Information */}
                                <Typography variant="h6" className="mt-20">اطلاعات پایه</Typography>

                                <div className="flex flex-col sm:flex-row gap-16">
                                    <Controller
                                        control={control}
                                        name="name"
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                label="کد تخفیف"
                                                placeholder="مثال: NEWYEAR2024"
                                                error={!!errors.name}
                                                helperText={errors?.name?.message}
                                                variant="outlined"
                                                required
                                                fullWidth
                                                disabled={discountId !== null}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <MdOutlineTitle size={20}/>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="displayName"
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                label="عنوان نمایشی"
                                                placeholder="تخفیف ویژه سال نو"
                                                error={!!errors.displayName}
                                                helperText={errors?.displayName?.message}
                                                variant="outlined"
                                                required
                                                fullWidth
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-16">
                                    <Controller
                                        control={control}
                                        name="percentage"
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="درصد تخفیف"
                                                placeholder="20"
                                                error={!!errors.percentage}
                                                helperText={errors?.percentage?.message}
                                                variant="outlined"
                                                required
                                                fullWidth
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">%</InputAdornment>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="status"
                                        disabled
                                        render={({field}) => (
                                            <FormControl fullWidth>
                                                <InputLabel>وضعیت</InputLabel>
                                                <Select
                                                    {...field}
                                                    value={effectiveStatus}
                                                    label="وضعیت"
                                                >
                                                    <MenuItem value="ACTIVE">فعال</MenuItem>
                                                    <MenuItem value="INACTIVE">غیرفعال</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </div>

                                {/* Date Range */}
                                <Typography variant="h6" className="mt-20">زمان‌بندی</Typography>

                                <div className="flex flex-col sm:flex-row gap-16">
                                    <Controller
                                        name="startDateTime"
                                        control={control}
                                        render={({field: {onChange, value}}) => (
                                            <DateTimePicker
                                                className="w-full"
                                                value={new Date(value)}
                                                onChange={(val) => {
                                                    onChange(val.toISOString());
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        label: "تاریخ شروع",
                                                        variant: "outlined",
                                                        error: !!errors.startDateTime,
                                                        helperText: errors?.startDateTime?.message,
                                                    },
                                                }}
                                                maxDate={new Date(end)}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="expireDateTime"
                                        control={control}
                                        render={({field: {onChange, value}}) => (
                                            <DateTimePicker
                                                className="w-full"
                                                value={new Date(value)}
                                                onChange={(val) => {
                                                    onChange(val.toISOString());
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        label: "تاریخ پایان",
                                                        variant: "outlined",
                                                        error: !!errors.expireDateTime,
                                                        helperText: errors?.expireDateTime?.message,
                                                    },
                                                }}
                                                minDate={new Date(start)}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Usage Limits */}
                                <Typography variant="h6" className="mt-20">محدودیت‌های استفاده</Typography>

                                <div className="flex flex-col sm:flex-row gap-16">
                                    <Controller
                                        control={control}
                                        name="maxUses"
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="حداکثر تعداد استفاده (کل)"
                                                placeholder="100"
                                                helperText="خالی = نامحدود"
                                                variant="outlined"
                                                fullWidth
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="maxUsesPerUser"
                                        render={({field}) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                label="حداکثر استفاده برای هر کاربر"
                                                placeholder="1"
                                                error={!!errors.maxUsesPerUser}
                                                helperText={errors?.maxUsesPerUser?.message}
                                                variant="outlined"
                                                required
                                                fullWidth
                                                value={field.value ?? ''}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Constraints */}
                                <Typography variant="h6" className="mt-20">محدودیت‌های اعمال</Typography>

                                <Controller
                                    control={control}
                                    name="constraintMode"
                                    render={({field}) => (
                                        <FormControl fullWidth>
                                            <InputLabel>نوع محدودیت</InputLabel>
                                            <Select
                                                {...field}
                                                label="نوع محدودیت"
                                            >
                                                <MenuItem value="all">قابل استفاده برای همه</MenuItem>
                                                <MenuItem value="includeOnly">فقط برای موارد انتخابی</MenuItem>
                                                <MenuItem value="excludeOnly">برای همه بجز موارد انتخابی</MenuItem>
                                                <MenuItem value="custom">سفارشی</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                />

                                {/* User Constraints */}
                                {(constraintMode === "includeOnly" || constraintMode === "custom") && (
                                    <Controller
                                        control={control}
                                        name="includedUsers"
                                        render={({field}) => (
                                            <Autocomplete
                                                {...field}
                                                multiple
                                                options={users}
                                                getOptionLabel={(option) => `${option.name || option.username} (${option.phone || option.email})`}
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => (
                                                        <Chip
                                                            variant="outlined"
                                                            label={option.name || option.username}
                                                            {...getTagProps({index})}
                                                        />
                                                    ))
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="کاربران مجاز"
                                                        placeholder="انتخاب کاربران مجاز به استفاده از این تخفیف"
                                                    />
                                                )}
                                                onChange={(e, value) => field.onChange(value)}
                                            />
                                        )}
                                    />
                                )}

                                {(constraintMode === "excludeOnly" || constraintMode === "custom") && (
                                    <Controller
                                        control={control}
                                        name="excludedUsers"
                                        render={({field}) => (
                                            <Autocomplete
                                                {...field}
                                                multiple
                                                options={users}
                                                getOptionLabel={(option) => `${option.name || option.username} (${option.phone || option.email})`}
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => (
                                                        <Chip
                                                            variant="outlined"
                                                            color="error"
                                                            label={option.name || option.username}
                                                            {...getTagProps({index})}
                                                        />
                                                    ))
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="کاربران محروم"
                                                        placeholder="انتخاب کاربرانی که نمی‌توانند از این تخفیف استفاده کنند"
                                                    />
                                                )}
                                                onChange={(e, value) => field.onChange(value)}
                                            />
                                        )}
                                    />
                                )}

                                {/* Bundle Constraints */}
                                {(constraintMode === "includeOnly" || constraintMode === "custom") && (
                                    <Controller
                                        control={control}
                                        name="includedBundles"
                                        render={({field}) => (
                                            <Autocomplete
                                                {...field}
                                                multiple
                                                options={bundles}
                                                getOptionLabel={(option) => option.title}
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => (
                                                        <Chip
                                                            variant="outlined"
                                                            label={option.title}
                                                            {...getTagProps({index})}
                                                        />
                                                    ))
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="پلن‌های مجاز"
                                                        placeholder="انتخاب پلن‌هایی که این تخفیف روی آنها اعمال می‌شود"
                                                    />
                                                )}
                                                onChange={(e, value) => field.onChange(value)}
                                            />
                                        )}
                                    />
                                )}

                                {(constraintMode === "excludeOnly" || constraintMode === "custom") && (
                                    <Controller
                                        control={control}
                                        name="excludedBundles"
                                        render={({field}) => (
                                            <Autocomplete
                                                {...field}
                                                multiple
                                                options={bundles}
                                                getOptionLabel={(option) => option.title}
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => (
                                                        <Chip
                                                            variant="outlined"
                                                            color="error"
                                                            label={option.title}
                                                            {...getTagProps({index})}
                                                        />
                                                    ))
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="پلن‌های محروم"
                                                        placeholder="انتخاب پلن‌هایی که این تخفیف روی آنها اعمال نمی‌شود"
                                                    />
                                                )}
                                                onChange={(e, value) => field.onChange(value)}
                                            />
                                        )}
                                    />
                                )}

                                {/* Description */}
                                <Controller
                                    control={control}
                                    name="description"
                                    render={({field}) => (
                                        <TextField
                                            {...field}
                                            label="توضیحات"
                                            multiline
                                            minRows={3}
                                            helperText="توضیحات داخلی (برای کاربران نمایش داده نمی‌شود)"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CiTextAlignJustify size={20}/>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </form>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        لغو
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading || !isValid}
                    >
                        {isSaving ? "در حال ذخیره..." : (discountId ? "بروزرسانی" : "ذخیره")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}


export default AddDiscount;