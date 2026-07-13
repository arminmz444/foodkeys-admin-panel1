import {useState, useCallback} from 'react';
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
    Box,
    Paper,
} from '@mui/material';
import {motion, AnimatePresence} from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {showMessage} from '@fuse/core/FuseMessage/fuseMessageSlice';
import {useAppDispatch} from 'app/store/hooks';
import {useGetUserCreditQuery, useUpdateUserCreditMutation} from '../UserApi';

const CREDIT_GRADIENT = 'linear-gradient(to left, #1E88E5, #3949AB, #7B1FA2)';
const SUBMIT_GRADIENT = 'linear-gradient(to left, #1E88E5, #3949AB)';

/**
 * UserCreditSection - a beautiful, animated credit management panel
 * embedded inside the UserView page.
 */
export default function UserCreditSection({userId}) {
    const dispatch = useAppDispatch();

    const {
        data: credit,
        isLoading: isLoadingCredit,
        isFetching: isFetchingCredit,
        refetch: refetchCredit,
    } = useGetUserCreditQuery(userId, {skip: !userId});

    const [updateCredit, {isLoading: isUpdating}] = useUpdateUserCreditMutation();

    const [expanded, setExpanded] = useState(false);
    const [ghostMode, setGhostMode] = useState(false);
    const [operation, setOperation] = useState('INCREASE');
    const [amount, setAmount] = useState('');
    const [successAnim, setSuccessAnim] = useState(false);

    const numericCredit = credit ?? 0;

    const handleApply = useCallback(async () => {
        if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
            dispatch(showMessage({message: 'لطفا مبلغ معتبر وارد کنید.', variant: 'error'}));
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
                showMessage({message: 'اعتبار با موفقیت بهروزرسانی شد.', variant: 'success'})
            );
        } catch (err) {
            console.error(err);
            dispatch(showMessage({message: 'خطا در بهروزرسانی اعتبار.', variant: 'error'}));
        }
    }, [amount, ghostMode, operation, userId, numericCredit, updateCredit, dispatch]);

    const formatNumber = (n) =>
        n != null ? Number(n).toLocaleString('fa-IR') : '';

    return (
        <Box
            component={motion.div}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: 0.2}}
            sx={{mt: 4}}
        >
            {/* Credit Display Card */}
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    background: CREDIT_GRADIENT,
                    color: '#fff',
                    p: {xs: 3, sm: 4},
                    boxShadow: 6,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: -80,
                        left: -80,
                        width: 320,
                        height: 320,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.05)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -64,
                        right: -64,
                        width: 256,
                        height: 256,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.05)',
                    }}
                />

                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: {xs: 'column', sm: 'row'},
                        alignItems: {xs: 'flex-start', sm: 'center'},
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box
                            component={motion.div}
                            animate={successAnim ? {scale: [1, 1.3, 1], rotate: [0, 10, -10, 0]} : {}}
                            transition={{duration: 0.6}}
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(4px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FuseSvgIcon sx={{color: '#fff'}} size={28}>
                                heroicons-outline:credit-card
                            </FuseSvgIcon>
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem'}}>
                                اعتبار فعلی
                            </Typography>
                            {isLoadingCredit ? (
                                <CircularProgress size={24} sx={{color: '#fff', mt: 0.5}}/>
                            ) : (
                                <Box
                                    component={motion.div}
                                    key={numericCredit}
                                    initial={{scale: 0.8, opacity: 0}}
                                    animate={{scale: 1, opacity: 1}}
                                    transition={{type: 'spring', stiffness: 300, damping: 20}}
                                >
                                    <Typography variant="h4" sx={{fontWeight: 800, color: '#fff'}}>
                                        {formatNumber(numericCredit)}
                                        <Box component="span" sx={{fontSize: '1.6rem', fontWeight: 400, color: 'rgba(255,255,255,0.6)', mr: 0.75}}>
                                            تومان
                                        </Box>
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{display: 'flex', gap: 1}}>
                        <Tooltip title="بارگذاری مجدد">
                            <IconButton
                                onClick={refetchCredit}
                                disabled={isFetchingCredit}
                                size="small"
                                sx={{
                                    color: 'rgba(255,255,255,0.8)',
                                    '&:hover': {
                                        color: '#fff',
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                    },
                                }}
                            >
                                <motion.div
                                    animate={isFetchingCredit ? {rotate: 360} : {}}
                                    transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                                >
                                    <FuseSvgIcon size={20}>heroicons-outline:refresh</FuseSvgIcon>
                                </motion.div>
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant="contained"
                            onClick={() => setExpanded((prev) => !prev)}
                            startIcon={
                                <FuseSvgIcon size={18}>
                                    {expanded ? 'heroicons-outline:chevron-up' : 'heroicons-outline:plus'}
                                </FuseSvgIcon>
                            }
                            sx={{
                                borderRadius: 3,
                                px: 2.5,
                                color: '#fff',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                boxShadow: 'none',
                                backdropFilter: 'blur(4px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {expanded ? 'بستن' : 'تغییر '}
                        </Button>
                    </Box>
                </Box>

                <AnimatePresence>
                    {successAnim && (
                        <Box
                            component={motion.div}
                            initial={{scale: 0, opacity: 0.5}}
                            animate={{scale: 4, opacity: 0}}
                            exit={{opacity: 0}}
                            transition={{duration: 1.2}}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 160,
                                height: 160,
                                borderRadius: '50%',
                                bgcolor: '#86efac',
                            }}
                        />
                    )}
                </AnimatePresence>
            </Box>

            {/* Expandable Credit Form */}
            <Collapse in={expanded} timeout={400}>
                <Box
                    component={motion.div}
                    initial={{opacity: 0}}
                    animate={{opacity: expanded ? 1 : 0}}
                    transition={{duration: 0.3, delay: 0.1}}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            mt: 0.25,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            borderBottomLeftRadius: 4,
                            borderBottomRightRadius: 4,
                            border: 1,
                            borderColor: 'divider',
                            borderTop: 0,
                            p: {xs: 3, sm: 4},
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        {/* Ghost Mode */}
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: ghostMode ? 'warning.light' : 'action.hover',
                                        color: ghostMode ? 'warning.dark' : 'text.disabled',
                                        transition: 'background-color 0.3s, color 0.3s',
                                    }}
                                >
                                    <FuseSvgIcon size={18}>
                                        {ghostMode ? 'heroicons-outline:eye-off' : 'heroicons-outline:eye'}
                                    </FuseSvgIcon>
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{fontWeight: 600, color: 'text.primary'}}>
                                        حالت مخفی
                                    </Typography>
                                    <Typography variant="caption" sx={{color: 'text.secondary'}}>
                                        بدون ثبت تراکنش
                                    </Typography>
                                </Box>
                            </Box>
                            <Switch
                                checked={ghostMode}
                                onChange={(e) => {
                                    setGhostMode(e.target.checked);
                                    setOperation('INCREASE');
                                    setAmount('');
                                }}
                                color="warning"
                            />
                        </Box>

                        {/* Alert */}
                        <AnimatePresence mode="wait">
                            <Box
                                component={motion.div}
                                key={ghostMode ? 'ghost' : 'normal'}
                                initial={{opacity: 0, height: 0}}
                                animate={{opacity: 1, height: 'auto'}}
                                exit={{opacity: 0, height: 0}}
                                transition={{duration: 0.25}}
                            >
                                {ghostMode ? (
                                    <Alert severity="warning" variant="outlined" sx={{borderRadius: 3}}>
                                        حالت مخفی فعال: هیچ تراکنشی ثبت نخواهد شد.
                                    </Alert>
                                ) : (
                                    <Alert severity="info" variant="outlined" sx={{borderRadius: 3}}>
                                        تمامی تغییرات در جداول تراکنشها ثبت میشوند.
                                    </Alert>
                                )}
                            </Box>
                        </AnimatePresence>

                        {/* Operation Type */}
                        {!ghostMode && (
                            <Box
                                component={motion.div}
                                initial={{opacity: 0, x: -10}}
                                animate={{opacity: 1, x: 0}}
                                transition={{duration: 0.3}}
                            >
                                <RadioGroup
                                    row
                                    value={operation}
                                    onChange={(e) => setOperation(e.target.value)}
                                    sx={{gap: 2}}
                                >
                                    <FormControlLabel
                                        value="INCREASE"
                                        control={
                                            <Radio
                                                sx={{
                                                    '&.Mui-checked': {color: '#10b981'},
                                                }}
                                            />
                                        }
                                        label={
                                            <Box component="span" sx={{display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.primary'}}>
                                                <FuseSvgIcon size={16} sx={{color: '#10b981'}}>
                                                    heroicons-outline:plus-circle
                                                </FuseSvgIcon>
                                                افزایش
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="DECREASE"
                                        control={
                                            <Radio
                                                sx={{
                                                    '&.Mui-checked': {color: '#ef4444'},
                                                }}
                                            />
                                        }
                                        label={
                                            <Box component="span" sx={{display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.primary'}}>
                                                <FuseSvgIcon size={16} sx={{color: '#ef4444'}}>
                                                    heroicons-outline:minus-circle
                                                </FuseSvgIcon>
                                                کاهش
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </Box>
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
                                    <FuseSvgIcon size={20} sx={{color: 'text.disabled', ml: 1}}>
                                        heroicons-outline:currency-dollar
                                    </FuseSvgIcon>
                                ),
                            }}
                        />

                        {/* Preview */}
                        {amount && !Number.isNaN(Number(amount)) && Number(amount) > 0 && !ghostMode && (
                            <Box
                                component={motion.div}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: 'action.hover',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <FuseSvgIcon size={18} sx={{color: 'text.secondary'}}>
                                    heroicons-outline:information-circle
                                </FuseSvgIcon>
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    اعتبار جدید:{' '}
                                    <Box component="span" sx={{fontWeight: 700, color: 'text.primary'}}>
                                        {formatNumber(
                                            operation === 'INCREASE'
                                                ? numericCredit + Number(amount)
                                                : numericCredit - Number(amount)
                                        )}
                                    </Box>{' '}
                                    تومان
                                </Typography>
                            </Box>
                        )}

                        {/* Submit */}
                        <Box sx={{display: 'flex', justifyContent: 'flex-end', pt: 1}}>
                            <Box component={motion.div} whileHover={{scale: 1.02}} whileTap={{scale: 0.98}}>
                                <Button
                                    variant="contained"
                                    onClick={handleApply}
                                    disabled={isUpdating || !amount}
                                    startIcon={
                                        isUpdating ? (
                                            <CircularProgress size={18} sx={{color: '#fff'}}/>
                                        ) : (
                                            <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
                                        )
                                    }
                                    sx={{
                                        borderRadius: 3,
                                        px: 4,
                                        py: 1.25,
                                        color: '#fff',
                                        fontWeight: 600,
                                        background: SUBMIT_GRADIENT,
                                        boxShadow: 4,
                                        '&:hover': {
                                            background: 'linear-gradient(to left, #1976D2, #303F9F)',
                                            boxShadow: 6,
                                        },
                                        '&.Mui-disabled': {
                                            background: 'action.disabledBackground',
                                            color: 'action.disabled',
                                        },
                                    }}
                                >
                                    {isUpdating ? 'در حال اعمال...' : 'اعمال تغییرات'}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Collapse>
        </Box>
    );
}
