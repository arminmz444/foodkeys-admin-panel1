import { useState, useCallback } from 'react';
import {
Typography,
Button,
TextField,
Radio,
RadioGroup,
FormControlLabel,
Switch,
CircularProgress,
IconButton,
Collapse,
Tooltip,
Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useGetUserCreditQuery, useUpdateUserCreditMutation } from '../UserApi';

/**
 * UserCreditSection - a beautiful, animated credit management panel
 * embedded inside the UserView page.
 */
export default function UserCreditSection({ userId }) {
const dispatch = useAppDispatch();

// RTK Query
const {
data: credit,
isLoading: isLoadingCredit,
isFetching: isFetchingCredit,
refetch: refetchCredit,
} = useGetUserCreditQuery(userId, { skip: !userId });

const [updateCredit, { isLoading: isUpdating }] = useUpdateUserCreditMutation();

// Local state
const [expanded, setExpanded] = useState(false);
const [ghostMode, setGhostMode] = useState(false);
const [operation, setOperation] = useState('INCREASE');
const [amount, setAmount] = useState('');
const [successAnim, setSuccessAnim] = useState(false);

const numericCredit = credit ?? 0;

const handleApply = useCallback(async () => {
if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
dispatch(showMessage({ message: 'لطفا مبلغ معتبر وارد کنید.', variant: 'error' }));
return;
}

const numericAmount = Number(amount);

if (!ghostMode && operation === 'DECREASE') {
if (numericCredit - numericAmount < 0) {
dispatch(
showMessage({
message: 'اعتبار کاربر نمی‌تواند منفی شود.',
variant: 'error',
})
);
return;
}
}

try {
await updateCredit({
userId,
amount: numericAmount,
ghostModeOn: ghostMode,
operation,
}).unwrap();

setSuccessAnim(true);
setTimeout(() => setSuccessAnim(false), 2000);
setAmount('');
dispatch(
showMessage({ message: 'اعتبار با موفقیت بهروزرسانی شد.', variant: 'success' })
);
} catch (err) {
console.error(err);
dispatch(showMessage({ message: 'خطا در بهروزرسانی اعتبار.', variant: 'error' }));
}
}, [amount, ghostMode, operation, userId, numericCredit, updateCredit, dispatch]);

// Format number with commas (Persian-friendly)
const formatNumber = (n) =>
n != null ? Number(n).toLocaleString('fa-IR') : '';

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, delay: 0.2 }}
className="mt-32"
>
{/* Credit Display Card */}
<div
className="
relative overflow-hidden rounded-2xl
bg-gradient-to-l from-blue-600 via-indigo-600 to-purple-700
p-24 sm:p-32 text-white shadow-xl
"
>
{/* Decorative circles */}
<div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
<div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/5" />

<div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-16">
<div className="flex items-center gap-16">
<motion.div
animate={successAnim ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
transition={{ duration: 0.6 }}
className="
w-56 h-56 rounded-2xl
bg-white/15 backdrop-blur-sm
flex items-center justify-center
"
>
<FuseSvgIcon className="text-white" size={28}>
heroicons-outline:credit-card
</FuseSvgIcon>
</motion.div>

<div>
<Typography variant="body2" className="text-white/70 text-sm">
اعتبار فعلی
</Typography>
{isLoadingCredit ? (
<CircularProgress size={24} className="text-white mt-4" />
) : (
<motion.div
key={numericCredit}
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>
<Typography variant="h4" className="font-extrabold tracking-tight">
{formatNumber(numericCredit)}
<span className="text-base font-normal text-white/60 mr-6">تومان</span>
</Typography>
</motion.div>
)}
</div>
</div>

<div className="flex gap-8">
<Tooltip title="بارگذاری مجدد">
<IconButton
onClick={refetchCredit}
disabled={isFetchingCredit}
className="text-white/80 hover:text-white hover:bg-white/10"
size="small"
>
<motion.div
animate={isFetchingCredit ? { rotate: 360 } : {}}
transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
>
<FuseSvgIcon size={20}>heroicons-outline:refresh</FuseSvgIcon>
</motion.div>
</IconButton>
</Tooltip>

<Button
variant="contained"
onClick={() => setExpanded((prev) => !prev)}
className="
bg-white/20 hover:bg-white/30 text-white
backdrop-blur-sm shadow-none
rounded-xl px-20
"
startIcon={
<FuseSvgIcon size={18}>
{expanded ? 'heroicons-outline:chevron-up' : 'heroicons-outline:plus'}
</FuseSvgIcon>
}
>
{expanded ? 'بستن' : 'تغییر '}
</Button>
</div>
</div>

{/* Success ripple */}
<AnimatePresence>
{successAnim && (
<motion.div
initial={{ scale: 0, opacity: 0.5 }}
animate={{ scale: 4, opacity: 0 }}
exit={{ opacity: 0 }}
transition={{ duration: 1.2 }}
className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-green-300"
/>
)}
</AnimatePresence>
</div>

{/* Expandable Credit Form */}
<Collapse in={expanded} timeout={400}>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: expanded ? 1 : 0 }}
transition={{ duration: 0.3, delay: 0.1 }}
>
<div
className="
mt-2 rounded-b-2xl border border-t-0 border-gray-200
bg-white shadow-lg p-24 sm:p-32
space-y-24
"
>
{/* Ghost Mode */}
<div className="flex items-center justify-between">
<div className="flex items-center gap-12">
<div
className={`
w-36 h-36 rounded-xl flex items-center justify-center
transition-colors duration-300
${ghostMode ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}
`}
>
<FuseSvgIcon size={18}>
{ghostMode ? 'heroicons-outline:eye-off' : 'heroicons-outline:eye'}
</FuseSvgIcon>
</div>
<div>
<Typography variant="body2" className="font-semibold text-gray-800">
حالت مخفی
</Typography>
<Typography variant="caption" className="text-gray-500">
بدون ثبت تراکنش
</Typography>
</div>
</div>
<Switch
checked={ghostMode}
onChange={(e) => {
setGhostMode(e.target.checked);
setOperation('INCREASE');
setAmount('');
}}
color="warning"
/>
</div>

{/* Alert */}
<AnimatePresence mode="wait">
<motion.div
key={ghostMode ? 'ghost' : 'normal'}
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
transition={{ duration: 0.25 }}
>
{ghostMode ? (
<Alert severity="warning" variant="outlined" className="rounded-xl">
حالت مخفی فعال: هیچ تراکنشی ثبت نخواهد شد.
</Alert>
) : (
<Alert severity="info" variant="outlined" className="rounded-xl">
تمامی تغییرات در جداول تراکنشها ثبت میشوند.
</Alert>
)}
</motion.div>
</AnimatePresence>

{/* Operation Type */}
{!ghostMode && (
<motion.div
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.3 }}
>
<RadioGroup
row
value={operation}
onChange={(e) => setOperation(e.target.value)}
className="gap-16"
>
<FormControlLabel
value="INCREASE"
control={
<Radio
sx={{
'&.Mui-checked': { color: '#10b981' },
}}
/>
}
label={
<span className="flex items-center gap-4">
<FuseSvgIcon size={16} className="text-green-500">
heroicons-outline:plus-circle
</FuseSvgIcon>
افزایش
</span>
}
/>
<FormControlLabel
value="DECREASE"
control={
<Radio
sx={{
'&.Mui-checked': { color: '#ef4444' },
}}
/>
}
label={
<span className="flex items-center gap-4">
<FuseSvgIcon size={16} className="text-red-500">
heroicons-outline:minus-circle
</FuseSvgIcon>
کاهش
</span>
}
/>
</RadioGroup>
</motion.div>
)}

{/* Amount Input */}
<TextField
label={ghostMode ? 'مقدار نهایی اعتبار' : 'مبلغ (تومان)'}
type="number"
value={amount}
onChange={(e) => setAmount(e.target.value)}
fullWidth
variant="outlined"
sx={{
'& .MuiOutlinedInput-root': {
borderRadius: '12px',
},
}}
InputProps={{
startAdornment: (
<FuseSvgIcon size={20} className="text-gray-400 ml-8">
heroicons-outline:currency-dollar
</FuseSvgIcon>
),
}}
/>

{/* Preview */}
{amount && !Number.isNaN(Number(amount)) && Number(amount) > 0 && !ghostMode && (
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
className="
flex items-center gap-8 p-16 rounded-xl
bg-gray-50 border border-gray-200
"
>
<FuseSvgIcon size={18} className="text-gray-500">
heroicons-outline:information-circle
</FuseSvgIcon>
<Typography variant="body2" className="text-gray-600">
اعتبار جدید:{' '}
<span className="font-bold text-gray-900">
{formatNumber(
operation === 'INCREASE'
? numericCredit + Number(amount)
: numericCredit - Number(amount)
)}
</span>{' '}
تومان
</Typography>
</motion.div>
)}

{/* Submit */}
<div className="flex justify-end pt-8">
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
<Button
variant="contained"
onClick={handleApply}
disabled={isUpdating || !amount}
className="
rounded-xl px-32 py-10 shadow-lg
bg-gradient-to-l from-blue-600 to-indigo-600
hover:from-blue-700 hover:to-indigo-700
text-white font-semibold
"
startIcon={
isUpdating ? (
<CircularProgress size={18} className="text-white" />
) : (
<FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
)
}
>
{isUpdating ? 'در حال اعمال...' : 'اعمال تغییرات'}
</Button>
</motion.div>
</div>
</div>
</motion.div>
</Collapse>
</motion.div>
);
}
