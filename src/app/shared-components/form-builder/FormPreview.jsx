// // src/app/shared-components/form-builder/FormPreview.jsx
// import { useState } from 'react';
// import { 
//   Paper, 
//   Typography, 
//   Box, 
//   Button, 
//   TextField, 
//   FormControl, 
//   InputLabel, 
//   Select, 
//   MenuItem, 
//   FormControlLabel, 
//   Checkbox, 
//   FormHelperText,
//   Radio,
//   RadioGroup,
//   FormLabel,
//   Divider,
//   Grid,
//   CircularProgress,
//   Collapse,
//   Fade
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import { motion } from 'framer-motion';
// import { useForm, Controller } from 'react-hook-form';

// function FormPreview({ 
//   fields = [], 
//   formTitle = 'فرم پیش‌نمایش', 
//   formDescription = ''
// }) {
//   const [submittedData, setSubmittedData] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
  
//   // Create react-hook-form without Zod
//   const { 
//     control, 
//     handleSubmit, 
//     formState: { errors },
//     reset
//   } = useForm({
//     mode: 'onBlur'
//   });
  
//   // Submit handler
//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     setSubmittedData(data);
//     setIsSubmitting(false);
//     setShowSuccess(true);
    
//     // Hide success message after 3 seconds
//     setTimeout(() => {
//       setShowSuccess(false);
//     }, 3000);
//   };
  
//   // Reset form
//   const handleReset = () => {
//     reset();
//     setSubmittedData(null);
//   };
  
//   // Create validation rules from field configuration
//   const getValidationRules = (field) => {
//     const rules = {};
    
//     if (field.required) {
//       rules.required = "این فیلد الزامی است";
//     }
    
//     if (field.type === 'email') {
//       rules.pattern = {
//         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//         message: "ایمیل معتبر وارد کنید"
//       };
//     }
    
//     if (field.minLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.minLength = {
//         value: Number(field.minLength),
//         message: `حداقل ${field.minLength} کاراکتر وارد کنید`
//       };
//     }
    
//     if (field.maxLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.maxLength = {
//         value: Number(field.maxLength),
//         message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
//       };
//     }
    
//     if (field.min && ['number', 'range'].includes(field.type)) {
//       rules.min = {
//         value: Number(field.min),
//         message: `حداقل مقدار ${field.min} است`
//       };
//     }
    
//     if (field.max && ['number', 'range'].includes(field.type)) {
//       rules.max = {
//         value: Number(field.max),
//         message: `حداکثر مقدار ${field.max} است`
//       };
//     }
    
//     if (field.pattern) {
//       try {
//         rules.pattern = {
//           value: new RegExp(field.pattern),
//           message: "فرمت وارد شده صحیح نیست"
//         };
//       } catch (error) {
//         console.error('Invalid regex pattern:', error);
//       }
//     }
    
//     return rules;
//   };
  
//   // Render field based on type
//   const renderField = (field) => {
//     const fieldProps = {
//       fullWidth: true,
//       margin: "normal",
//       label: field.label || field.name,
//       placeholder: field.placeholder || '',
//       helperText: errors[field.name]?.message || field.description || '',
//       error: !!errors[field.name],
//       disabled: isSubmitting
//     };
    
//     const validationRules = getValidationRules(field);
    
//     switch (field.type) {
//       case 'text':
//       case 'password':
//       case 'email':
//       case 'url':
//       case 'tel':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'textarea':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 multiline
//                 rows={4}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'number':
//       case 'range':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type="number"
//                 onChange={(e) => {
//                   const val = e.target.value === '' ? '' : Number(e.target.value);
//                   onChange(val);
//                 }}
//                 onBlur={onBlur}
//                 value={value}
//                 inputRef={ref}
//                 InputProps={{
//                   inputProps: {
//                     min: field.min,
//                     max: field.max,
//                     step: field.step || 1
//                   }
//                 }}
//               />
//             )}
//           />
//         );
        
//       case 'select':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'multiselect':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || []}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value = [], ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   multiple
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'checkbox':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || false}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//               >
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={!!value}
//                       onChange={onChange}
//                       onBlur={onBlur}
//                       inputRef={ref}
//                       disabled={isSubmitting}
//                     />
//                   }
//                   label={field.label || field.name}
//                 />
//                 {errors[field.name]?.message && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'radio':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 component="fieldset" 
//                 margin="normal"
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//                 fullWidth
//               >
//                 <FormLabel component="legend">{field.label || field.name}</FormLabel>
//                 <RadioGroup
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value}
//                   ref={ref}
//                 >
//                   {(field.options || []).map((option) => (
//                     <FormControlLabel
//                       key={option}
//                       value={option}
//                       control={<Radio />}
//                       label={option}
//                     />
//                   ))}
//                 </RadioGroup>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'date':
//       case 'datetime-local':
//       case 'time':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value}
//                 inputRef={ref}
//                 InputLabelProps={{ shrink: true }}
//               />
//             )}
//           />
//         );
        
//       default:
//         return null;
//     }
//   };
  
//   return (
//     <Paper 
//       className="p-6 relative" 
//       elevation={3} 
//       sx={{ 
//         maxWidth: '800px', 
//         margin: '0 auto', 
//         backgroundColor: '#fafafa',
//         position: 'relative' 
//       }}
//     >
//       {/* Success animation */}
//       <Fade in={showSuccess}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: 'rgba(255, 255, 255, 0.8)',
//             zIndex: 10,
//             backdropFilter: 'blur(2px)'
//           }}
//         >
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.5, type: 'spring' }}
//           >
//             <CheckCircleIcon 
//               color="success" 
//               sx={{ fontSize: 80, mb: 2 }} 
//             />
//           </motion.div>
//           <Typography variant="h5" color="success.main" gutterBottom>
//             فرم با موفقیت ارسال شد
//           </Typography>
//         </Box>
//       </Fade>
      
//       <Typography variant="h5" gutterBottom>
//         {formTitle}
//       </Typography>
      
//       {formDescription && (
//         <Typography 
//           variant="body2" 
//           color="textSecondary" 
//           paragraph
//           sx={{ mb: 3 }}
//         >
//           {formDescription}
//         </Typography>
//       )}
      
//       <Divider sx={{ mb: 3 }} />
      
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Grid container spacing={2}>
//           {fields.map(field => (
//             <Grid item xs={12} key={field.id}>
//               {renderField(field)}
//             </Grid>
//           ))}
//         </Grid>
        
//         <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//           <Button
//             variant="outlined"
//             onClick={handleReset}
//             disabled={isSubmitting}
//           >
//             پاک کردن فرم
//           </Button>
          
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             disabled={isSubmitting}
//             startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//           >
//             {isSubmitting ? 'در حال ارسال...' : 'ارسال فرم'}
//           </Button>
//         </Box>
//       </form>
      
//       {/* Show submitted data */}
//       <Collapse in={!!submittedData && !showSuccess}>
//         <Paper 
//           elevation={2} 
//           sx={{ mt: 4, p: 2, backgroundColor: '#f0f8ff' }}
//         >
//           <Typography variant="subtitle1" gutterBottom>
//             داده‌های ارسال شده:
//           </Typography>
//           <pre
//             style={{
//               direction: 'ltr',
//               textAlign: 'left',
//               overflow: 'auto',
//               maxHeight: '300px',
//               padding: '12px',
//               backgroundColor: '#f5f5f5',
//               borderRadius: '4px',
//               fontSize: '0.875rem'
//             }}
//           >
//             {JSON.stringify(submittedData, null, 2)}
//           </pre>
//         </Paper>
//       </Collapse>
//     </Paper>
//   );
// }

// export default FormPreview;

// import { useState, useEffect } from 'react';
// import { 
//   Paper, 
//   Typography, 
//   Box, 
//   Button, 
//   TextField, 
//   FormControl, 
//   InputLabel, 
//   Select, 
//   MenuItem, 
//   FormControlLabel, 
//   Checkbox, 
//   FormHelperText,
//   Radio,
//   RadioGroup,
//   FormLabel,
//   Divider,
//   Grid,
//   CircularProgress,
//   Collapse,
//   Fade
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import { motion } from 'framer-motion';
// import { useForm, Controller } from 'react-hook-form';

// function FormPreview({ 
//   fields = [], 
//   formTitle = 'فرم پیش‌نمایش', 
//   formDescription = '',
//   initialData = {},
//   onDataChange = () => {},
//   submitButtonLabel = 'ارسال فرم',
//   hideSubmitButton = false
// }) {
//   const [submittedData, setSubmittedData] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
  
//   // Create react-hook-form without Zod
//   const { 
//     control, 
//     handleSubmit, 
//     formState: { errors },
//     reset,
//     watch
//   } = useForm({
//     mode: 'onBlur',
//     defaultValues: initialData
//   });
  
//   // Watch all fields to notify parent component of changes
//   const formValues = watch();
//   useEffect(() => {
//     onDataChange(formValues);
//   }, [formValues, onDataChange]);
  
//   // Reset form when initialData changes
//   useEffect(() => {
//     if (initialData && Object.keys(initialData).length > 0) {
//       reset(initialData);
//     }
//   }, [initialData, reset]);
  
//   // Submit handler
//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     setSubmittedData(data);
//     setIsSubmitting(false);
//     setShowSuccess(true);
    
//     // Notify parent component of submitted data
//     onDataChange(data);
    
//     // Hide success message after 3 seconds
//     setTimeout(() => {
//       setShowSuccess(false);
//     }, 3000);
//   };
  
//   // Reset form
//   const handleReset = () => {
//     reset(initialData);
//     setSubmittedData(null);
//   };
  
//   // Create validation rules from field configuration
//   const getValidationRules = (field) => {
//     const rules = {};
    
//     if (field.required) {
//       rules.required = "این فیلد الزامی است";
//     }
    
//     if (field.type === 'email') {
//       rules.pattern = {
//         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//         message: "ایمیل معتبر وارد کنید"
//       };
//     }
    
//     if (field.minLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.minLength = {
//         value: Number(field.minLength),
//         message: `حداقل ${field.minLength} کاراکتر وارد کنید`
//       };
//     }
    
//     if (field.maxLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.maxLength = {
//         value: Number(field.maxLength),
//         message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
//       };
//     }
    
//     if (field.min && ['number', 'range'].includes(field.type)) {
//       rules.min = {
//         value: Number(field.min),
//         message: `حداقل مقدار ${field.min} است`
//       };
//     }
    
//     if (field.max && ['number', 'range'].includes(field.type)) {
//       rules.max = {
//         value: Number(field.max),
//         message: `حداکثر مقدار ${field.max} است`
//       };
//     }
    
//     if (field.pattern) {
//       try {
//         rules.pattern = {
//           value: new RegExp(field.pattern),
//           message: "فرمت وارد شده صحیح نیست"
//         };
//       } catch (error) {
//         console.error('Invalid regex pattern:', error);
//       }
//     }
    
//     return rules;
//   };
  
//   // Render field based on type
//   const renderField = (field) => {
//     const fieldProps = {
//       fullWidth: true,
//       margin: "normal",
//       label: field.label || field.name,
//       placeholder: field.placeholder || '',
//       helperText: errors[field.name]?.message || field.description || '',
//       error: !!errors[field.name],
//       disabled: isSubmitting,
//       size: "medium"
//     };
    
//     const validationRules = getValidationRules(field);
    
//     switch (field.type) {
//       case 'text':
//       case 'password':
//       case 'email':
//       case 'url':
//       case 'tel':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'textarea':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 multiline
//                 rows={4}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'number':
//       case 'range':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type="number"
//                 onChange={(e) => {
//                   const val = e.target.value === '' ? '' : Number(e.target.value);
//                   onChange(val);
//                 }}
//                 onBlur={onBlur}
//                 value={value ?? ""}
//                 inputRef={ref}
//                 InputProps={{
//                   inputProps: {
//                     min: field.min,
//                     max: field.max,
//                     step: field.step || 1
//                   }
//                 }}
//               />
//             )}
//           />
//         );
        
//       case 'select':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'multiselect':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || []}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value = [], ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   multiple
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || []}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'checkbox':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || false}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//               >
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={!!value}
//                       onChange={onChange}
//                       onBlur={onBlur}
//                       inputRef={ref}
//                       disabled={isSubmitting}
//                     />
//                   }
//                   label={field.label || field.name}
//                 />
//                 {errors[field.name]?.message && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'radio':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 component="fieldset" 
//                 margin="normal"
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//                 fullWidth
//               >
//                 <FormLabel component="legend">{field.label || field.name}</FormLabel>
//                 <RadioGroup
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   ref={ref}
//                 >
//                   {(field.options || []).map((option) => (
//                     <FormControlLabel
//                       key={option}
//                       value={option}
//                       control={<Radio />}
//                       label={option}
//                     />
//                   ))}
//                 </RadioGroup>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'date':
//       case 'datetime-local':
//       case 'time':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//                 InputLabelProps={{ shrink: true }}
//               />
//             )}
//           />
//         );
        
//       default:
//         return null;
//     }
//   };
  
//   return (
//     <Paper 
//       className="p-6 relative" 
//       elevation={0} 
//       sx={{ 
//         maxWidth: '100%', 
//         margin: '0 auto', 
//         backgroundColor: '#fafafa',
//         position: 'relative' 
//       }}
//     >
//       {/* Success animation */}
//       <Fade in={showSuccess}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: 'rgba(255, 255, 255, 0.8)',
//             zIndex: 10,
//             backdropFilter: 'blur(2px)'
//           }}
//         >
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.5, type: 'spring' }}
//           >
//             <CheckCircleIcon 
//               color="success" 
//               sx={{ fontSize: 80, mb: 2 }} 
//             />
//           </motion.div>
//           <Typography variant="h5" color="success.main" gutterBottom>
//             فرم با موفقیت ارسال شد
//           </Typography>
//         </Box>
//       </Fade>
      
//       {formTitle && (
//         <Typography variant="h6" gutterBottom>
//           {formTitle}
//         </Typography>
//       )}
      
//       {formDescription && (
//         <Typography 
//           variant="body2" 
//           color="textSecondary" 
//           paragraph
//           sx={{ mb: 3 }}
//         >
//           {formDescription}
//         </Typography>
//       )}
      
//       {(formTitle || formDescription) && (
//         <Divider sx={{ mb: 3 }} />
//       )}
      
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Grid container spacing={2}>
//           {fields.map(field => (
//             <Grid item xs={12} sm={field.column === 6 ? 6 : 12} key={field.id}>
//               {renderField(field)}
//             </Grid>
//           ))}
//         </Grid>
        
//         {!hideSubmitButton && (
//           <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               disabled={isSubmitting}
//             >
//               پاک کردن فرم
//             </Button>
            
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               disabled={isSubmitting}
//               startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//             >
//               {isSubmitting ? 'در حال ارسال...' : submitButtonLabel}
//             </Button>
//           </Box>
//         )}
//       </form>
      
//       {/* Show submitted data for debugging */}
//       {submittedData && !showSuccess && !hideSubmitButton && (
//         <Collapse in={!!submittedData}>
//           <Paper 
//             elevation={2} 
//             sx={{ mt: 4, p: 2, backgroundColor: '#f0f8ff' }}
//           >
//             <Typography variant="subtitle1" gutterBottom>
//               داده‌های ارسال شده:
//             </Typography>
//             <pre
//               style={{
//                 direction: 'ltr',
//                 textAlign: 'left',
//                 overflow: 'auto',
//                 maxHeight: '300px',
//                 padding: '12px',
//                 backgroundColor: '#f5f5f5',
//                 borderRadius: '4px',
//                 fontSize: '0.875rem'
//               }}
//             >
//               {JSON.stringify(submittedData, null, 2)}
//             </pre>
//           </Paper>
//         </Collapse>
//       )}
//     </Paper>
//   );
// }

// export default FormPreview;

// // src/app/shared-components/form-builder/FormPreview.jsx
// import { useState, useEffect } from 'react';
// import { 
//   Paper, 
//   Typography, 
//   Box, 
//   Button, 
//   TextField, 
//   FormControl, 
//   InputLabel, 
//   Select, 
//   MenuItem, 
//   FormControlLabel, 
//   Checkbox, 
//   FormHelperText,
//   Radio,
//   RadioGroup,
//   FormLabel,
//   Divider,
//   Grid,
//   CircularProgress,
//   Collapse,
//   Fade,
//   IconButton,
//   Card,
//   CardContent
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import AddCircleIcon from '@mui/icons-material/AddCircle';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { motion } from 'framer-motion';
// import { useForm, Controller, useFieldArray } from 'react-hook-form';

// function FormPreview({ 
//   fields = [], 
//   formTitle = 'فرم پیش‌نمایش', 
//   formDescription = '',
//   initialData = {},
//   onDataChange = () => {},
//   submitButtonLabel = 'ارسال فرم',
//   hideSubmitButton = false
// }) {
//   const [submittedData, setSubmittedData] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
  
//   // Create react-hook-form 
//   const { 
//     control, 
//     handleSubmit, 
//     formState: { errors },
//     reset,
//     watch,
//     getValues
//   } = useForm({
//     mode: 'onBlur',
//     defaultValues: initialData
//   });
  
//   // Watch all fields to notify parent component of changes
//   const formValues = watch();
//   useEffect(() => {
//     onDataChange(formValues);
//   }, [formValues, onDataChange]);
  
//   // Reset form when initialData changes
//   useEffect(() => {
//     if (initialData && Object.keys(initialData).length > 0) {
//       reset(initialData);
//     }
//   }, [initialData, reset]);
  
//   // Submit handler
//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     setSubmittedData(data);
//     setIsSubmitting(false);
//     setShowSuccess(true);
    
//     // Notify parent component of submitted data
//     onDataChange(data);
    
//     // Hide success message after 3 seconds
//     setTimeout(() => {
//       setShowSuccess(false);
//     }, 3000);
//   };
  
//   // Reset form
//   const handleReset = () => {
//     reset(initialData);
//     setSubmittedData(null);
//   };
  
//   // Create validation rules from field configuration
//   const getValidationRules = (field) => {
//     const rules = {};
    
//     if (field.required) {
//       rules.required = "این فیلد الزامی است";
//     }
    
//     if (field.type === 'email') {
//       rules.pattern = {
//         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//         message: "ایمیل معتبر وارد کنید"
//       };
//     }
    
//     if (field.minLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.minLength = {
//         value: Number(field.minLength),
//         message: `حداقل ${field.minLength} کاراکتر وارد کنید`
//       };
//     }
    
//     if (field.maxLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.maxLength = {
//         value: Number(field.maxLength),
//         message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
//       };
//     }
    
//     if (field.min && ['number', 'range'].includes(field.type)) {
//       rules.min = {
//         value: Number(field.min),
//         message: `حداقل مقدار ${field.min} است`
//       };
//     }
    
//     if (field.max && ['number', 'range'].includes(field.type)) {
//       rules.max = {
//         value: Number(field.max),
//         message: `حداکثر مقدار ${field.max} است`
//       };
//     }
    
//     if (field.minItems && field.type === 'array') {
//       rules.validate = {
//         minItems: value => {
//           const arrayValue = Array.isArray(value) ? value : [];
//           // Filter out empty values for validation
//           const nonEmptyItems = arrayValue.filter(item => item !== null && item !== undefined && item !== '');
//           return nonEmptyItems.length >= field.minItems || `حداقل ${field.minItems} مورد الزامی است`;
//         }
//       };
//     }
    
//     if (field.pattern) {
//       try {
//         rules.pattern = {
//           value: new RegExp(field.pattern),
//           message: "فرمت وارد شده صحیح نیست"
//         };
//       } catch (error) {
//         console.error('Invalid regex pattern:', error);
//       }
//     }
    
//     return rules;
//   };
  
//   // Render field based on type
//   const renderField = (field) => {
//     const fieldProps = {
//       fullWidth: true,
//       margin: "normal",
//       label: field.label || field.name,
//       placeholder: field.placeholder || '',
//       helperText: errors[field.name]?.message || field.description || '',
//       error: !!errors[field.name],
//       disabled: isSubmitting,
//       size: "medium"
//     };
    
//     const validationRules = getValidationRules(field);
    
//     switch (field.type) {
//       case 'text':
//       case 'password':
//       case 'email':
//       case 'url':
//       case 'tel':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'textarea':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 multiline
//                 rows={4}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'number':
//       case 'range':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type="number"
//                 onChange={(e) => {
//                   const val = e.target.value === '' ? '' : Number(e.target.value);
//                   onChange(val);
//                 }}
//                 onBlur={onBlur}
//                 value={value ?? ""}
//                 inputRef={ref}
//                 InputProps={{
//                   inputProps: {
//                     min: field.min,
//                     max: field.max,
//                     step: field.step || 1
//                   }
//                 }}
//               />
//             )}
//           />
//         );
        
//       case 'array':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ['']}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => {
//               // Ensure value is always an array with at least one item
//               const arrayValues = Array.isArray(value) && value.length > 0 ? value : [''];
              
//               return (
//                 <FormControl
//                   fullWidth
//                   margin="normal"
//                   error={!!errors[field.name]}
//                 >
//                   <Typography variant="subtitle2" gutterBottom>
//                     {field.label || field.name}
//                     {field.required && <span style={{ color: 'red' }}> *</span>}
//                   </Typography>
                  
//                   {arrayValues.map((item, index) => (
//                     <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
//                       <TextField
//                         fullWidth
//                         size="medium"
//                         value={item || ''}
//                         onChange={(e) => {
//                           const newValues = [...arrayValues];
//                           newValues[index] = e.target.value;
//                           onChange(newValues);
//                         }}
//                         onBlur={onBlur}
//                         placeholder={`${field.placeholder || ''} ${index + 1}`}
//                         error={!!errors[field.name]}
//                       />
                      
//                       <IconButton
//                         color="error"
//                         size="small"
//                         onClick={() => {
//                           // Remove this item if there's more than one
//                           if (arrayValues.length > 1) {
//                             const newValues = arrayValues.filter((_, i) => i !== index);
//                             onChange(newValues);
//                           } else {
//                             // If it's the last one, just clear it
//                             const newValues = [''];
//                             onChange(newValues);
//                           }
//                         }}
//                         sx={{ ml: 1 }}
//                         disabled={arrayValues.length === 1 && !arrayValues[0]}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
                      
//                       {index === arrayValues.length - 1 && (
//                         <IconButton
//                           color="primary"
//                           size="small"
//                           onClick={() => {
//                             const newValues = [...arrayValues, ''];
//                             onChange(newValues);
//                           }}
//                           sx={{ ml: 1 }}
//                         >
//                           <AddCircleIcon />
//                         </IconButton>
//                       )}
//                     </Box>
//                   ))}
                  
//                   {(errors[field.name]?.message || field.description) && (
//                     <FormHelperText error={!!errors[field.name]}>
//                       {errors[field.name]?.message || field.description}
//                     </FormHelperText>
//                   )}
//                 </FormControl>
//               );
//             }}
//           />
//         );        
        
//       case 'select':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'multiselect':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || []}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value = [], ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   multiple
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || []}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'checkbox':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || false}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//               >
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={!!value}
//                       onChange={onChange}
//                       onBlur={onBlur}
//                       inputRef={ref}
//                       disabled={isSubmitting}
//                     />
//                   }
//                   label={field.label || field.name}
//                 />
//                 {errors[field.name]?.message && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'radio':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 component="fieldset" 
//                 margin="normal"
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//                 fullWidth
//               >
//                 <FormLabel component="legend">{field.label || field.name}</FormLabel>
//                 <RadioGroup
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   ref={ref}
//                 >
//                   {(field.options || []).map((option) => (
//                     <FormControlLabel
//                       key={option}
//                       value={option}
//                       control={<Radio />}
//                       label={option}
//                     />
//                   ))}
//                 </RadioGroup>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'date':
//       case 'datetime-local':
//       case 'time':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//                 InputLabelProps={{ shrink: true }}
//               />
//             )}
//           />
//         );
        
//       default:
//         return null;
//     }
//   };
  
//   return (
//     <Paper 
//       className="p-6 relative" 
//       elevation={0} 
//       sx={{ 
//         maxWidth: '100%', 
//         margin: '0 auto', 
//         backgroundColor: '#fafafa',
//         position: 'relative' 
//       }}
//     >
//       {/* Success animation */}
//       <Fade in={showSuccess}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: 'rgba(255, 255, 255, 0.8)',
//             zIndex: 10,
//             backdropFilter: 'blur(2px)'
//           }}
//         >
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.5, type: 'spring' }}
//           >
//             <CheckCircleIcon 
//               color="success" 
//               sx={{ fontSize: 80, mb: 2 }} 
//             />
//           </motion.div>
//           <Typography variant="h5" color="success.main" gutterBottom>
//             فرم با موفقیت ارسال شد
//           </Typography>
//         </Box>
//       </Fade>
      
//       {formTitle && (
//         <Typography variant="h6" gutterBottom>
//           {formTitle}
//         </Typography>
//       )}
      
//       {formDescription && (
//         <Typography 
//           variant="body2" 
//           color="textSecondary" 
//           paragraph
//           sx={{ mb: 3 }}
//         >
//           {formDescription}
//         </Typography>
//       )}
      
//       {(formTitle || formDescription) && (
//         <Divider sx={{ mb: 3 }} />
//       )}
      
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Grid container spacing={2}>
//           {fields.map(field => (
//             <Grid item xs={12} sm={field.column === 6 ? 6 : 12} key={field.id}>
//               {renderField(field)}
//             </Grid>
//           ))}
//         </Grid>
        
//         {!hideSubmitButton && (
//           <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               disabled={isSubmitting}
//             >
//               پاک کردن فرم
//             </Button>
            
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               disabled={isSubmitting}
//               startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//             >
//               {isSubmitting ? 'در حال ارسال...' : submitButtonLabel}
//             </Button>
//           </Box>
//         )}
//       </form>
      
//       {/* Show submitted data for debugging */}
//       {submittedData && !showSuccess && !hideSubmitButton && (
//         <Collapse in={!!submittedData}>
//           <Paper 
//             elevation={2} 
//             sx={{ mt: 4, p: 2, backgroundColor: '#f0f8ff' }}
//           >
//             <Typography variant="subtitle1" gutterBottom>
//               داده‌های ارسال شده:
//             </Typography>
//             <pre
//               style={{
//                 direction: 'ltr',
//                 textAlign: 'left',
//                 overflow: 'auto',
//                 maxHeight: '300px',
//                 padding: '12px',
//                 backgroundColor: '#f5f5f5',
//                 borderRadius: '4px',
//                 fontSize: '0.875rem'
//               }}
//             >
//               {JSON.stringify(submittedData, null, 2)}
//             </pre>
//           </Paper>
//         </Collapse>
//       )}
//     </Paper>
//   );
// }

// export default FormPreview;

////BEST VERSION////
// // src/app/shared-components/form-builder/FormPreview.jsx
// import { useState, useEffect, useRef } from 'react';
// import { 
//   Paper, 
//   Typography, 
//   Box, 
//   Button, 
//   TextField, 
//   FormControl, 
//   InputLabel, 
//   Select, 
//   MenuItem, 
//   FormControlLabel, 
//   Checkbox, 
//   FormHelperText,
//   Radio,
//   RadioGroup,
//   FormLabel,
//   Divider,
//   Grid,
//   CircularProgress,
//   Collapse,
//   Fade,
//   IconButton
// } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import AddCircleIcon from '@mui/icons-material/AddCircle';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { motion } from 'framer-motion';
// import { useForm, Controller } from 'react-hook-form';

// function FormPreview({ 
//   fields = [], 
//   formTitle = 'فرم پیش‌نمایش', 
//   formDescription = '',
//   initialData = {},
//   onDataChange = () => {},
//   submitButtonLabel = 'ارسال فرم',
//   hideSubmitButton = false
// }) {
//   const [submittedData, setSubmittedData] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
  
//   // Use ref to track if the component is mounted to prevent unnecessary updates
//   const isMounted = useRef(true);
//   // Use ref to track if we're currently sending updates to parent to avoid loops
//   const isUpdatingParent = useRef(false);
//   // Use refs for the processed initial data and date fields
//   const dateFieldsRef = useRef(new Set());
  
//   // Process initial data to identify date fields and prepare Form values
//   const processedInitialData = (() => {
//     if (!initialData || Object.keys(initialData).length === 0) {
//       return {};
//     }
    
//     const processed = { ...initialData };
    
//     // Find date fields and convert string dates to Date objects
//     fields.forEach(field => {
//       if (field.type === 'date') {
//         // Mark this as a date field for future processing
//         dateFieldsRef.current.add(field.name);
        
//         if (initialData[field.name]) {
//           try {
//             const dateValue = initialData[field.name];
//             if (typeof dateValue === 'string') {
//               processed[field.name] = new Date(dateValue);
//             }
//           } catch (error) {
//             console.error(`Error parsing date for field ${field.name}:`, error);
//           }
//         }
//       }
//     });
    
//     return processed;
//   })();
  
//   // Create react-hook-form
//   const { 
//     control, 
//     handleSubmit, 
//     formState: { errors },
//     reset,
//     watch
//   } = useForm({
//     mode: 'onBlur',
//     defaultValues: processedInitialData
//   });
  
//   // Reset form when needed, with proper initial data
//   useEffect(() => {
//     if (Object.keys(processedInitialData).length > 0) {
//       reset(processedInitialData);
//     }
    
//     // Cleanup function
//     return () => {
//       isMounted.current = false;
//     };
//   }, [reset]);
  
//   // Watch all fields to notify parent component of changes
//   const formValues = watch();
  
//   // Handle notifying parent of changes without causing infinite loops
//   useEffect(() => {
//     // Skip if already updating parent or if no values
//     if (isUpdatingParent.current || !Object.keys(formValues).length) {
//       return;
//     }
    
//     // Set flag to prevent loops
//     isUpdatingParent.current = true;
    
//     // Process date fields for API
//     const processedValues = { ...formValues };
    
//     // Only process date fields that are actual Date objects
//     Array.from(dateFieldsRef.current).forEach(fieldName => {
//       if (formValues[fieldName] instanceof Date) {
//         try {
//           const date = formValues[fieldName];
//           const year = date.getFullYear();
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const day = String(date.getDate()).padStart(2, '0');
//           processedValues[fieldName] = `${year}-${month}-${day}`;
//         } catch (error) {
//           console.error(`Error formatting date for field ${fieldName}:`, error);
//         }
//       }
//     });
    
//     // Notify parent with processed values
//     onDataChange(processedValues);
    
//     // Reset the flag after a short delay
//     setTimeout(() => {
//       isUpdatingParent.current = false;
//     }, 0);
//   }, [formValues, onDataChange]);
  
//   // Submit handler
//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
    
//     // Format dates for submission
//     const processedData = { ...data };
    
//     // Process date fields
//     Array.from(dateFieldsRef.current).forEach(fieldName => {
//       if (data[fieldName] instanceof Date) {
//         try {
//           const date = data[fieldName];
//           const year = date.getFullYear();
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const day = String(date.getDate()).padStart(2, '0');
//           processedData[fieldName] = `${year}-${month}-${day}`;
//         } catch (error) {
//           console.error(`Error formatting date for field ${fieldName}:`, error);
//         }
//       }
//     });
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // Only proceed if still mounted
//     if (isMounted.current) {
//       setSubmittedData(processedData);
//       setIsSubmitting(false);
//       setShowSuccess(true);
      
//       // Hide success message after 3 seconds
//       setTimeout(() => {
//         if (isMounted.current) {
//           setShowSuccess(false);
//         }
//       }, 3000);
//     }
//   };
  
//   // Reset form
//   const handleReset = () => {
//     reset(processedInitialData);
//     setSubmittedData(null);
//   };
  
//   // Create validation rules from field configuration
//   const getValidationRules = (field) => {
//     const rules = {};
    
//     if (field.required) {
//       rules.required = "این فیلد الزامی است";
//     }
    
//     if (field.type === 'email') {
//       rules.pattern = {
//         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//         message: "ایمیل معتبر وارد کنید"
//       };
//     }
    
//     if (field.minLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.minLength = {
//         value: Number(field.minLength),
//         message: `حداقل ${field.minLength} کاراکتر وارد کنید`
//       };
//     }
    
//     if (field.maxLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.maxLength = {
//         value: Number(field.maxLength),
//         message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
//       };
//     }
    
//     if (field.min && ['number', 'range'].includes(field.type)) {
//       rules.min = {
//         value: Number(field.min),
//         message: `حداقل مقدار ${field.min} است`
//       };
//     }
    
//     if (field.max && ['number', 'range'].includes(field.type)) {
//       rules.max = {
//         value: Number(field.max),
//         message: `حداکثر مقدار ${field.max} است`
//       };
//     }
    
//     if (field.minItems && field.type === 'array') {
//       rules.validate = {
//         minItems: value => {
//           const arrayValue = Array.isArray(value) ? value : [];
//           // Filter out empty values for validation
//           const nonEmptyItems = arrayValue.filter(item => item !== null && item !== undefined && item !== '');
//           return nonEmptyItems.length >= field.minItems || `حداقل ${field.minItems} مورد الزامی است`;
//         }
//       };
//     }
    
//     if (field.pattern) {
//       try {
//         rules.pattern = {
//           value: new RegExp(field.pattern),
//           message: "فرمت وارد شده صحیح نیست"
//         };
//       } catch (error) {
//         console.error('Invalid regex pattern:', error);
//       }
//     }
    
//     return rules;
//   };
  
//   // Render field based on type
//   const renderField = (field) => {
//     const fieldProps = {
//       fullWidth: true,
//       margin: "normal",
//       label: field.label || field.name,
//       placeholder: field.placeholder || '',
//       helperText: errors[field.name]?.message || field.description || '',
//       error: !!errors[field.name],
//       disabled: isSubmitting,
//       size: "medium"
//     };
    
//     const validationRules = getValidationRules(field);
    
//     switch (field.type) {
//       case 'text':
//       case 'password':
//       case 'email':
//       case 'url':
//       case 'tel':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'textarea':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 multiline
//                 rows={4}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'number':
//       case 'range':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type="number"
//                 onChange={(e) => {
//                   const val = e.target.value === '' ? '' : Number(e.target.value);
//                   onChange(val);
//                 }}
//                 onBlur={onBlur}
//                 value={value ?? ""}
//                 inputRef={ref}
//                 InputProps={{
//                   inputProps: {
//                     min: field.min,
//                     max: field.max,
//                     step: field.step || 1
//                   }
//                 }}
//               />
//             )}
//           />
//         );
        
//       case 'array':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ['']}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => {
//               // Ensure value is always an array with at least one item
//               const arrayValues = Array.isArray(value) && value.length > 0 ? value : [''];
              
//               return (
//                 <FormControl
//                   fullWidth
//                   margin="normal"
//                   error={!!errors[field.name]}
//                 >
//                   <Typography variant="subtitle2" gutterBottom>
//                     {field.label || field.name}
//                     {field.required && <span style={{ color: 'red' }}> *</span>}
//                   </Typography>
                  
//                   {arrayValues.map((item, index) => (
//                     <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
//                       <TextField
//                         fullWidth
//                         size="medium"
//                         value={item || ''}
//                         onChange={(e) => {
//                           const newValues = [...arrayValues];
//                           newValues[index] = e.target.value;
//                           onChange(newValues);
//                         }}
//                         onBlur={onBlur}
//                         placeholder={`${field.placeholder || ''} ${index + 1}`}
//                         error={!!errors[field.name]}
//                       />
                      
//                       <IconButton
//                         color="error"
//                         size="small"
//                         onClick={() => {
//                           // Remove this item if there's more than one
//                           if (arrayValues.length > 1) {
//                             const newValues = arrayValues.filter((_, i) => i !== index);
//                             onChange(newValues);
//                           } else {
//                             // If it's the last one, just clear it
//                             const newValues = [''];
//                             onChange(newValues);
//                           }
//                         }}
//                         sx={{ ml: 1 }}
//                         disabled={arrayValues.length === 1 && !arrayValues[0]}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
                      
//                       {index === arrayValues.length - 1 && (
//                         <IconButton
//                           color="primary"
//                           size="small"
//                           onClick={() => {
//                             const newValues = [...arrayValues, ''];
//                             onChange(newValues);
//                           }}
//                           sx={{ ml: 1 }}
//                         >
//                           <AddCircleIcon />
//                         </IconButton>
//                       )}
//                     </Box>
//                   ))}
                  
//                   {(errors[field.name]?.message || field.description) && (
//                     <FormHelperText error={!!errors[field.name]}>
//                       {errors[field.name]?.message || field.description}
//                     </FormHelperText>
//                   )}
//                 </FormControl>
//               );
//             }}
//           />
//         );        
        
//       case 'select':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'multiselect':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || []}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value = [], ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   multiple
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || []}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'checkbox':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || false}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//               >
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={!!value}
//                       onChange={onChange}
//                       onBlur={onBlur}
//                       inputRef={ref}
//                       disabled={isSubmitting}
//                     />
//                   }
//                   label={field.label || field.name}
//                 />
//                 {errors[field.name]?.message && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'radio':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 component="fieldset" 
//                 margin="normal"
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//                 fullWidth
//               >
//                 <FormLabel component="legend">{field.label || field.name}</FormLabel>
//                 <RadioGroup
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   ref={ref}
//                 >
//                   {(field.options || []).map((option) => (
//                     <FormControlLabel
//                       key={option}
//                       value={option}
//                       control={<Radio />}
//                       label={option}
//                     />
//                   ))}
//                 </RadioGroup>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'date':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             rules={validationRules}
//             render={({ field: { onChange, value } }) => (
//               <FormControl
//                 fullWidth
//                 margin="normal"
//                 error={!!errors[field.name]}
//               >
//                 <DatePicker
//                   label={field.label || field.name}
//                   value={value}
//                   onChange={onChange}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       fullWidth
//                       error={!!errors[field.name]}
//                       helperText={errors[field.name]?.message || field.description || ''}
//                     />
//                   )}
//                 />
//                 {errors[field.name] && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'datetime-local':
//       case 'time':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//                 InputLabelProps={{ shrink: true }}
//               />
//             )}
//           />
//         );
        
//       default:
//         return null;
//     }
//   };
  
//   return (
//     <Paper 
//       className="p-6 relative" 
//       elevation={0} 
//       sx={{ 
//         maxWidth: '100%', 
//         margin: '0 auto', 
//         backgroundColor: '#fafafa',
//         position: 'relative' 
//       }}
//     >
//       {/* Success animation */}
//       <Fade in={showSuccess}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: 'rgba(255, 255, 255, 0.8)',
//             zIndex: 10,
//             backdropFilter: 'blur(2px)'
//           }}
//         >
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.5, type: 'spring' }}
//           >
//             <CheckCircleIcon 
//               color="success" 
//               sx={{ fontSize: 80, mb: 2 }} 
//             />
//           </motion.div>
//           <Typography variant="h5" color="success.main" gutterBottom>
//             فرم با موفقیت ارسال شد
//           </Typography>
//         </Box>
//       </Fade>
      
//       {formTitle && (
//         <Typography variant="h6" gutterBottom>
//           {formTitle}
//         </Typography>
//       )}
      
//       {formDescription && (
//         <Typography 
//           variant="body2" 
//           color="textSecondary" 
//           paragraph
//           sx={{ mb: 3 }}
//         >
//           {formDescription}
//         </Typography>
//       )}
      
//       {(formTitle || formDescription) && (
//         <Divider sx={{ mb: 3 }} />
//       )}
      
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Grid container spacing={2}>
//           {fields.map(field => (
//             <Grid item xs={12} sm={field.column === 6 ? 6 : 12} key={field.id}>
//               {renderField(field)}
//             </Grid>
//           ))}
//         </Grid>
        
//         {!hideSubmitButton && (
//           <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               disabled={isSubmitting}
//             >
//               پاک کردن فرم
//             </Button>
            
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               disabled={isSubmitting}
//               startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//             >
//               {isSubmitting ? 'در حال ارسال...' : submitButtonLabel}
//             </Button>
//           </Box>
//         )}
//       </form>
      
//       {/* Show submitted data for debugging */}
//       {submittedData && !showSuccess && !hideSubmitButton && (
//         <Collapse in={!!submittedData}>
//           <Paper 
//             elevation={2} 
//             sx={{ mt: 4, p: 2, backgroundColor: '#f0f8ff' }}
//           >
//             <Typography variant="subtitle1" gutterBottom>
//               داده‌های ارسال شده:
//             </Typography>
//             <pre
//               style={{
//                 direction: 'ltr',
//                 textAlign: 'left',
//                 overflow: 'auto',
//                 maxHeight: '300px',
//                 padding: '12px',
//                 backgroundColor: '#f5f5f5',
//                 borderRadius: '4px',
//                 fontSize: '0.875rem'
//               }}
//             >
//               {JSON.stringify(submittedData, null, 2)}
//             </pre>
//           </Paper>
//         </Collapse>
//       )}
//     </Paper>
//   );
// }

// export default FormPreview;


import { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Radio,
  RadioGroup,
  FormLabel,
  Divider,
  Grid,
  CircularProgress,
  Collapse,
  Fade,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';

// Import the FileUpload component
import FileUpload from './FileUpload';

function FormPreview({
                       fields = [],
                       formTitle = 'فرم پیش‌نمایش',
                       formDescription = '',
                       initialData = {},
                       onDataChange = () => {},
                       submitButtonLabel = 'ارسال فرم',
                       hideSubmitButton = false,
                       externalErrors = {},
                       onClearExternalError = () => {}
                     }) {
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Use ref to track if the component is mounted to prevent unnecessary updates
  const isMounted = useRef(true);
  // Use ref to track if we're currently sending updates to parent to avoid loops
  const isUpdatingParent = useRef(false);
  // Use refs for the processed initial data and date fields
  const dateFieldsRef = useRef(new Set());
  // Set to keep track of file fields
  const fileFieldsRef = useRef(new Set());

  // Helper function to determine field type from widget or type property
  const getFieldType = (field) => {
    // If field has type property (from form builder), use it
    if (field.type) return field.type;

    // If field has widget property (from JSON schema), map it
    if (field.widget) {
      switch (field.widget) {
        case 'textarea':
          return 'textarea';
        case 'select':
          return 'select';
        case 'multiselect':
          return 'multiselect';
        case 'file':
          return 'file';
        default:
          // For other widgets, infer from schema properties
          break;
      }
    }

    // Infer type from schema properties
    if (field.format === 'date') return 'date';
    if (field.format === 'time') return 'time';
    if (field.format === 'date-time') return 'datetime-local';
    if (field.format === 'email') return 'email';
    if (field.format === 'uri' && field.contentMediaType) return 'file';

    if (field.enum && field.type === 'string') return 'select';
    if (field.type === 'array' && field.items?.enum) return 'multiselect';
    if (field.type === 'boolean') return 'checkbox';
    if (field.type === 'number') return 'number';
    if (field.type === 'array' && !field.items?.enum) return 'array';

    // Default to text
    return 'text';
  };

  // Process initial data to identify date fields and prepare Form values
  const processedInitialData = (() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      return {};
    }

    const processed = { ...initialData };

    // Find date fields and convert string dates to Date objects
    fields.forEach(field => {
      const fieldType = getFieldType(field);
      if (fieldType === 'date') {
        // Mark this as a date field for future processing
        dateFieldsRef.current.add(field.name);

        if (initialData[field.name]) {
          try {
            const dateValue = initialData[field.name];
            if (typeof dateValue === 'string') {
              processed[field.name] = new Date(dateValue);
            }
          } catch (error) {
            console.error(`Error parsing date for field ${field.name}:`, error);
          }
        }
      } else if (fieldType === 'file') {
        // Mark this as a file field for future processing
        fileFieldsRef.current.add(field.name);
      }
    });

    return processed;
  })();

  // Create react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    mode: 'onBlur',
    defaultValues: processedInitialData
  });

  // Reset form when needed, with proper initial data
  useEffect(() => {
    if (Object.keys(processedInitialData).length > 0) {
      reset(processedInitialData);
    }

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [reset]);

  // Watch all fields to notify parent component of changes
  const formValues = watch();

  // Handle notifying parent of changes without causing infinite loops
  useEffect(() => {
    // Skip if already updating parent or if no values
    if (isUpdatingParent.current || !Object.keys(formValues).length) {
      return;
    }

    // Set flag to prevent loops
    isUpdatingParent.current = true;

    // Process date fields for API
    const processedValues = { ...formValues };

    // Only process date fields that are actual Date objects
    Array.from(dateFieldsRef.current).forEach(fieldName => {
      if (formValues[fieldName] instanceof Date) {
        try {
          const date = formValues[fieldName];
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          processedValues[fieldName] = `${year}-${month}-${day}`;
        } catch (error) {
          console.error(`Error formatting date for field ${fieldName}:`, error);
        }
      }
    });

    // Notify parent with processed values
    onDataChange(processedValues);

    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingParent.current = false;
    }, 0);
  }, [formValues, onDataChange]);

  // Submit handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Format dates for submission
    const processedData = { ...data };

    // Process date fields
    Array.from(dateFieldsRef.current).forEach(fieldName => {
      if (data[fieldName] instanceof Date) {
        try {
          const date = data[fieldName];
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          processedData[fieldName] = `${year}-${month}-${day}`;
        } catch (error) {
          console.error(`Error formatting date for field ${fieldName}:`, error);
        }
      }
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Only proceed if still mounted
    if (isMounted.current) {
      setSubmittedData(processedData);
      setIsSubmitting(false);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        if (isMounted.current) {
          setShowSuccess(false);
        }
      }, 3000);
    }
  };

  // Reset form
  const handleReset = () => {
    reset(processedInitialData);
    setSubmittedData(null);
  };

  // Create validation rules from field configuration
  const getValidationRules = (field) => {
    const rules = {};
    const fieldType = getFieldType(field);

    if (field.required) {
      rules.required = "این فیلد الزامی است";
    }

    if (fieldType === 'email' || field.format === 'email') {
      rules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "ایمیل معتبر وارد کنید"
      };
    }

    if (field.minLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(fieldType)) {
      rules.minLength = {
        value: Number(field.minLength),
        message: `حداقل ${field.minLength} کاراکتر وارد کنید`
      };
    }

    if (field.maxLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(fieldType)) {
      rules.maxLength = {
        value: Number(field.maxLength),
        message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
      };
    }

    if ((field.min !== undefined || field.minimum !== undefined) && ['number', 'range'].includes(fieldType)) {
      const minValue = field.min !== undefined ? field.min : field.minimum;
      rules.min = {
        value: Number(minValue),
        message: `حداقل مقدار ${minValue} است`
      };
    }

    if ((field.max !== undefined || field.maximum !== undefined) && ['number', 'range'].includes(fieldType)) {
      const maxValue = field.max !== undefined ? field.max : field.maximum;
      rules.max = {
        value: Number(maxValue),
        message: `حداکثر مقدار ${maxValue} است`
      };
    }

    if (field.minItems && fieldType === 'array') {
      rules.validate = {
        minItems: value => {
          const arrayValue = Array.isArray(value) ? value : [];
          // Filter out empty values for validation
          const nonEmptyItems = arrayValue.filter(item => item !== null && item !== undefined && item !== '');
          return nonEmptyItems.length >= field.minItems || `حداقل ${field.minItems} مورد الزامی است`;
        }
      };
    }

    if (field.pattern) {
      try {
        rules.pattern = {
          value: new RegExp(field.pattern),
          message: "فرمت وارد شده صحیح نیست"
        };
      } catch (error) {
        console.error('Invalid regex pattern:', error);
      }
    }

    // Add specific validation for file fields
    if (fieldType === 'file') {
      if (field.maxFiles > 1) {
        rules.validate = {
          ...rules.validate,
          maxFiles: value => {
            if (!value || !Array.isArray(value)) return true;
            return value.length <= field.maxFiles || `حداکثر ${field.maxFiles} فایل مجاز است`;
          }
        };
      }
    }

    return rules;
  };

  const getFieldErrorMessage = (fieldName) =>
    errors[fieldName]?.message || externalErrors?.[fieldName] || '';

  const hasFieldError = (fieldName) =>
    Boolean(errors[fieldName] || externalErrors?.[fieldName]);

  const withClearExternalError = (fieldName, onChange) => (value) => {
    if (externalErrors?.[fieldName]) {
      onClearExternalError(fieldName);
    }
    onChange(value);
  };

  // Render field based on type
  const renderField = (field) => {
    const fieldType = getFieldType(field);
    const fieldErrorMessage = getFieldErrorMessage(field.name);
    const fieldHasError = hasFieldError(field.name);

    const fieldProps = {
      fullWidth: true,
      margin: "normal",
      label: field.label || field.title || field.name,
      placeholder: field.placeholder || (field.examples && field.examples[0]) || '',
      helperText: fieldErrorMessage || field.description || '',
      error: fieldHasError,
      disabled: isSubmitting,
      size: "medium"
    };

    const validationRules = getValidationRules(field);

    switch (fieldType) {
      case 'text':
      case 'password':
      case 'email':
      case 'url':
      case 'tel':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || ""}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <TextField
                        {...fieldProps}
                        type={fieldType}
                        onChange={withClearExternalError(field.name, onChange)}
                        onBlur={onBlur}
                        value={value || ""}
                        inputRef={ref}
                    />
                )}
            />
        );

      case 'textarea':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || ""}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <TextField
                        {...fieldProps}
                        multiline
                        rows={4}
                        onChange={withClearExternalError(field.name, onChange)}
                        onBlur={onBlur}
                        value={value || ""}
                        inputRef={ref}
                    />
                )}
            />
        );

      case 'number':
      case 'range':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || ""}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <TextField
                        {...fieldProps}
                        type="number"
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          withClearExternalError(field.name, onChange)(val);
                        }}
                        onBlur={onBlur}
                        value={value ?? ""}
                        inputRef={ref}
                        InputProps={{
                          inputProps: {
                            min: field.min !== undefined ? field.min : field.minimum,
                            max: field.max !== undefined ? field.max : field.maximum,
                            step: field.step || field.multipleOf || 1
                          }
                        }}
                    />
                )}
            />
        );

      case 'array':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || ['']}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => {
                  // Ensure value is always an array with at least one item
                  const arrayValues = Array.isArray(value) && value.length > 0 ? value : [''];

                  return (
                      <FormControl
                          fullWidth
                          margin="normal"
                          error={fieldHasError}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {field.label || field.title || field.name}
                          {field.required && <span style={{ color: 'red' }}> *</span>}
                        </Typography>

                        {arrayValues.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
                              <TextField
                                  fullWidth
                                  size="medium"
                                  value={item || ''}
                                  onChange={(e) => {
                                    const newValues = [...arrayValues];
                                    newValues[index] = e.target.value;
                                    withClearExternalError(field.name, onChange)(newValues);
                                  }}
                                  onBlur={onBlur}
                                  placeholder={`${field.placeholder || (field.examples && field.examples[0]) || ''} ${index + 1}`}
                                  error={fieldHasError}
                              />

                              <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => {
                                    // Remove this item if there's more than one
                                    if (arrayValues.length > 1) {
                                      const newValues = arrayValues.filter((_, i) => i !== index);
                                      withClearExternalError(field.name, onChange)(newValues);
                                    } else {
                                      // If it's the last one, just clear it
                                      const newValues = [''];
                                      withClearExternalError(field.name, onChange)(newValues);
                                    }
                                  }}
                                  sx={{ ml: 1 }}
                                  disabled={arrayValues.length === 1 && !arrayValues[0]}
                              >
                                <DeleteIcon />
                              </IconButton>

                              {index === arrayValues.length - 1 && (
                                  <IconButton
                                      color="primary"
                                      size="small"
                                      onClick={() => {
                                        const newValues = [...arrayValues, ''];
                                        onChange(newValues);
                                      }}
                                      sx={{ ml: 1 }}
                                  >
                                    <AddCircleIcon />
                                  </IconButton>
                              )}
                            </Box>
                        ))}

                        {(fieldErrorMessage || field.description) && (
                            <FormHelperText error={fieldHasError}>
                              {fieldErrorMessage || field.description}
                            </FormHelperText>
                        )}
                      </FormControl>
                  );
                }}
            />
        );

      case 'select':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || ""}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <FormControl
                        fullWidth
                        margin="normal"
                        error={fieldHasError}
                        disabled={isSubmitting}
                    >
                      <InputLabel>{field.label || field.title || field.name}</InputLabel>
                      <Select
                          onChange={withClearExternalError(field.name, onChange)}
                          onBlur={onBlur}
                          value={value || ""}
                          inputRef={ref}
                          label={field.label || field.title || field.name}
                      >
                        {(field.options || field.enum || []).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                        ))}
                      </Select>
                      {(fieldErrorMessage || field.description) && (
                          <FormHelperText error={fieldHasError}>
                            {fieldErrorMessage || field.description}
                          </FormHelperText>
                      )}
                    </FormControl>
                )}
            />
        );

      case 'multiselect':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || []}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value = [], ref } }) => (
                    <FormControl
                        fullWidth
                        margin="normal"
                        error={fieldHasError}
                        disabled={isSubmitting}
                    >
                      <InputLabel>{field.label || field.title || field.name}</InputLabel>
                      <Select
                          multiple
                          onChange={withClearExternalError(field.name, onChange)}
                          onBlur={onBlur}
                          value={value || []}
                          inputRef={ref}
                          label={field.label || field.title || field.name}
                      >
                        {(field.options || field.items?.enum || []).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                        ))}
                      </Select>
                      {(fieldErrorMessage || field.description) && (
                          <FormHelperText error={fieldHasError}>
                            {fieldErrorMessage || field.description}
                          </FormHelperText>
                      )}
                    </FormControl>
                )}
            />
        );

      case 'checkbox':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || false}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <FormControl
                        fullWidth
                        margin="normal"
                        error={fieldHasError}
                    >
                      <FormControlLabel
                          control={
                            <Checkbox
                                checked={!!value}
                                onChange={withClearExternalError(field.name, onChange)}
                                onBlur={onBlur}
                                inputRef={ref}
                                disabled={isSubmitting}
                            />
                          }
                          label={field.label || field.title || field.name}
                      />
                      {fieldErrorMessage && (
                          <FormHelperText error>
                            {fieldErrorMessage}
                          </FormHelperText>
                      )}
                    </FormControl>
                )}
            />
        );

      case 'radio':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || ""}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <FormControl
                        component="fieldset"
                        margin="normal"
                        error={fieldHasError}
                        disabled={isSubmitting}
                        fullWidth
                    >
                      <FormLabel component="legend">{field.label || field.title || field.name}</FormLabel>
                      <RadioGroup
                          onChange={withClearExternalError(field.name, onChange)}
                          onBlur={onBlur}
                          value={value || ""}
                          ref={ref}
                      >
                        {(field.options || field.enum || []).map((option) => (
                            <FormControlLabel
                                key={option}
                                value={option}
                                control={<Radio />}
                                label={option}
                            />
                        ))}
                      </RadioGroup>
                      {(fieldErrorMessage || field.description) && (
                          <FormHelperText error={fieldHasError}>
                            {fieldErrorMessage || field.description}
                          </FormHelperText>
                      )}
                    </FormControl>
                )}
            />
        );

      case 'date':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                rules={validationRules}
                render={({ field: { onChange, value } }) => (
                    <FormControl
                        fullWidth
                        margin="normal"
                        error={fieldHasError}
                    >
                      <DatePicker
                          label={field.label || field.title || field.name}
                          value={value}
                          onChange={withClearExternalError(field.name, onChange)}
                          renderInput={(params) => (
                              <TextField
                                  {...params}
                                  fullWidth
                                  error={fieldHasError}
                                  helperText={fieldErrorMessage || field.description || ''}
                              />
                          )}
                      />
                      {fieldErrorMessage && (
                          <FormHelperText error>
                            {fieldErrorMessage}
                          </FormHelperText>
                      )}
                    </FormControl>
                )}
            />
        );

      case 'datetime-local':
      case 'time':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.defaultValue || field.default || ""}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <TextField
                        {...fieldProps}
                        type={fieldType}
                        onChange={withClearExternalError(field.name, onChange)}
                        onBlur={onBlur}
                        value={value || ""}
                        inputRef={ref}
                        InputLabelProps={{ shrink: true }}
                    />
                )}
            />
        );

      case 'file':
        return (
            <Controller
                key={field.id || field.name}
                name={field.name}
                control={control}
                defaultValue={field.maxFiles > 1 ? [] : ""}
                rules={validationRules}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                    <FileUpload
                        value={value}
                        onChange={withClearExternalError(field.name, onChange)}
                        onBlur={onBlur}
                        error={fieldHasError}
                        helperText={fieldErrorMessage || field.description}
                        multiple={field.maxFiles > 1}
                        accept={field.accept || "*"}
                        maxSize={field.maxSize || 5 * 1024 * 1024}
                        maxFiles={field.maxFiles || 1}
                        label={field.label || field.title || field.name}
                        fileServiceType={field.fileServiceType || "SERVICE_FILE"}
                        disabled={isSubmitting}
                    />
                )}
            />
        );

      default:
        return null;
    }
  };

  return (
      <Paper
          className="p-6 relative"
          elevation={0}
          sx={{
            maxWidth: '100%',
            margin: '0 auto',
            backgroundColor: '#fafafa',
            position: 'relative'
          }}
      >
        {/* Success animation */}
        <Fade in={showSuccess}>
          <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 10,
                backdropFilter: 'blur(2px)'
              }}
          >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
              <CheckCircleIcon
                  color="success"
                  sx={{ fontSize: 80, mb: 2 }}
              />
            </motion.div>
            <Typography variant="h5" color="success.main" gutterBottom>
              فرم با موفقیت ارسال شد
            </Typography>
          </Box>
        </Fade>

        {formTitle && (
            <Typography variant="h6" gutterBottom>
              {formTitle}
            </Typography>
        )}

        {formDescription && (
            <Typography
                variant="body2"
                color="textSecondary"
                paragraph
                sx={{ mb: 3 }}
            >
              {formDescription}
            </Typography>
        )}

        {(formTitle || formDescription) && (
            <Divider sx={{ mb: 3 }} />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {fields.map(field => (
                <Grid item xs={12} sm={field.column === 6 ? 6 : 12} key={field.id || field.name}>
                  {renderField(field)}
                </Grid>
            ))}
          </Grid>

          {!hideSubmitButton && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={isSubmitting}
                >
                  پاک کردن فرم
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'در حال ارسال...' : submitButtonLabel}
                </Button>
              </Box>
          )}
        </form>

        {/* Show submitted data for debugging */}
        {submittedData && !showSuccess && !hideSubmitButton && (
            <Collapse in={!!submittedData}>
              <Paper
                  elevation={2}
                  sx={{ mt: 4, p: 2, backgroundColor: '#f0f8ff' }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  داده‌های ارسال شده:
                </Typography>
                <pre
                    style={{
                      direction: 'ltr',
                      textAlign: 'left',
                      overflow: 'auto',
                      maxHeight: '300px',
                      padding: '12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}
                >
              {JSON.stringify(submittedData, null, 2)}
            </pre>
              </Paper>
            </Collapse>
        )}
      </Paper>
  );
}

export default FormPreview;


///////////////////////**************BEST*****************///////////////////
// src/app/shared-components/form-builder/FormPreview.jsx
// import { useState, useEffect, useRef } from 'react';
// import {
//   Paper,
//   Typography,
//   Box,
//   Button,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   FormControlLabel,
//   Checkbox,
//   FormHelperText,
//   Radio,
//   RadioGroup,
//   FormLabel,
//   Divider,
//   Grid,
//   CircularProgress,
//   Collapse,
//   Fade,
//   IconButton
// } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import AddCircleIcon from '@mui/icons-material/AddCircle';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { motion } from 'framer-motion';
// import { useForm, Controller } from 'react-hook-form';
//
// // Import the FileUpload component
// import FileUpload from './FileUpload';
//
// function FormPreview({
//   fields = [],
//   formTitle = 'فرم پیش‌نمایش',
//   formDescription = '',
//   initialData = {},
//   onDataChange = () => {},
//   submitButtonLabel = 'ارسال فرم',
//   hideSubmitButton = false
// }) {
//   const [submittedData, setSubmittedData] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//
//   // Use ref to track if the component is mounted to prevent unnecessary updates
//   const isMounted = useRef(true);
//   // Use ref to track if we're currently sending updates to parent to avoid loops
//   const isUpdatingParent = useRef(false);
//   // Use refs for the processed initial data and date fields
//   const dateFieldsRef = useRef(new Set());
//   // Set to keep track of file fields
//   const fileFieldsRef = useRef(new Set());
//
//   // Process initial data to identify date fields and prepare Form values
//   const processedInitialData = (() => {
//     if (!initialData || Object.keys(initialData).length === 0) {
//       return {};
//     }
//
//     const processed = { ...initialData };
//
//     // Find date fields and convert string dates to Date objects
//     fields.forEach(field => {
//       if (field.type === 'date') {
//         // Mark this as a date field for future processing
//         dateFieldsRef.current.add(field.name);
//
//         if (initialData[field.name]) {
//           try {
//             const dateValue = initialData[field.name];
//             if (typeof dateValue === 'string') {
//               processed[field.name] = new Date(dateValue);
//             }
//           } catch (error) {
//             console.error(`Error parsing date for field ${field.name}:`, error);
//           }
//         }
//       } else if (field.type === 'file') {
//         // Mark this as a file field for future processing
//         fileFieldsRef.current.add(field.name);
//       }
//     });
//
//     return processed;
//   })();
//
//   // Create react-hook-form
//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     watch
//   } = useForm({
//     mode: 'onBlur',
//     defaultValues: processedInitialData
//   });
//
//   // Reset form when needed, with proper initial data
//   useEffect(() => {
//     if (Object.keys(processedInitialData).length > 0) {
//       reset(processedInitialData);
//     }
//
//     // Cleanup function
//     return () => {
//       isMounted.current = false;
//     };
//   }, [reset]);
//
//   // Watch all fields to notify parent component of changes
//   const formValues = watch();
//
//   // Handle notifying parent of changes without causing infinite loops
//   useEffect(() => {
//     // Skip if already updating parent or if no values
//     if (isUpdatingParent.current || !Object.keys(formValues).length) {
//       return;
//     }
//
//     // Set flag to prevent loops
//     isUpdatingParent.current = true;
//
//     // Process date fields for API
//     const processedValues = { ...formValues };
//
//     // Only process date fields that are actual Date objects
//     Array.from(dateFieldsRef.current).forEach(fieldName => {
//       if (formValues[fieldName] instanceof Date) {
//         try {
//           const date = formValues[fieldName];
//           const year = date.getFullYear();
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const day = String(date.getDate()).padStart(2, '0');
//           processedValues[fieldName] = `${year}-${month}-${day}`;
//         } catch (error) {
//           console.error(`Error formatting date for field ${fieldName}:`, error);
//         }
//       }
//     });
//
//     // Notify parent with processed values
//     onDataChange(processedValues);
//
//     // Reset the flag after a short delay
//     setTimeout(() => {
//       isUpdatingParent.current = false;
//     }, 0);
//   }, [formValues, onDataChange]);
//
//   // Submit handler
//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
//
//     // Format dates for submission
//     const processedData = { ...data };
//
//     // Process date fields
//     Array.from(dateFieldsRef.current).forEach(fieldName => {
//       if (data[fieldName] instanceof Date) {
//         try {
//           const date = data[fieldName];
//           const year = date.getFullYear();
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const day = String(date.getDate()).padStart(2, '0');
//           processedData[fieldName] = `${year}-${month}-${day}`;
//         } catch (error) {
//           console.error(`Error formatting date for field ${fieldName}:`, error);
//         }
//       }
//     });
//
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
//
//     // Only proceed if still mounted
//     if (isMounted.current) {
//       setSubmittedData(processedData);
//       setIsSubmitting(false);
//       setShowSuccess(true);
//
//       // Hide success message after 3 seconds
//       setTimeout(() => {
//         if (isMounted.current) {
//           setShowSuccess(false);
//         }
//       }, 3000);
//     }
//   };
//
//   // Reset form
//   const handleReset = () => {
//     reset(processedInitialData);
//     setSubmittedData(null);
//   };
//
//   // Create validation rules from field configuration
//   const getValidationRules = (field) => {
//     const rules = {};
//
//     if (field.required) {
//       rules.required = "این فیلد الزامی است";
//     }
//
//     if (field.type === 'email') {
//       rules.pattern = {
//         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//         message: "ایمیل معتبر وارد کنید"
//       };
//     }
//
//     if (field.minLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.minLength = {
//         value: Number(field.minLength),
//         message: `حداقل ${field.minLength} کاراکتر وارد کنید`
//       };
//     }
//
//     if (field.maxLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.maxLength = {
//         value: Number(field.maxLength),
//         message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
//       };
//     }
//
//     if (field.min && ['number', 'range'].includes(field.type)) {
//       rules.min = {
//         value: Number(field.min),
//         message: `حداقل مقدار ${field.min} است`
//       };
//     }
//
//     if (field.max && ['number', 'range'].includes(field.type)) {
//       rules.max = {
//         value: Number(field.max),
//         message: `حداکثر مقدار ${field.max} است`
//       };
//     }
//
//     if (field.minItems && field.type === 'array') {
//       rules.validate = {
//         minItems: value => {
//           const arrayValue = Array.isArray(value) ? value : [];
//           // Filter out empty values for validation
//           const nonEmptyItems = arrayValue.filter(item => item !== null && item !== undefined && item !== '');
//           return nonEmptyItems.length >= field.minItems || `حداقل ${field.minItems} مورد الزامی است`;
//         }
//       };
//     }
//
//     if (field.pattern) {
//       try {
//         rules.pattern = {
//           value: new RegExp(field.pattern),
//           message: "فرمت وارد شده صحیح نیست"
//         };
//       } catch (error) {
//         console.error('Invalid regex pattern:', error);
//       }
//     }
//
//     // Add specific validation for file fields
//     if (field.type === 'file') {
//       if (field.maxFiles > 1) {
//         rules.validate = {
//           ...rules.validate,
//           maxFiles: value => {
//             if (!value || !Array.isArray(value)) return true;
//             return value.length <= field.maxFiles || `حداکثر ${field.maxFiles} فایل مجاز است`;
//           }
//         };
//       }
//     }
//
//     return rules;
//   };
//
//   // Render field based on type
//   const renderField = (field) => {
//     const fieldProps = {
//       fullWidth: true,
//       margin: "normal",
//       label: field.label || field.name,
//       placeholder: field.placeholder || '',
//       helperText: errors[field.name]?.message || field.description || '',
//       error: !!errors[field.name],
//       disabled: isSubmitting,
//       size: "medium"
//     };
//
//     const validationRules = getValidationRules(field);
//
//     switch (field.type) {
//       case 'text':
//       case 'password':
//       case 'email':
//       case 'url':
//       case 'tel':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
//
//       case 'textarea':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 multiline
//                 rows={4}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
//
//       case 'number':
//       case 'range':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type="number"
//                 onChange={(e) => {
//                   const val = e.target.value === '' ? '' : Number(e.target.value);
//                   onChange(val);
//                 }}
//                 onBlur={onBlur}
//                 value={value ?? ""}
//                 inputRef={ref}
//                 InputProps={{
//                   inputProps: {
//                     min: field.min,
//                     max: field.max,
//                     step: field.step || 1
//                   }
//                 }}
//               />
//             )}
//           />
//         );
//
//       case 'array':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ['']}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => {
//               // Ensure value is always an array with at least one item
//               const arrayValues = Array.isArray(value) && value.length > 0 ? value : [''];
//
//               return (
//                 <FormControl
//                   fullWidth
//                   margin="normal"
//                   error={!!errors[field.name]}
//                 >
//                   <Typography variant="subtitle2" gutterBottom>
//                     {field.label || field.name}
//                     {field.required && <span style={{ color: 'red' }}> *</span>}
//                   </Typography>
//
//                   {arrayValues.map((item, index) => (
//                     <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
//                       <TextField
//                         fullWidth
//                         size="medium"
//                         value={item || ''}
//                         onChange={(e) => {
//                           const newValues = [...arrayValues];
//                           newValues[index] = e.target.value;
//                           onChange(newValues);
//                         }}
//                         onBlur={onBlur}
//                         placeholder={`${field.placeholder || ''} ${index + 1}`}
//                         error={!!errors[field.name]}
//                       />
//
//                       <IconButton
//                         color="error"
//                         size="small"
//                         onClick={() => {
//                           // Remove this item if there's more than one
//                           if (arrayValues.length > 1) {
//                             const newValues = arrayValues.filter((_, i) => i !== index);
//                             onChange(newValues);
//                           } else {
//                             // If it's the last one, just clear it
//                             const newValues = [''];
//                             onChange(newValues);
//                           }
//                         }}
//                         sx={{ ml: 1 }}
//                         disabled={arrayValues.length === 1 && !arrayValues[0]}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//
//                       {index === arrayValues.length - 1 && (
//                         <IconButton
//                           color="primary"
//                           size="small"
//                           onClick={() => {
//                             const newValues = [...arrayValues, ''];
//                             onChange(newValues);
//                           }}
//                           sx={{ ml: 1 }}
//                         >
//                           <AddCircleIcon />
//                         </IconButton>
//                       )}
//                     </Box>
//                   ))}
//
//                   {(errors[field.name]?.message || field.description) && (
//                     <FormHelperText error={!!errors[field.name]}>
//                       {errors[field.name]?.message || field.description}
//                     </FormHelperText>
//                   )}
//                 </FormControl>
//               );
//             }}
//           />
//         );
//
//       case 'select':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl
//                 fullWidth
//                 margin="normal"
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
//
//       case 'multiselect':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || []}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value = [], ref } }) => (
//               <FormControl
//                 fullWidth
//                 margin="normal"
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   multiple
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || []}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
//
//       case 'checkbox':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || false}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl
//                 fullWidth
//                 margin="normal"
//                 error={!!errors[field.name]}
//               >
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={!!value}
//                       onChange={onChange}
//                       onBlur={onBlur}
//                       inputRef={ref}
//                       disabled={isSubmitting}
//                     />
//                   }
//                   label={field.label || field.name}
//                 />
//                 {errors[field.name]?.message && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
//
//       case 'radio':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl
//                 component="fieldset"
//                 margin="normal"
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//                 fullWidth
//               >
//                 <FormLabel component="legend">{field.label || field.name}</FormLabel>
//                 <RadioGroup
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   ref={ref}
//                 >
//                   {(field.options || []).map((option) => (
//                     <FormControlLabel
//                       key={option}
//                       value={option}
//                       control={<Radio />}
//                       label={option}
//                     />
//                   ))}
//                 </RadioGroup>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
//
//       case 'date':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             rules={validationRules}
//             render={({ field: { onChange, value } }) => (
//               <FormControl
//                 fullWidth
//                 margin="normal"
//                 error={!!errors[field.name]}
//               >
//                 <DatePicker
//                   label={field.label || field.name}
//                   value={value}
//                   onChange={onChange}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       fullWidth
//                       error={!!errors[field.name]}
//                       helperText={errors[field.name]?.message || field.description || ''}
//                     />
//                   )}
//                 />
//                 {errors[field.name] && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
//
//       case 'datetime-local':
//       case 'time':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//                 InputLabelProps={{ shrink: true }}
//               />
//             )}
//           />
//         );
//
//       case 'file':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.maxFiles > 1 ? [] : ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FileUpload
//                 value={value}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 error={!!errors[field.name]}
//                 helperText={errors[field.name]?.message || field.description}
//                 multiple={field.maxFiles > 1}
//                 accept={field.accept || "*"}
//                 maxSize={field.maxSize || 5 * 1024 * 1024}
//                 maxFiles={field.maxFiles || 1}
//                 label={field.label || field.name}
//                 fileServiceType={field.fileServiceType || "SERVICE_FILE"}
//                 disabled={isSubmitting}
//               />
//             )}
//           />
//         );
//
//       default:
//         return null;
//     }
//   };
//
//   return (
//     <Paper
//       className="p-6 relative"
//       elevation={0}
//       sx={{
//         maxWidth: '100%',
//         margin: '0 auto',
//         backgroundColor: '#fafafa',
//         position: 'relative'
//       }}
//     >
//       {/* Success animation */}
//       <Fade in={showSuccess}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: 'rgba(255, 255, 255, 0.8)',
//             zIndex: 10,
//             backdropFilter: 'blur(2px)'
//           }}
//         >
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.5, type: 'spring' }}
//           >
//             <CheckCircleIcon
//               color="success"
//               sx={{ fontSize: 80, mb: 2 }}
//             />
//           </motion.div>
//           <Typography variant="h5" color="success.main" gutterBottom>
//             فرم با موفقیت ارسال شد
//           </Typography>
//         </Box>
//       </Fade>
//
//       {formTitle && (
//         <Typography variant="h6" gutterBottom>
//           {formTitle}
//         </Typography>
//       )}
//
//       {formDescription && (
//         <Typography
//           variant="body2"
//           color="textSecondary"
//           paragraph
//           sx={{ mb: 3 }}
//         >
//           {formDescription}
//         </Typography>
//       )}
//
//       {(formTitle || formDescription) && (
//         <Divider sx={{ mb: 3 }} />
//       )}
//
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Grid container spacing={2}>
//           {fields.map(field => (
//             <Grid item xs={12} sm={field.column === 6 ? 6 : 12} key={field.id}>
//               {renderField(field)}
//             </Grid>
//           ))}
//         </Grid>
//
//         {!hideSubmitButton && (
//           <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               disabled={isSubmitting}
//             >
//               پاک کردن فرم
//             </Button>
//
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               disabled={isSubmitting}
//               startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//             >
//               {isSubmitting ? 'در حال ارسال...' : submitButtonLabel}
//             </Button>
//           </Box>
//         )}
//       </form>
//
//       {/* Show submitted data for debugging */}
//       {submittedData && !showSuccess && !hideSubmitButton && (
//         <Collapse in={!!submittedData}>
//           <Paper
//             elevation={2}
//             sx={{ mt: 4, p: 2, backgroundColor: '#f0f8ff' }}
//           >
//             <Typography variant="subtitle1" gutterBottom>
//               داده‌های ارسال شده:
//             </Typography>
//             <pre
//               style={{
//                 direction: 'ltr',
//                 textAlign: 'left',
//                 overflow: 'auto',
//                 maxHeight: '300px',
//                 padding: '12px',
//                 backgroundColor: '#f5f5f5',
//                 borderRadius: '4px',
//                 fontSize: '0.875rem'
//               }}
//             >
//               {JSON.stringify(submittedData, null, 2)}
//             </pre>
//           </Paper>
//         </Collapse>
//       )}
//     </Paper>
//   );
// }
//
// export default FormPreview;
///////////////////////**************BEST*****************///////////////////
//End



// import { useState, useEffect, useRef } from 'react';
// import { 
//   Paper, 
//   Typography, 
//   Box, 
//   Button, 
//   TextField, 
//   FormControl, 
//   InputLabel, 
//   Select, 
//   MenuItem, 
//   FormControlLabel, 
//   Checkbox, 
//   FormHelperText,
//   Radio,
//   RadioGroup,
//   FormLabel,
//   Divider,
//   Grid,
//   CircularProgress,
//   Collapse,
//   Fade,
//   IconButton
// } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import AddCircleIcon from '@mui/icons-material/AddCircle';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { motion } from 'framer-motion';
// import { useForm, Controller } from 'react-hook-form';

// // Import the FileUpload component
// import FileUpload from './FileUpload';

// function FormPreview({ 
//   fields = [], 
//   formTitle = 'فرم پیش‌نمایش', 
//   formDescription = '',
//   initialData = {},
//   onDataChange = () => {},
//   submitButtonLabel = 'ارسال فرم',
//   hideSubmitButton = false
// }) {
//   const [submittedData, setSubmittedData] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
  
//   // Use ref to track if the component is mounted to prevent unnecessary updates
//   const isMounted = useRef(true);
//   // Use ref to track if we're currently sending updates to parent to avoid loops
//   const isUpdatingParent = useRef(false);
//   // Use refs for the processed initial data and date fields
//   const dateFieldsRef = useRef(new Set());
//   // Set to keep track of file fields
//   const fileFieldsRef = useRef(new Set());
  
//   // Process initial data to identify date and file fields, and prepare Form values
//   const processedInitialData = (() => {
//     if (!initialData || Object.keys(initialData).length === 0) {
//       return {};
//     }
    
//     const processed = { ...initialData };
    
//     // Find date fields and convert string dates to Date objects
//     // Also identify file fields for special handling
//     fields.forEach(field => {
//       if (field.type === 'date') {
//         // Mark this as a date field for future processing
//         dateFieldsRef.current.add(field.name);
        
//         if (initialData[field.name]) {
//           try {
//             const dateValue = initialData[field.name];
//             if (typeof dateValue === 'string') {
//               processed[field.name] = new Date(dateValue);
//             }
//           } catch (error) {
//             console.error(`Error parsing date for field ${field.name}:`, error);
//           }
//         }
//       } else if (field.type === 'file') {
//         // Mark this as a file field for future processing
//         fileFieldsRef.current.add(field.name);
        
//         // Make sure file paths are preserved in edit mode
//         if (initialData[field.name]) {
//           const fileValue = initialData[field.name];
//           // Keep file paths as is (don't try to format them as objects yet)
//           // FileUpload component will handle the conversion
//           processed[field.name] = fileValue;
//         }
//       }
//     });
    
//     return processed;
//   })();
  
//   // Create react-hook-form
//   const { 
//     control, 
//     handleSubmit, 
//     formState: { errors },
//     reset,
//     watch
//   } = useForm({
//     mode: 'onBlur',
//     defaultValues: processedInitialData
//   });
  
//   // Reset form when needed, with proper initial data
//   useEffect(() => {
//     if (Object.keys(processedInitialData).length > 0) {
//       reset(processedInitialData);
//     }
    
//     // Cleanup function
//     return () => {
//       isMounted.current = false;
//     };
//   }, [reset, processedInitialData]);
  
//   // Watch all fields to notify parent component of changes
//   const formValues = watch();
  
//   // Handle notifying parent of changes without causing infinite loops
//   useEffect(() => {
//     // Skip if already updating parent or if no values
//     if (isUpdatingParent.current || !Object.keys(formValues).length) {
//       return;
//     }
    
//     // Set flag to prevent loops
//     isUpdatingParent.current = true;
    
//     // Process date fields for API
//     const processedValues = { ...formValues };
    
//     // Only process date fields that are actual Date objects
//     Array.from(dateFieldsRef.current).forEach(fieldName => {
//       if (formValues[fieldName] instanceof Date) {
//         try {
//           const date = formValues[fieldName];
//           const year = date.getFullYear();
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const day = String(date.getDate()).padStart(2, '0');
//           processedValues[fieldName] = `${year}-${month}-${day}`;
//         } catch (error) {
//           console.error(`Error formatting date for field ${fieldName}:`, error);
//         }
//       }
//     });
    
//     // Notify parent with processed values
//     onDataChange(processedValues);
    
//     // Reset the flag after a short delay
//     setTimeout(() => {
//       isUpdatingParent.current = false;
//     }, 0);
//   }, [formValues, onDataChange]);
  
//   // Submit handler
//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
    
//     // Format dates for submission
//     const processedData = { ...data };
    
//     // Process date fields
//     Array.from(dateFieldsRef.current).forEach(fieldName => {
//       if (data[fieldName] instanceof Date) {
//         try {
//           const date = data[fieldName];
//           const year = date.getFullYear();
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const day = String(date.getDate()).padStart(2, '0');
//           processedData[fieldName] = `${year}-${month}-${day}`;
//         } catch (error) {
//           console.error(`Error formatting date for field ${fieldName}:`, error);
//         }
//       }
//     });
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // Only proceed if still mounted
//     if (isMounted.current) {
//       setSubmittedData(processedData);
//       setIsSubmitting(false);
//       setShowSuccess(true);
      
//       // Hide success message after 3 seconds
//       setTimeout(() => {
//         if (isMounted.current) {
//           setShowSuccess(false);
//         }
//       }, 3000);
//     }
//   };
  
//   // Reset form
//   const handleReset = () => {
//     reset(processedInitialData);
//     setSubmittedData(null);
//   };
  
//   // Create validation rules from field configuration
//   const getValidationRules = (field) => {
//     const rules = {};
    
//     if (field.required) {
//       rules.required = "این فیلد الزامی است";
//     }
    
//     if (field.type === 'email') {
//       rules.pattern = {
//         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//         message: "ایمیل معتبر وارد کنید"
//       };
//     }
    
//     if (field.minLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.minLength = {
//         value: Number(field.minLength),
//         message: `حداقل ${field.minLength} کاراکتر وارد کنید`
//       };
//     }
    
//     if (field.maxLength && ['text', 'password', 'textarea', 'email', 'url', 'tel'].includes(field.type)) {
//       rules.maxLength = {
//         value: Number(field.maxLength),
//         message: `حداکثر ${field.maxLength} کاراکتر مجاز است`
//       };
//     }
    
//     if (field.min && ['number', 'range'].includes(field.type)) {
//       rules.min = {
//         value: Number(field.min),
//         message: `حداقل مقدار ${field.min} است`
//       };
//     }
    
//     if (field.max && ['number', 'range'].includes(field.type)) {
//       rules.max = {
//         value: Number(field.max),
//         message: `حداکثر مقدار ${field.max} است`
//       };
//     }
    
//     if (field.minItems && field.type === 'array') {
//       rules.validate = {
//         minItems: value => {
//           const arrayValue = Array.isArray(value) ? value : [];
//           // Filter out empty values for validation
//           const nonEmptyItems = arrayValue.filter(item => item !== null && item !== undefined && item !== '');
//           return nonEmptyItems.length >= field.minItems || `حداقل ${field.minItems} مورد الزامی است`;
//         }
//       };
//     }
    
//     if (field.pattern) {
//       try {
//         rules.pattern = {
//           value: new RegExp(field.pattern),
//           message: "فرمت وارد شده صحیح نیست"
//         };
//       } catch (error) {
//         console.error('Invalid regex pattern:', error);
//       }
//     }
    
//     // Add specific validation for file fields
//     if (field.type === 'file') {
//       if (field.maxFiles > 1) {
//         rules.validate = {
//           ...rules.validate,
//           maxFiles: value => {
//             if (!value || !Array.isArray(value)) return true;
//             return value.length <= field.maxFiles || `حداکثر ${field.maxFiles} فایل مجاز است`;
//           }
//         };
//       }
//     }
    
//     return rules;
//   };
  
//   // Find a field configuration by name
//   const findFieldByName = (name) => {
//     return fields.find(field => field.name === name);
//   };
  
//   // Render field based on type
//   const renderField = (field) => {
//     const fieldProps = {
//       fullWidth: true,
//       margin: "normal",
//       label: field.label || field.name,
//       placeholder: field.placeholder || '',
//       helperText: errors[field.name]?.message || field.description || '',
//       error: !!errors[field.name],
//       disabled: isSubmitting,
//       size: "medium"
//     };
    
//     const validationRules = getValidationRules(field);
    
//     switch (field.type) {
//       case 'text':
//       case 'password':
//       case 'email':
//       case 'url':
//       case 'tel':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'textarea':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 multiline
//                 rows={4}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//               />
//             )}
//           />
//         );
        
//       case 'number':
//       case 'range':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type="number"
//                 onChange={(e) => {
//                   const val = e.target.value === '' ? '' : Number(e.target.value);
//                   onChange(val);
//                 }}
//                 onBlur={onBlur}
//                 value={value ?? ""}
//                 inputRef={ref}
//                 InputProps={{
//                   inputProps: {
//                     min: field.min,
//                     max: field.max,
//                     step: field.step || 1
//                   }
//                 }}
//               />
//             )}
//           />
//         );
        
//       case 'array':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ['']}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => {
//               // Ensure value is always an array with at least one item
//               const arrayValues = Array.isArray(value) && value.length > 0 ? value : [''];
              
//               return (
//                 <FormControl
//                   fullWidth
//                   margin="normal"
//                   error={!!errors[field.name]}
//                 >
//                   <Typography variant="subtitle2" gutterBottom>
//                     {field.label || field.name}
//                     {field.required && <span style={{ color: 'red' }}> *</span>}
//                   </Typography>
                  
//                   {arrayValues.map((item, index) => (
//                     <Box key={index} sx={{ display: 'flex', mb: 1, alignItems: 'center' }}>
//                       <TextField
//                         fullWidth
//                         size="medium"
//                         value={item || ''}
//                         onChange={(e) => {
//                           const newValues = [...arrayValues];
//                           newValues[index] = e.target.value;
//                           onChange(newValues);
//                         }}
//                         onBlur={onBlur}
//                         placeholder={`${field.placeholder || ''} ${index + 1}`}
//                         error={!!errors[field.name]}
//                       />
                      
//                       <IconButton
//                         color="error"
//                         size="small"
//                         onClick={() => {
//                           // Remove this item if there's more than one
//                           if (arrayValues.length > 1) {
//                             const newValues = arrayValues.filter((_, i) => i !== index);
//                             onChange(newValues);
//                           } else {
//                             // If it's the last one, just clear it
//                             const newValues = [''];
//                             onChange(newValues);
//                           }
//                         }}
//                         sx={{ ml: 1 }}
//                         disabled={arrayValues.length === 1 && !arrayValues[0]}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
                      
//                       {index === arrayValues.length - 1 && (
//                         <IconButton
//                           color="primary"
//                           size="small"
//                           onClick={() => {
//                             const newValues = [...arrayValues, ''];
//                             onChange(newValues);
//                           }}
//                           sx={{ ml: 1 }}
//                         >
//                           <AddCircleIcon />
//                         </IconButton>
//                       )}
//                     </Box>
//                   ))}
                  
//                   {(errors[field.name]?.message || field.description) && (
//                     <FormHelperText error={!!errors[field.name]}>
//                       {errors[field.name]?.message || field.description}
//                     </FormHelperText>
//                   )}
//                 </FormControl>
//               );
//             }}
//           />
//         );        
        
//       case 'select':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'multiselect':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || []}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value = [], ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//               >
//                 <InputLabel>{field.label || field.name}</InputLabel>
//                 <Select
//                   multiple
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || []}
//                   inputRef={ref}
//                   label={field.label || field.name}
//                 >
//                   {(field.options || []).map((option) => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'checkbox':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || false}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 fullWidth 
//                 margin="normal" 
//                 error={!!errors[field.name]}
//               >
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={!!value}
//                       onChange={onChange}
//                       onBlur={onBlur}
//                       inputRef={ref}
//                       disabled={isSubmitting}
//                     />
//                   }
//                   label={field.label || field.name}
//                 />
//                 {errors[field.name]?.message && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'radio':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FormControl 
//                 component="fieldset" 
//                 margin="normal"
//                 error={!!errors[field.name]}
//                 disabled={isSubmitting}
//                 fullWidth
//               >
//                 <FormLabel component="legend">{field.label || field.name}</FormLabel>
//                 <RadioGroup
//                   onChange={onChange}
//                   onBlur={onBlur}
//                   value={value || ""}
//                   ref={ref}
//                 >
//                   {(field.options || []).map((option) => (
//                     <FormControlLabel
//                       key={option}
//                       value={option}
//                       control={<Radio />}
//                       label={option}
//                     />
//                   ))}
//                 </RadioGroup>
//                 {(errors[field.name]?.message || field.description) && (
//                   <FormHelperText error={!!errors[field.name]}>
//                     {errors[field.name]?.message || field.description}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'date':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             rules={validationRules}
//             render={({ field: { onChange, value } }) => (
//               <FormControl
//                 fullWidth
//                 margin="normal"
//                 error={!!errors[field.name]}
//               >
//                 <DatePicker
//                   label={field.label || field.name}
//                   value={value}
//                   onChange={onChange}
//                   renderInput={(params) => (
//                     <TextField
//                       {...params}
//                       fullWidth
//                       error={!!errors[field.name]}
//                       helperText={errors[field.name]?.message || field.description || ''}
//                     />
//                   )}
//                 />
//                 {errors[field.name] && (
//                   <FormHelperText error>
//                     {errors[field.name].message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             )}
//           />
//         );
        
//       case 'datetime-local':
//       case 'time':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             defaultValue={field.defaultValue || ""}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <TextField
//                 {...fieldProps}
//                 type={field.type}
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 value={value || ""}
//                 inputRef={ref}
//                 InputLabelProps={{ shrink: true }}
//               />
//             )}
//           />
//         );
        
//       case 'file':
//         return (
//           <Controller
//             key={field.id}
//             name={field.name}
//             control={control}
//             rules={validationRules}
//             render={({ field: { onChange, onBlur, value, ref } }) => (
//               <FileUpload
//                 value={value} // Pass the value directly as received from the form
//                 onChange={onChange}
//                 onBlur={onBlur}
//                 error={!!errors[field.name]}
//                 helperText={errors[field.name]?.message || field.description}
//                 multiple={field.maxFiles > 1}
//                 accept={field.accept || "*"}
//                 maxSize={field.maxSize || 5 * 1024 * 1024}
//                 maxFiles={field.maxFiles || 1}
//                 label={field.label || field.name}
//                 fileServiceType={field.fileServiceType || "SERVICE_FILE"}
//                 disabled={isSubmitting}
//               />
//             )}
//           />
//         );
        
//       default:
//         return null;
//     }
//   };

//   return (
//     <Paper 
//       className="p-6 relative" 
//       elevation={0} 
//       sx={{ 
//         maxWidth: '100%', 
//         margin: '0 auto', 
//         backgroundColor: '#fafafa',
//         position: 'relative' 
//       }}
//     >
//       {/* Success animation */}
//       <Fade in={showSuccess}>
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: 'rgba(255, 255, 255, 0.8)',
//             zIndex: 10,
//             backdropFilter: 'blur(2px)'
//           }}
//         >
//           <motion.div
//             initial={{ scale: 0.5, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.5, type: 'spring' }}
//           >
//             <CheckCircleIcon 
//               color="success" 
//               sx={{ fontSize: 80, mb: 2 }} 
//             />
//           </motion.div>
//           <Typography variant="h5" color="success.main" gutterBottom>
//             فرم با موفقیت ارسال شد
//           </Typography>
//         </Box>
//       </Fade>
      
//       {formTitle && (
//         <Typography variant="h6" gutterBottom>
//           {formTitle}
//         </Typography>
//       )}
      
//       {formDescription && (
//         <Typography 
//           variant="body2" 
//           color="textSecondary" 
//           paragraph
//           sx={{ mb: 3 }}
//         >
//           {formDescription}
//         </Typography>
//       )}
      
//       {(formTitle || formDescription) && (
//         <Divider sx={{ mb: 3 }} />
//       )}
      
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Grid container spacing={2}>
//           {fields.map(field => (
//             <Grid item xs={12} sm={field.column === 6 ? 6 : 12} key={field.id}>
//               {renderField(field)}
//             </Grid>
//           ))}
//         </Grid>
        
//         {!hideSubmitButton && (
//           <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               disabled={isSubmitting}
//             >
//               پاک کردن فرم
//             </Button>
            
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               disabled={isSubmitting}
//               startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
//             >
//               {isSubmitting ? 'در حال ارسال...' : submitButtonLabel}
//             </Button>
//           </Box>
//         )}
//       </form>
      
//       {/* Show submitted data for debugging */}
//       {submittedData && !showSuccess && !hideSubmitButton && (
//         <Collapse in={!!submittedData}>
//           <Paper 
//             elevation={2} 
//             sx={{ mt: 4, p: 2, backgroundColor: '#f0f8ff' }}
//           >
//             <Typography variant="subtitle1" gutterBottom>
//               داده‌های ارسال شده:
//             </Typography>
//             <pre
//               style={{
//                 direction: 'ltr',
//                 textAlign: 'left',
//                 overflow: 'auto',
//                 maxHeight: '300px',
//                 padding: '12px',
//                 backgroundColor: '#f5f5f5',
//                 borderRadius: '4px',
//                 fontSize: '0.875rem'
//               }}
//             >
//               {JSON.stringify(submittedData, null, 2)}
//             </pre>
//           </Paper>
//         </Collapse>
//       )}
//     </Paper>
//   );
// }

// export default FormPreview;