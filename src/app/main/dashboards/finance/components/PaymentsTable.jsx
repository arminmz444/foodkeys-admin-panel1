// src/app/components/finance/PaymentsTable.jsx
import {useState, useEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Chip,
    CircularProgress,
    TableSortLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    DialogActions,
    Tooltip
} from '@mui/material';
import {motion} from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import debounce from 'lodash.debounce';
import {useGetPaymentsQuery} from '../FinanceDashboardApi';
import PaymentDetails from './PaymentDetails';
import UserInfoModal from './UserInfoModal';

const PaymentsTable = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [filters, setFilters] = useState({
        paymentStatus: '',
        serviceName: '',
        method: '',
        fromDate: '',
        toDate: '',
        search: ''
    });
    const [openFilters, setOpenFilters] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [openUserModal, setOpenUserModal] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const debouncedSetSearch = useMemo(
        () => debounce((value) => {
            setFilters((prev) => ({...prev, search: value}));
            setPage(0);
        }, 500),
        []
    );

    useEffect(() => {
        return () => {
            debouncedSetSearch.cancel();
        };
    }, [debouncedSetSearch]);

    const {data, isLoading, isFetching} = useGetPaymentsQuery({
        pageNumber: page,
        pageSize: rowsPerPage,
        sortBy: orderBy,
        sortDir: order,
        ...filters
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleOpenDetails = (payment) => {
        setSelectedPayment(payment);
        setOpenDetails(true);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
        // Restore body scroll
        document.body.style.overflow = 'unset';
    };

    const handleOpenFilters = () => {
        setOpenFilters(true);
    };

    const handleCloseFilters = () => {
        setOpenFilters(false);
    };

    const handleApplyFilters = () => {
        setPage(0);
        setOpenFilters(false);
    };

    const handleResetFilters = () => {
        setFilters({
            paymentStatus: '',
            serviceName: '',
            method: '',
            fromDate: '',
            toDate: ''
        });
        setPage(0);
        setOpenFilters(false);
    };

    const handleBackToDashboard = () => {
        navigate('/dashboards/finance');
    };

    const handleOpenUserModal = (userId) => {
        setSelectedUserId(userId);
        setOpenUserModal(true);
    };

    const handleCloseUserModal = () => {
        setOpenUserModal(false);
        setSelectedUserId(null);
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'DONE':
            case 'موفق':
                return 'success';
            case 'VERIFY':
            case 'START':
            case 'تایید بانک':
            case 'شروع پرداخت':
                return 'warning';
            case 'FAILED':
            case 'CANCELLED':
            case 'ناموفق':
            case 'لغو کاربر':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (payment) => {
        return payment.paymentStatus || payment.status || 'نامشخص';
    };

    // Cleanup effect to restore scroll when component unmounts
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={pageVariants}
        >
            <Paper elevation={3} className="p-6">
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Box>
                        <Button
                            className='mt-2'
                            variant="outlined"
                            startIcon={<ArrowForwardIcon/>}
                            onClick={handleBackToDashboard}
                            color="primary"
                        >
                            بازگشت به داشبورد مالی
                        </Button>
                        <Typography variant="h6" component="h2" mt={2} ml={2} mb={2}>
                            لیست پرداختی‌ها
                        </Typography>

                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <IconButton color="primary" onClick={() => setShowSearch((s) => !s)}>
                            <SearchIcon/>
                        </IconButton>
                        <motion.div
                            initial={{width: 0, opacity: 0}}
                            animate={showSearch ? {width: 240, opacity: 1} : {width: 0, opacity: 0}}
                            transition={{duration: 0.2}}
                            style={{overflow: 'hidden'}}
                        >
                            <TextField
                                size="small"
                                placeholder="جستجو..."
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    debouncedSetSearch(e.target.value);
                                }}
                                dir="rtl"
                            />
                        </motion.div>
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon/>}
                            onClick={handleOpenFilters}
                        >
                            فیلتر
                        </Button>
                    </Box>
                </Box>

                {isFetching && (
                    <Box display="flex" justifyContent="center" my={2}>
                        <CircularProgress size={24}/>
                    </Box>
                )}

                <TableContainer>
                    <Table dir="rtl">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{textAlign: 'center'}}>
                                    <TableSortLabel
                                        active={orderBy === 'id'}
                                        direction={orderBy === 'id' ? order : 'asc'}
                                        onClick={() => handleRequestSort('id')}
                                    >
                                        شناسه
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" sx={{textAlign: 'center'}}>
                                    <TableSortLabel
                                        active={orderBy === 'serviceName'}
                                        direction={orderBy === 'serviceName' ? order : 'asc'}
                                        onClick={() => handleRequestSort('serviceName')}
                                    >
                                        سرویس
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" sx={{textAlign: 'center'}}>
                                    <TableSortLabel
                                        active={orderBy === 'amount'}
                                        direction={orderBy === 'amount' ? order : 'asc'}
                                        onClick={() => handleRequestSort('amount')}
                                    >
                                        مبلغ
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" sx={{textAlign: 'center'}}>
                                    <TableSortLabel
                                        active={orderBy === 'method'}
                                        direction={orderBy === 'method' ? order : 'asc'}
                                        onClick={() => handleRequestSort('method')}
                                    >
                                        روش
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" sx={{textAlign: 'center'}}>
                                    <TableSortLabel
                                        active={orderBy === 'paymentStatus'}
                                        direction={orderBy === 'paymentStatus' ? order : 'asc'}
                                        onClick={() => handleRequestSort('paymentStatus')}
                                    >
                                        وضعیت
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" sx={{textAlign: 'center'}}>
                                    <TableSortLabel
                                        active={orderBy === 'createdAt'}
                                        direction={orderBy === 'createdAt' ? order : 'asc'}
                                        onClick={() => handleRequestSort('createdAt')}
                                    >
                                        تاریخ
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" sx={{textAlign: 'center'}}>کاربر</TableCell>
                                <TableCell align="center" sx={{textAlign: 'center'}}>عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.data.map((payment) => (
                                <TableRow key={payment.id} hover>
                                    <TableCell align="center"
                                               sx={{textAlign: 'center'}}>{payment.id.substring(0, 8)}</TableCell>
                                    <TableCell align="center"
                                               sx={{textAlign: 'center'}}>{payment.serviceFa || payment.service}</TableCell>
                                    <TableCell align="center"
                                               sx={{textAlign: 'center'}}>{new Intl.NumberFormat('fa-IR').format(payment.amount)} ریال</TableCell>
                                    <TableCell align="center"
                                               sx={{textAlign: 'center'}}>{payment.methodStr || payment.method}</TableCell>
                                    <TableCell align="center" sx={{textAlign: 'center'}}>
                                        <Chip
                                            label={getStatusLabel(payment)}
                                            color={getStatusChipColor(getStatusLabel(payment))}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{textAlign: 'center'}}>
                                        <Box dir="rtl">
                                            <Typography variant="body2" component="div" dir="rtl">
                                                {payment.createdAtStr}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" component="div"
                                                        dir="ltr">
                                                {payment.createdAtTimeStr}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{textAlign: 'center'}}>
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                            <Typography variant="body2">
                                                {payment.username || 'نامشخص'}
                                            </Typography>
                                            {payment.userId && (
                                                <Tooltip title="مشاهده اطلاعات کاربر">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenUserModal(payment.userId)}
                                                    >
                                                        <SearchIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{textAlign: 'center'}}>
                                        <Box display="flex" gap={1} justifyContent="center">
                                            <Button
                                                variant="text"
                                                color="primary"
                                                onClick={() => handleOpenDetails(payment)}
                                                size="small"
                                            >
                                                جزئیات
                                            </Button>
                                            {/*{payment.hasBill && (*/}
                                            {/*    <Tooltip title="دریافت فاکتور">*/}
                                            {/*        <IconButton*/}
                                            {/*            color="primary"*/}
                                            {/*            size="small"*/}
                                            {/*            onClick={() => window.open(`/api/v1/payments/${payment.id}/invoice`, '_blank')}*/}
                                            {/*        >*/}
                                            {/*            <ReceiptIcon fontSize="small"/>*/}
                                            {/*        </IconButton>*/}
                                            {/*    </Tooltip>*/}
                                            {/*)}*/}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data?.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body2" color="textSecondary">
                                            پرداختی یافت نشد
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data?.pagination?.totalElements || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="تعداد در صفحه"
                    labelDisplayedRows={({from, to, count}) => `${from}-${to} از ${count}`}
                />

                {/* Payment Details Dialog */}
                <Dialog
                    open={openDetails}
                    onClose={handleCloseDetails}
                    maxWidth="md"
                    fullWidth
                    TransitionComponent={motion.div}
                >
                    <DialogTitle>
                        جزئیات پرداخت
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseDetails}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedPayment && (
                            <PaymentDetails
                                payment={selectedPayment}
                                onClose={handleCloseDetails}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Filters Dialog */}
                <Dialog
                    open={openFilters}
                    onClose={handleCloseFilters}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        فیلترها
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseFilters}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                            }}
                        >
                            <CloseIcon/>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <FormControl fullWidth>
                                <InputLabel>وضعیت</InputLabel>
                                <Select
                                    value={filters.paymentStatus}
                                    onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                                    label="وضعیت"
                                >
                                    <MenuItem value="">همه</MenuItem>
                                    <MenuItem value="START">شروع پرداخت</MenuItem>
                                    <MenuItem value="VERIFY">تایید بانک</MenuItem>
                                    <MenuItem value="DONE">موفق</MenuItem>
                                    <MenuItem value="CANCELLED">لغو کاربر</MenuItem>
                                    <MenuItem value="FAILED">ناموفق</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>سرویس</InputLabel>
                                <Select
                                    value={filters.serviceName}
                                    onChange={(e) => setFilters({...filters, serviceName: e.target.value})}
                                    label="سرویس"
                                >
                                    <MenuItem value="">همه</MenuItem>
                                    <MenuItem value="INCREASE_CREDIT">افزایش اعتبار</MenuItem>
                                    {/*<MenuItem value="TRANSFER_CREDIT">انتقال اعتبار</MenuItem>*/}
                                    {/*<MenuItem value="BUY_SUBSCRIPTION">خرید اشتراک</MenuItem>*/}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>روش پرداخت</InputLabel>
                                <Select
                                    value={filters.method}
                                    onChange={(e) => setFilters({...filters, method: e.target.value})}
                                    label="روش پرداخت"
                                >
                                    <MenuItem value="">همه</MenuItem>
                                    <MenuItem value="ONLINE">درگاه بانکی</MenuItem>
                                    <MenuItem value="CREDIT">اعتباری</MenuItem>
                                    <MenuItem value="WALLET">کیف پول</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="از تاریخ"
                                type="date"
                                value={filters.fromDate}
                                onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                fullWidth
                            />

                            <TextField
                                label="تا تاریخ"
                                type="date"
                                value={filters.toDate}
                                onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResetFilters} color="secondary">
                            حذف فیلترها
                        </Button>
                        <Button onClick={handleApplyFilters} color="primary">
                            اعمال
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* User Info Modal */}
                <UserInfoModal
                    open={openUserModal}
                    onClose={handleCloseUserModal}
                    userId={selectedUserId}
                />
            </Paper>
        </motion.div>
    );
};

export default PaymentsTable;