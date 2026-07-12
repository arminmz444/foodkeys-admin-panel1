import { createSlice } from "@reduxjs/toolkit";
import { rootReducer } from 'app/store/lazyLoadedSlices';

const mockSystemEmailTemplates = [
  {
    id: "1",
    name: "تایید ثبت نام",
    subject: "تایید ثبت نام",
    body: 'با تشکر از ثبت نام و ایجاد حساب کاربری در برنامه "{app_name}". قبل از ورود و شروع کار با برنامه، لطفاً آدرس ایمیل خود را با کلیک روی لینک زیر تایید کنید:',
    isSystem: true,
    enabled: true
  },
  {
    id: "2",
    name: "اولین ورود کاربر",
    subject: "خوش آمدید به پلتفرم ما",
    body: "به پلتفرم ما خوش آمدید! از حضور شما خوشحالیم.",
    isSystem: true,
    enabled: true
  },
  {
    id: "3",
    name: "ثبت نام کاربر",
    subject: "ثبت نام تکمیل شد",
    body: "ثبت نام شما کامل شد. اکنون می‌توانید به تمامی ویژگی‌های پلتفرم ما دسترسی داشته باشید.",
    isSystem: true,
    enabled: true
  },
  {
    id: "4",
    name: "درخواست بازیابی رمز عبور",
    subject: "بازیابی رمز عبور",
    body: "شما درخواست بازنشانی رمز عبور خود را کرده‌اید. لطفاً روی لینک زیر کلیک کنید تا رمز عبور جدیدی ایجاد کنید.",
    isSystem: true,
    enabled: true
  },
  {
    id: "5",
    name: "درخواست بازیابی رمز عبور توسط...",
    subject: "درخواست بازیابی رمز عبور",
    body: "درخواست بازیابی رمز عبور برای حساب کاربری شما آغاز شده است.",
    isSystem: true,
    enabled: true
  },
];

const mockEmailTemplates = [
  {
    id: "6",
    name: "قالب سفارشی",
    subject: "قالب سفارشی",
    body: "",
    isSystem: false,
    enabled: true
  },
  {
    id: "7",
    name: "قالب پیام خوش‌آمدگویی",
    subject: "خوش آمدید",
    body: "سلام،\n\nاین یک قالب ایمیل سفارشی است.",
    isSystem: false,
    enabled: true
  },
];

const mockSystemSmsTemplates = [
  {
    id: "1",
    name: "تایید رمز یکبار مصرف",
    subject: "تایید رمز یکبار مصرف",
    body: "کد تایید شما {otp_code} است. لطفاً این کد را برای تایید هویت خود وارد کنید.",
    isSystem: true,
    enabled: true
  },
  {
    id: "2",
    name: "رمز یکبار مصرف شرکت",
    subject: "رمز یکبار مصرف شرکت",
    body: "{company_name}: رمز یکبار مصرف شما {otp_code} است. این کد در ۱۰ دقیقه منقضی می‌شود.",
    isSystem: true,
    enabled: true
  },
  {
    id: "3",
    name: "بازنشانی رمز عبور",
    subject: "بازنشانی رمز عبور",
    body: "شما درخواست بازنشانی رمز عبور خود را کرده‌اید. رمز عبور موقت شما {otp_code} است.",
    isSystem: true,
    enabled: true
  },
  {
    id: "4",
    name: "تایید حساب",
    subject: "تایید حساب",
    body: "لطفاً حساب خود را با وارد کردن کد زیر تایید کنید: {otp_code}.",
    isSystem: true,
    enabled: true
  },
  {
    id: "5",
    name: "اطلاع‌رسانی ورود",
    subject: "اطلاع‌رسانی ورود",
    body: "یک ورود جدید در حساب شما شناسایی شد. اگر این ورود توسط شما انجام نشده است، لطفاً فوراً با پشتیبانی تماس بگیرید.",
    isSystem: true,
    enabled: true
  },
];

const mockSmsTemplates = [
  {
    id: "6",
    name: "کمپین بازاریابی",
    subject: "پیشنهاد ویژه",
    body: "پیشنهاد ویژه فقط برای شما! از کد SAVE20 برای ۲۰٪ تخفیف در خرید بعدی خود استفاده کنید.",
    isSystem: false,
    enabled: true
  },
  {
    id: "7",
    name: "یادآوری قرار ملاقات",
    subject: "یادآوری قرار ملاقات",
    body: "یادآوری: شما یک قرار ملاقات برای فردا ساعت ۱۴:۰۰ دارید.",
    isSystem: false,
    enabled: true
  },
];

const initialState = {
  emailTemplates: mockEmailTemplates,
  systemEmailTemplates: mockSystemEmailTemplates,
  smsTemplates: mockSmsTemplates,
  systemSmsTemplates: mockSystemSmsTemplates,
  selectedEmailTemplate: mockSystemEmailTemplates[0],
  selectedSmsTemplate: mockSystemSmsTemplates[0],
  loading: false,
  error: null,
};

export const templatesSlice = createSlice({
  name: "messagingApp.templates",
  initialState,
  reducers: {
    setSelectedEmailTemplate: (state, action) => {
      state.selectedEmailTemplate = action.payload;
    },
    setSelectedSmsTemplate: (state, action) => {
      state.selectedSmsTemplate = action.payload;
    },
    setEmailTemplates: (state, action) => {
      const all = action.payload || [];
      state.systemEmailTemplates = all.filter((t) => t.isSystem);
      state.emailTemplates = all.filter((t) => !t.isSystem);
    },
    setSmsTemplates: (state, action) => {
      const all = action.payload || [];
      state.systemSmsTemplates = all.filter((t) => t.isSystem);
      state.smsTemplates = all.filter((t) => !t.isSystem);
    },
    addEmailTemplate: (state, action) => {
      state.emailTemplates = [...state.emailTemplates, action.payload];
    },
    addSmsTemplate: (state, action) => {
      state.smsTemplates = [...state.smsTemplates, action.payload];
    },
    updateEmailTemplate: (state, action) => {
      const index = state.emailTemplates.findIndex((template) => template.id === action.payload.id);
      if (index !== -1) {
        state.emailTemplates[index] = action.payload;
        if (state.selectedEmailTemplate.id === action.payload.id) {
          state.selectedEmailTemplate = action.payload;
        }
      }
    },
    updateSmsTemplate: (state, action) => {
      const index = state.smsTemplates.findIndex((template) => template.id === action.payload.id);
      if (index !== -1) {
        state.smsTemplates[index] = action.payload;
        if (state.selectedSmsTemplate.id === action.payload.id) {
          state.selectedSmsTemplate = action.payload;
        }
      }
    },
    deleteEmailTemplate: (state, action) => {
      state.emailTemplates = state.emailTemplates.filter(template => template.id !== action.payload);
      if (state.selectedEmailTemplate.id === action.payload) {
        const [firstTemplate] = state.systemEmailTemplates;
        state.selectedEmailTemplate = firstTemplate;
      }
    },
    deleteSmsTemplate: (state, action) => {
      state.smsTemplates = state.smsTemplates.filter(template => template.id !== action.payload);
      if (state.selectedSmsTemplate.id === action.payload) {
        const [firstTemplate] = state.systemSmsTemplates;
        state.selectedSmsTemplate = firstTemplate;
      }
    },
  },
  extraReducers: (builder) => {
  }
});

rootReducer.inject(templatesSlice);
const injectedSlice = templatesSlice.injectInto(rootReducer);
export const {
  setSelectedEmailTemplate,
  setSelectedSmsTemplate,
  setEmailTemplates,
  setSmsTemplates,
  addEmailTemplate,
  addSmsTemplate,
  updateEmailTemplate,
  updateSmsTemplate,
  deleteEmailTemplate,
  deleteSmsTemplate,
} = templatesSlice.actions;

const templatesSliceReducer = templatesSlice.reducer;
export default templatesSliceReducer;


// import { createSlice } from "@reduxjs/toolkit"
// import { mockTemplates, mockSystemTemplates, mockSmsTemplates, mockSystemSmsTemplates } from "../data/mock-data"

// const initialState = {
//   emailTemplates: mockTemplates,
//   systemEmailTemplates: mockSystemTemplates,
//   smsTemplates: mockSmsTemplates,
//   systemSmsTemplates: mockSystemSmsTemplates,
//   selectedEmailTemplate: mockSystemTemplates[0],
//   selectedSmsTemplate: mockSystemSmsTemplates[0],
// }

// const templatesSlice = createSlice({
//   name: "messagingApp/templates",
//   initialState,
//   reducers: {
//     setSelectedEmailTemplate: (state, action) => {
//       state.selectedEmailTemplate = action.payload
//     },
//     setSelectedSmsTemplate: (state, action) => {
//       state.selectedSmsTemplate = action.payload
//     },
//     addEmailTemplate: (state, action) => {
//       state.emailTemplates = [...state.emailTemplates, action.payload]
//     },
//     addSmsTemplate: (state, action) => {
//       state.smsTemplates = [...state.smsTemplates, action.payload]
//     },
//     updateEmailTemplate: (state, action) => {
//       const index = state.emailTemplates.findIndex((template) => template.id === action.payload.id)
//       if (index !== -1) {
//         state.emailTemplates[index] = action.payload
//       }
//     },
//     updateSmsTemplate: (state, action) => {
//       const index = state.smsTemplates.findIndex((template) => template.id === action.payload.id)
//       if (index !== -1) {
//         state.smsTemplates[index] = action.payload
//       }
//     },
//   },
// })

// export const {
//   setSelectedEmailTemplate,
//   setSelectedSmsTemplate,
//   addEmailTemplate,
//   addSmsTemplate,
//   updateEmailTemplate,
//   updateSmsTemplate,
// } = templatesSlice.actions

// export default templatesSlice.reducer

