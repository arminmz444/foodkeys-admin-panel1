// src/app/components/finance/PaymentDetails.jsx
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Button 
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

const PaymentDetails = ({ payment }) => {
  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h3">
              اطلاعات کلی
            </Typography>
            {/*{payment.hasBill && (*/}
            {/*  <Button*/}
            {/*    variant="contained"*/}
            {/*    color="primary"*/}
            {/*    startIcon={<ReceiptIcon />}*/}
            {/*    onClick={() => window.open(`/api/v1/payments/${payment.id}/invoice`, '_blank')}*/}
            {/*    size="small"*/}
            {/*  >*/}
            {/*    دریافت فاکتور*/}
            {/*  </Button>*/}
            {/*)}*/}
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                شناسه پرداخت
              </Typography>
              <Typography variant="body1">{payment.id}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                مبلغ
              </Typography>
              <Typography variant="body1">
                {new Intl.NumberFormat('fa-IR').format(payment.amount)} ریال
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                سرویس
              </Typography>
              <Typography variant="body1">
                {payment.serviceFa || payment.service}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                روش پرداخت
              </Typography>
              <Typography variant="body1">{payment.methodStr || payment.method}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                وضعیت
              </Typography>
              <Chip 
                label={payment.paymentStatus}
                size="small"
                color={
                  payment.paymentStatusColor === 'success' ? 'success' :
                  payment.paymentStatusColor === 'warning' ? 'warning' :
                  payment.paymentStatusColor === 'danger' ? 'error' : 'default'
                }
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                شناسه تراکنش
              </Typography>
              <Typography variant="body1">{payment.transactionId}</Typography>
            </Box>
            
            {payment.username && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  نام کاربری
                </Typography>
                <Typography variant="body1">{payment.username}</Typography>
              </Box>
            )}
            
            {payment.userFullName && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  نام کامل کاربر
                </Typography>
                <Typography variant="body1">{payment.userFullName}</Typography>
              </Box>
            )}
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                تاریخ ایجاد
              </Typography>
              <Box dir="rtl">
                <Typography variant="body1" dir="rtl">
                  {payment.createdAtStr}
                </Typography>
                <Typography variant="caption" color="textSecondary" dir="ltr">
                  {payment.createdAtTimeStr}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                آخرین بروزرسانی
              </Typography>
              <Box dir="rtl">
                <Typography variant="body1" dir="rtl">
                  {payment.updatedAtStr}
                </Typography>
                <Typography variant="caption" color="textSecondary" dir="ltr">
                  {payment.updatedAtTimeStr}
                </Typography>
              </Box>
            </Box>
            
            {payment.refId && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  کد پیگیری
                </Typography>
                <Typography variant="body1">{payment.refId}</Typography>
              </Box>
            )}
            
            {payment.description && (
              <Box gridColumn="span 2">
                <Typography variant="subtitle2" color="textSecondary">
                  توضیحات
                </Typography>
                <Typography variant="body1">{payment.description}</Typography>
              </Box>
            )}
            
            {payment.billId && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  شماره فاکتور
                </Typography>
                <Typography variant="body1">{payment.billId}</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentDetails;