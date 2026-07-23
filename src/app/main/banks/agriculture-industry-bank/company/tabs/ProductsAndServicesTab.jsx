// import { useFormContext } from 'react-hook-form';
// // import DynamicFormGenerator from 'app/shared-components/dynamic-field-generator/DynamicFormGenerator.jsx';
// import ImageField from 'app/shared-components/dynamic-field-generator/ImageField.jsx';
// import DynamicFormGenerator from 'app/shared-components/dynamic-field-generator/DynamicFormGenerator.jsx';
//
// /**
//  * The products and services tab.
//  */
//
// const productsSchema = {
// 	title: 'محصولات و خدمات',
// 	type: 'object',
// 	properties: {
// 		products: {
// 			type: 'array',
// 			title: 'محصولات و خدمات',
// 			items: {
// 				type: 'object',
// 				properties: {
// 					name: {
// 						type: 'string',
// 						title: 'نام محصول'
// 					},
// 					description: {
// 						type: 'string',
// 						title: 'توضیحات محصول'
// 					},
// 					// otherTypeName: {
// 					// 	type: 'string',
// 					// 	title: 'Other Type Name',
// 					// 	description: 'If categoryType is something custom, store it here'
// 					// },
// 					categoryType: {
// 						type: 'string',
// 						title: 'دسته‌بندی محصول'
// 					},
// 					showProduct: {
// 						type: 'boolean',
// 						title: 'نمایش در صفحه اختصاصی؟'
// 					},
// 					pictures: {
// 						type: 'array',
// 						title: 'تصاویر',
// 						items: {
// 							type: 'object',
// 							properties: {
// 								url: {
// 									type: 'string',
// 									uniforms: { component: ImageField },
// 									title: 'آدرس عکس آپلود شده'
// 								},
// 								description: { type: 'string', title: 'توضیحات عکس' }
// 							}
// 						}
// 					}
// 				},
// 				required: ['name', 'categoryType']
// 			}
// 		}
// 	}
// };
// // 	{
// // 	title: 'محصولات و خدمات',
// // 	type: 'object',
// // 	properties: {
// // 		products: {
// // 			type: 'array',
// // 			title: 'محصولات و خدمات',
// // 			items: {
// // 				type: 'object',
// // 				properties: {
// // 					name: {
// // 						type: 'string',
// // 						title: 'نام محصول'
// // 					},
// // 					description: {
// // 						type: 'string',
// // 						title: 'توضیحات محصول'
// // 					},
// // 					categoryType: {
// // 						type: 'string',
// // 						title: 'دسته‌بندی محصول'
// // 					},
// // 					showProduct: {
// // 						type: 'boolean',
// // 						title: 'نمایش در صفحه اختصاصی؟'
// // 					},
// // 					pictures: {
// // 						type: 'array',
// // 						title: 'تصاویر',
// // 						items: {
// // 							type: 'object',
// // 							properties: {
// // 								url: {
// // 									type: 'string',
// // 									uniforms: { component: ImageField },
// // 									title: 'آدرس عکس آپلود شده'
// // 								},
// // 								description: { type: 'string', title: 'توضیحات عکس' }
// // 							}
// // 						}
// // 					}
// // 				},
// // 				required: ['name', 'categoryType']
// // 			}
// // 		}
// // 	}
// // };
//
// function ProductsAndServicesTab() {
// 	const methods = useFormContext();
// 	const handleSubmit = async (formData) => {
// 		alert('Product saved!');
// 		console.log(JSON.stringify(formData));
// 	};
// 	const { control } = methods;
// 	return (
// 		// 	<Controller
// 		// 		name="priceTaxExcl"
// 		// 		control={control}
// 		// 		render={({ field }) => (
// 		// 			<TextField
// 		// 				{...field}
// 		// 				className="mt-8 mb-16"
// 		// 				label="Tax Excluded Price"
// 		// 				id="priceTaxExcl"
// 		// 				InputProps={{
// 		// 					startAdornment: <InputAdornment position="start">$</InputAdornment>
// 		// 				}}
// 		// 				type="number"
// 		// 				variant="outlined"
// 		// 				autoFocus
// 		// 				fullWidth
// 		// 			/>
// 		// 		)}
// 		// 	/>
// 		// 	<Controller
// 		// 		name="priceTaxIncl"
// 		// 		control={control}
// 		// 		render={({ field }) => (
// 		// 			<TextField
// 		// 				{...field}
// 		// 				className="mt-8 mb-16"
// 		// 				label="Tax Included Price"
// 		// 				id="priceTaxIncl"
// 		// 				InputProps={{
// 		// 					startAdornment: <InputAdornment position="start">$</InputAdornment>
// 		// 				}}
// 		// 				type="number"
// 		// 				variant="outlined"
// 		// 				fullWidth
// 		// 			/>
// 		// 		)}
// 		// 	/>
// 		// 	<Controller
// 		// 		name="taxRate"
// 		// 		control={control}
// 		// 		render={({ field }) => (
// 		// 			<TextField
// 		// 				{...field}
// 		// 				className="mt-8 mb-16"
// 		// 				label="Tax Rate"
// 		// 				id="taxRate"
// 		// 				InputProps={{
// 		// 					startAdornment: <InputAdornment position="start">$</InputAdornment>
// 		// 				}}
// 		// 				type="number"
// 		// 				variant="outlined"
// 		// 				fullWidth
// 		// 			/>
// 		// 		)}
// 		// 	/>
// 		// 	<Controller
// 		// 		name="comparedPrice"
// 		// 		control={control}
// 		// 		render={({ field }) => (
// 		// 			<TextField
// 		// 				{...field}
// 		// 				className="mt-8 mb-16"
// 		// 				label="Compared Price"
// 		// 				id="comparedPrice"
// 		// 				InputProps={{
// 		// 					startAdornment: <InputAdornment position="start">$</InputAdornment>
// 		// 				}}
// 		// 				type="number"
// 		// 				variant="outlined"
// 		// 				fullWidth
// 		// 				helperText="Add a compare price to show next to the real price"
// 		// 			/>
// 		// 		)}
// 		// 	/>
//
// 		<div>
// 			<DynamicFormGenerator
// 				formHeaderTitle="فرم محصولات و خدمات شرکت"
// 				initialData={[]}
// 				onSubmit={handleSubmit}
// 				schema={productsSchema}
// 				formGenerationType="AUTO"
// 				formValidationStruct="JSON_SCHEMA"
// 			/>
// 		</div>
// 	);
// }
//
// export default ProductsAndServicesTab;

// import { useFormContext, useFieldArray } from 'react-hook-form';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import ImageField from 'app/shared-components/dynamic-field-generator/ImageField.jsx';
// import { Typography } from '@mui/material';
//
// // Custom component to render the pictures field array for a single product
// function PicturesFieldArray({ productIndex }) {
// 	const {
// 		control,
// 		register,
// 		formState: { errors }
// 	} = useFormContext();
// 	const { fields, append, remove } = useFieldArray({
// 		control,
// 		name: `products.${productIndex}.pictures`
// 	});
//
// 	return (
// 		<div style={{ marginTop: '16px', marginBottom: '16px' }}>
// 			<h4>تصاویر محصول</h4>
// 			{fields.map((field, picIndex) => (
// 				<div
// 					key={field.id}
// 					style={{ border: '1px dashed #999', padding: '8px', marginBottom: '8px' }}
// 				>
// 					<TextField
// 						label="آدرس عکس آپلود شده"
// 						{...register(`products.${productIndex}.pictures.${picIndex}.url`)}
// 						error={!!errors.products?.[productIndex]?.pictures?.[picIndex]?.url}
// 						helperText={errors.products?.[productIndex]?.pictures?.[picIndex]?.url?.message}
// 						fullWidth
// 						margin="normal"
// 					/>
// 					<TextField
// 						label="توضیحات عکس"
// 						{...register(`products.${productIndex}.pictures.${picIndex}.description`)}
// 						fullWidth
// 						margin="normal"
// 					/>
// 					<Button
// 						variant="outlined"
// 						color="secondary"
// 						onClick={() => remove(picIndex)}
// 					>
// 						حذف تصویر
// 					</Button>
// 				</div>
// 			))}
// 			<Button
// 				variant="contained"
// 				onClick={() => append({ url: '', description: '' })}
// 			>
// 				افزودن تصویر
// 			</Button>
// 		</div>
// 	);
// }
//
// // Custom component to render an individual product (with its nested pictures)
// function ProductFields({ index, remove }) {
// 	const {
// 		register,
// 		formState: { errors }
// 	} = useFormContext();
//
// 	return (
// 		<div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px' }}>
// 			<h3>محصول {index + 1}</h3>
// 			<TextField
// 				label="نام محصول"
// 				{...register(`products.${index}.name`)}
// 				error={!!errors.products?.[index]?.name}
// 				helperText={errors.products?.[index]?.name?.message}
// 				fullWidth
// 				margin="normal"
// 			/>
// 			<TextField
// 				label="توضیحات محصول"
// 				{...register(`products.${index}.description`)}
// 				fullWidth
// 				margin="normal"
// 			/>
// 			<TextField
// 				label="دسته‌بندی محصول"
// 				{...register(`products.${index}.categoryType`)}
// 				error={!!errors.products?.[index]?.categoryType}
// 				helperText={errors.products?.[index]?.categoryType?.message}
// 				fullWidth
// 				margin="normal"
// 			/>
// 			<FormControlLabel
// 				control={<Checkbox {...register(`products.${index}.showProduct`)} />}
// 				label="نمایش در صفحه اختصاصی؟"
// 			/>
// 			{/* Nested pictures field array */}
// 			<PicturesFieldArray productIndex={index} />
// 			<Button
// 				variant="contained"
// 				color="secondary"
// 				onClick={() => remove(index)}
// 			>
// 				حذف محصول
// 			</Button>
// 		</div>
// 	);
// }
//
// // Custom component to render the products field array
// function ProductsFieldArray() {
// 	const { control } = useFormContext();
// 	const { fields, append, remove } = useFieldArray({
// 		control,
// 		name: 'products'
// 	});
//
// 	return (
// 		<div>
// 			{fields.map((field, index) => (
// 				<ProductFields
// 					key={field.id}
// 					index={index}
// 					remove={remove}
// 				/>
// 			))}
// 			<Button
// 				variant="contained"
// 				onClick={() =>
// 					append({ name: '', description: '', categoryType: '', showProduct: false, pictures: [] })
// 				}
// 			>
// 				افزودن محصول
// 			</Button>
// 		</div>
// 	);
// }
//
// // The JSON schema for the products and services tab
// const productsSchema = {
// 	title: 'محصولات و خدمات',
// 	type: 'object',
// 	properties: {
// 		products: {
// 			type: 'array',
// 			title: 'محصولات و خدمات',
// 			items: {
// 				type: 'object',
// 				properties: {
// 					name: {
// 						type: 'string',
// 						title: 'نام محصول'
// 					},
// 					description: {
// 						type: 'string',
// 						title: 'توضیحات محصول'
// 					},
// 					categoryType: {
// 						type: 'string',
// 						title: 'دسته‌بندی محصول'
// 					},
// 					showProduct: {
// 						type: 'boolean',
// 						title: 'نمایش در صفحه اختصاصی؟'
// 					},
// 					pictures: {
// 						type: 'array',
// 						title: 'تصاویر',
// 						items: {
// 							type: 'object',
// 							properties: {
// 								url: {
// 									type: 'string',
// 									uniforms: { component: ImageField },
// 									title: 'آدرس عکس آپلود شده'
// 								},
// 								description: { type: 'string', title: 'توضیحات عکس' }
// 							}
// 						}
// 					}
// 				},
// 				required: ['name', 'categoryType']
// 			},
// 			uniforms: { component: ProductsFieldArray }
// 		}
// 	}
// };
//
// function ProductsAndServicesTab() {
// 	const methods = useFormContext();
// 	const handleSubmit = async (formData) => {
// 		alert('Product saved!');
// 		console.log(JSON.stringify(formData));
// 	};
// 	const { control } = methods;
// 	const { fields, append, remove } = useFieldArray({
// 		control,
// 		name: 'products'
// 	});
//
// 	return (
// 		<div>
// 			<Typography
// 				variant="h5"
// 				color="WindowText"
// 				className="font-bold mb-16"
// 			>
// 				محصولات و خدمات شرکت{' '}
// 			</Typography>
// 			{fields.map((field, index) => (
// 				<ProductFields
// 					key={field.id}
// 					index={index}
// 					remove={remove}
// 				/>
// 			))}
// 			<Button
// 				variant="contained"
// 				onClick={() =>
// 					append({ name: '', description: '', categoryType: '', showProduct: false, pictures: [] })
// 				}
// 			>
// 				ثبت محصول جدید
// 			</Button>
// 		</div>
// 	);
// }
//
// export default ProductsAndServicesTab;

//////////
// import { useState } from 'react';
// import { useFormContext, useFieldArray } from 'react-hook-form';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';
// import Checkbox from '@mui/material/Checkbox';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import ImageField from 'app/shared-components/dynamic-field-generator/ImageField.jsx';
// import { CircularProgress, Typography } from '@mui/material';
// import axios from 'axios';

// // Custom component for file input with preview and upload for a picture
// function PictureFileInput({ fieldName, defaultValue }) {
// 	const { setValue } = useFormContext();
// 	const [preview, setPreview] = useState(defaultValue || null);
// 	const [uploading, setUploading] = useState(false);

// 	const handleFileChange = async (e) => {
// 		const file = e.target.files[0];

// 		if (file) {
// 			// Set a local preview using the file URL
// 			setPreview(URL.createObjectURL(file));
// 			setUploading(true);
// 			// Prepare the file for upload
// 			const formData = new FormData();
// 			formData.append('file', file);
// 			try {
// 				// Post to the backend and get a tempId
// 				const response = await axios.post('/file/temp', formData, {
// 					headers: { 'Content-Type': 'multipart/form-data' }
// 				});
// 				const { tempId } = response.data;
// 				// Set the form field value to the returned tempId
// 				setValue(fieldName, tempId);
// 			} catch (error) {
// 				console.error('Upload failed:', error);
// 			} finally {
// 				setUploading(false);
// 			}
// 		}
// 	};

// 	return (
// 		<div className="flex flex-col items-center">
// 			<label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition duration-300">
// 				<svg
// 					className="w-28 h-28"
// 					fill="currentColor"
// 					viewBox="0 0 20 20"
// 				>
// 					<path d="M16.88 9.94a.66.66 0 00-.44-.24H13V7.42a.66.66 0 00-.66-.66H7.66A.66.66 0 007 7.42v2.28H3.56a.66.66 0 00-.66.66v3.05a2.66 2.66 0 002.66 2.66h8.4a2.66 2.66 0 002.66-2.66v-3.05zM11 12v3H9v-3H6.66l3.34-3.34 3.34 3.34H11z" />
// 				</svg>
// 				<span className="mt-2 text-sm leading-normal">انتخاب تصویر</span>
// 				<input
// 					type="file"
// 					accept="image/*"
// 					className="hidden"
// 					onChange={handleFileChange}
// 				/>
// 			</label>
// 			{uploading && <CircularProgress className="text-center mt-8 mb-10" />}
// 			{!uploading && preview && (
// 				<img
// 					src={preview}
// 					alt="Preview"
// 					className="mt-16 max-w-xs rounded-md shadow-md"
// 				/>
// 			)}
// 		</div>
// 	);
// }

// // Custom component to render the pictures field array for a single product
// function PicturesFieldArray({ productIndex }) {
// 	const {
// 		control,
// 		register,
// 		formState: { errors }
// 	} = useFormContext();
// 	const { fields, append, remove } = useFieldArray({
// 		control,
// 		name: `products.${productIndex}.pictures`
// 	});

// 	return (
// 		<div style={{ marginTop: '16px', marginBottom: '16px' }}>
// 			<h4>تصاویر محصول</h4>
// 			{fields.map((field, picIndex) => (
// 				<div
// 					key={field.id}
// 					style={{ border: '1px dashed #999', padding: '8px', marginBottom: '8px' }}
// 				>
// 					<PictureFileInput fieldName={`products.${productIndex}.pictures.${picIndex}.url`} />
// 					<TextField
// 						label="توضیحات عکس"
// 						{...register(`products.${productIndex}.pictures.${picIndex}.description`)}
// 						fullWidth
// 						margin="normal"
// 					/>
// 					<Button
// 						variant="outlined"
// 						color="secondary"
// 						onClick={() => remove(picIndex)}
// 					>
// 						حذف تصویر
// 					</Button>
// 				</div>
// 			))}
// 			<Button
// 				variant="contained"
// 				onClick={() => append({ url: '', description: '' })}
// 			>
// 				افزودن تصویر
// 			</Button>
// 		</div>
// 	);
// }

// // Custom component to render an individual product (with its nested pictures)
// function ProductFields({ index, remove }) {
// 	const {
// 		register,
// 		formState: { errors }
// 	} = useFormContext();

// 	return (
// 		<div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px' }}>
// 			<h3>محصول {index + 1}</h3>
// 			<TextField
// 				label="نام محصول"
// 				{...register(`products.${index}.name`)}
// 				error={!!errors.products?.[index]?.name}
// 				helperText={errors.products?.[index]?.name?.message}
// 				fullWidth
// 				margin="normal"
// 			/>
// 			<TextField
// 				label="توضیحات محصول"
// 				{...register(`products.${index}.description`)}
// 				fullWidth
// 				margin="normal"
// 			/>
// 			<TextField
// 				label="دسته‌بندی محصول"
// 				{...register(`products.${index}.categoryType`)}
// 				error={!!errors.products?.[index]?.categoryType}
// 				helperText={errors.products?.[index]?.categoryType?.message}
// 				fullWidth
// 				margin="normal"
// 			/>
// 			<FormControlLabel
// 				control={<Checkbox {...register(`products.${index}.showProduct`)} />}
// 				label="نمایش در صفحه اختصاصی؟"
// 			/>
// 			{/* Nested pictures field array */}
// 			<PicturesFieldArray productIndex={index} />
// 			<Button
// 				variant="contained"
// 				color="secondary"
// 				onClick={() => remove(index)}
// 			>
// 				حذف محصول
// 			</Button>
// 		</div>
// 	);
// }

// // Custom component to render the products field array
// function ProductsFieldArray() {
// 	const { control } = useFormContext();
// 	const { fields, append, remove } = useFieldArray({
// 		control,
// 		name: 'products'
// 	});

// 	return (
// 		<div>
// 			{fields.map((field, index) => (
// 				<ProductFields
// 					key={field.id}
// 					index={index}
// 					remove={remove}
// 				/>
// 			))}
// 			<Button
// 				variant="contained"
// 				onClick={() =>
// 					append({
// 						name: '',
// 						description: '',
// 						categoryType: '',
// 						showProduct: false,
// 						pictures: []
// 					})
// 				}
// 			>
// 				افزودن محصول
// 			</Button>
// 		</div>
// 	);
// }

// // The JSON schema for the products and services tab
// const productsSchema = {
// 	title: 'محصولات و خدمات',
// 	type: 'object',
// 	properties: {
// 		products: {
// 			type: 'array',
// 			title: 'محصولات و خدمات',
// 			items: {
// 				type: 'object',
// 				properties: {
// 					name: {
// 						type: 'string',
// 						title: 'نام محصول'
// 					},
// 					description: {
// 						type: 'string',
// 						title: 'توضیحات محصول'
// 					},
// 					categoryType: {
// 						type: 'string',
// 						title: 'دسته‌بندی محصول'
// 					},
// 					showProduct: {
// 						type: 'boolean',
// 						title: 'نمایش در صفحه اختصاصی؟'
// 					},
// 					pictures: {
// 						type: 'array',
// 						title: 'تصاویر',
// 						items: {
// 							type: 'object',
// 							properties: {
// 								url: {
// 									type: 'string',
// 									uniforms: { component: ImageField },
// 									title: 'آدرس عکس آپلود شده'
// 								},
// 								description: { type: 'string', title: 'توضیحات عکس' }
// 							}
// 						}
// 					}
// 				},
// 				required: ['name', 'categoryType']
// 			},
// 			uniforms: { component: ProductsFieldArray }
// 		}
// 	}
// };

// function ProductsAndServicesTab() {
// 	const methods = useFormContext();
// 	const handleSubmit = async (formData) => {
// 		alert('Product saved!');
// 		console.log(JSON.stringify(formData));
// 	};
// 	const { control } = methods;
// 	const { fields, append, remove } = useFieldArray({
// 		control,
// 		name: 'products'
// 	});

// 	return (
// 		<div>
// 			<Typography
// 				variant="h5"
// 				color="WindowText"
// 				className="font-bold mb-16"
// 			>
// 				محصولات و خدمات شرکت
// 			</Typography>
// 			{fields.map((field, index) => (
// 				<ProductFields
// 					key={field.id}
// 					index={index}
// 					remove={remove}
// 				/>
// 			))}
// 			<Button
// 				variant="contained"
// 				onClick={() =>
// 					append({
// 						name: '',
// 						description: '',
// 						categoryType: '',
// 						showProduct: false,
// 						pictures: []
// 					})
// 				}
// 			>
// 				ثبت محصول جدید
// 			</Button>
// 		</div>
// 	);
// }

// export default ProductsAndServicesTab;

// ProductsAndServicesTab.tsx
import { useFieldArray, useFormContext, Controller, useWatch } from "react-hook-form";
import { 
  Button, 
  TextField, 
  FormControlLabel, 
  Checkbox, 
  Switch,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useState, useEffect } from "react";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getServerFile } from "@/utils/string-utils";

// Product Picture File Upload Component
function ProductPictureUpload({ productIndex, name, companyId }) {
  const { watch, setValue, getValues } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Get the current pictures array for this product
  const pictures = watch(`${name}.${productIndex}.pictures`) || [];

  const handleAddFiles = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    
    setIsLoading(true);
    setUploadError(null);
    
    // Create temporary preview objects
    const tempFiles = selectedFiles.map(file => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id: uuidv4(), // Temporary ID
        fileName: file.name,
        filePath: null,
        contentType: file.type,
        fileSize: file.size,
        uploadPending: true,
        previewUrl,
        description: ''
      };
    });
    
    // Add temporary files to the form
    const updatedPictures = [...pictures, ...tempFiles];
    setValue(`${name}.${productIndex}.pictures`, updatedPictures);
    
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add files to formData
      for (let i = 0; i < selectedFiles.length; i += 1) {
        formData.append('files', selectedFiles[i]);
      }
      
      // Add fileServiceType and companyId
      formData.append('fileServiceType', 'PRODUCT_PICTURE');
      formData.append('companyId', companyId);
      
      // Send request to upload files
      const response = await axios.post(`/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.status === 'SUCCESS' && response.data.data) {
        // Get uploaded files from response
        const uploadedFiles = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        
        // Update the form with the server response
        const currentPictures = getValues(`${name}.${productIndex}.pictures`);
        
        const updatedPictures = currentPictures.map(picture => {
          // If this is a temp file that was just uploaded, find its permanent data
          if (picture.uploadPending) {
            const uploadedFile = uploadedFiles.shift(); // Take first file from uploaded files
            if (uploadedFile) {
              return {
                ...uploadedFile,
                description: picture.description,
                previewUrl: null,
                uploadPending: false
              };
            }
          }
          return picture;
        });
        
        setValue(`${name}.${productIndex}.pictures`, updatedPictures);
        setUploadError(null);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError('خطا در آپلود فایل‌ها. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePicture = async (pictureIndex) => {
    const newPictures = [...pictures];
    const removedPicture = newPictures[pictureIndex];
    
    newPictures.splice(pictureIndex, 1);
    setValue(`${name}.${productIndex}.pictures`, newPictures);
    
    // If the picture has a blob URL, revoke it to free memory
    if (removedPicture.previewUrl && removedPicture.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(removedPicture.previewUrl);
    }
    
    // If the file has an ID from the server, delete it there too
    if (removedPicture.id && !removedPicture.uploadPending) {
      try {
        await axios.delete(`/${companyId}/gallery/${removedPicture.id}`);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const handleUpdateDescription = (pictureIndex, newDescription) => {
    const updatedPictures = [...pictures];
    
    if (updatedPictures[pictureIndex]) {
      updatedPictures[pictureIndex] = {
        ...updatedPictures[pictureIndex],
        description: newDescription
      };
      
      setValue(`${name}.${productIndex}.pictures`, updatedPictures);
      
      // If the file has an ID from the server, update metadata there too
      const picture = updatedPictures[pictureIndex];
      if (picture.id && !picture.uploadPending) {
        // try {
        //   axios.patch(`/${companyId}/gallery/${picture.id}/metadata`, {
        //     metadata: { description: newDescription }
        //   }).catch(error => {
        //     console.error('Error updating file metadata:', error);
        //   });
        // } catch (error) {
        //   console.error('Error updating file metadata:', error);
        // }
      }
    }
  };

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      pictures.forEach(picture => {
        if (picture.previewUrl && picture.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(picture.previewUrl);
        }
      });
    };
  }, [pictures]);

  return (
    <Paper className="p-16 mb-16">
      <Box className="flex justify-between items-center mb-16">
        <Typography variant="subtitle1" className="font-medium">
          تصاویر محصول
        </Typography>
        
        <Button
          variant="contained"
          color="secondary"
          disabled={isLoading}
          startIcon={<FuseSvgIcon>heroicons-outline:upload</FuseSvgIcon>}
          component="label"
        >
          آپلود تصویر
          <input
            type="file"
            multiple
            hidden
            accept="image/*"
            onChange={handleAddFiles}
            disabled={isLoading}
            onClick={(e) => {
              e.target.value = null;
            }}
          />
        </Button>
      </Box>
      
      {uploadError && (
        <Box className="mb-16 p-12 bg-red-50 text-red-800 rounded">
          {uploadError}
        </Box>
      )}
      
      {isLoading && (
        <Box className="flex items-center mb-16">
          <CircularProgress size={24} className="mr-8" />
          <Typography>در حال آپلود تصاویر...</Typography>
        </Box>
      )}
      
      {pictures.length === 0 ? (
        <Box className="p-24 text-center border-2 border-dashed rounded-md">
          <FuseSvgIcon className="text-gray-300 mb-8" size={48}>
            heroicons-outline:photograph
          </FuseSvgIcon>
          <Typography className="text-gray-500">
            هیچ تصویری برای این محصول آپلود نشده است.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {pictures.map((picture, index) => {
            const url = picture.filePath 
              ? getServerFile(picture.filePath) 
              : picture.previewUrl;
              
            return (
              <Grid item xs={12} sm={6} md={4} key={picture.id || index}>
                <Box className="border rounded p-8 h-full flex flex-col">
                  <Box className="relative mb-8 flex-1">
                    <img
                      src={url}
                      alt={picture.description || picture.fileName}
                      className="w-full h-128 object-cover rounded"
                    />
                    {picture.uploadPending && (
                      <Box 
                        className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
                      >
                        <CircularProgress size={40} />
                      </Box>
                    )}
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="توضیحات تصویر"
                    value={picture.description || ''}
                    onChange={(e) => handleUpdateDescription(index, e.target.value)}
                    variant="outlined"
                    size="small"
                    className="mb-8"
                  />
                  
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemovePicture(index)}
                    startIcon={<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>}
                    disabled={picture.uploadPending}
                    size="small"
                  >
                    حذف تصویر
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Paper>
  );
}

function ProductItem({ name, index, onRemove, isOutsourced, companyId }) {
  const { control, watch } = useFormContext();
  // Watch the pictures subarray to update previews
  const pictures = watch(`${name}.${index}.pictures`) || [];

  return (
    <div className="p-16 border rounded-md mb-16">
      <Controller
        name={`${name}.${index}.name`}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="نام محصول"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            className="mb-8"
          />
        )}
      />
      <Controller
        name={`${name}.${index}.description`}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="توضیحات محصول"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            multiline
            rows={3}
            className="mb-8"
          />
        )}
      />
      <Controller
        name={`${name}.${index}.categoryType`}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="دسته‌بندی محصول"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            className="mb-8"
          />
        )}
      />
      <Controller
        name={`${name}.${index}.showProduct`}
        control={control}
        render={({ field }) => (
          <FormControlLabel
            label="نمایش در صفحه شرکت"
            control={<Checkbox {...field} checked={field.value} />}
          />
        )}
      />
      {/* Hidden field for outsourced status */}
      {isOutsourced && (
        <Controller
          name={`${name}.${index}.outsourced`}
          control={control}
          render={({ field }) => (
            <input type="hidden" {...field} value="true" />
          )}
        />
      )}

      {/* Product Pictures Upload */}
      <ProductPictureUpload 
        productIndex={index} 
        name={name} 
        companyId={companyId} 
      />

      <Button
        variant="outlined"
        color="error"
        onClick={() => onRemove(index)}
        startIcon={<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>}
        className="mt-16"
      >
        حذف این محصول
      </Button>
    </div>
  );
}

function ProductsAndServicesTab() {
  const { control } = useFormContext();

  // Get companyId from form context (assuming it's available)
  const companyId = useWatch({ name: 'id' });

  // Watch the productAvailability field
  const productAvailability = useWatch({
    control,
    name: 'productAvailability',
    defaultValue: '0', // default to new approach
  });

  // Determine if we should use the old approach
  const useOldApproach = productAvailability === '1';

  const {
    fields: normalFields,
    append: normalAppend,
    remove: normalRemove,
  } = useFieldArray({
    control,
    name: "products", // normal products
  });

  const {
    fields: outsourcedFields,
    append: outsourcedAppend,
    remove: outsourcedRemove,
  } = useFieldArray({
    control,
    name: "outSourcedProducts", // outsourced
  });

  return (
    <>
      {/* Switch for toggling between old and new approach */}
      <Box className="mb-16">
        <Controller
          name="productAvailability"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value === '1'}
                  onChange={(e) => field.onChange(e.target.checked ? '1' : '0')}
                  color="primary"
                />
              }
              label="استفاده از روش قدیمی برای ثبت محصولات"
            />
          )}
        />
      </Box>

      {useOldApproach ? (
        // Old approach - similar to productTitles
        <Controller
          name="productTitles"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16"
              id="productTitles"
              label="عنوان محصولات (یا خدمات)"
              type="text"
              multiline
              rows={3}
              variant="outlined"
              fullWidth
            />
          )}
        />
      ) : (
        // New approach - with separate product sections
        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-16">محصولات عادی</h3>
            {normalFields.map((field, index) => (
              <ProductItem
                key={field.id}
                name="products"
                index={index}
                onRemove={normalRemove}
                isOutsourced={false}
                companyId={companyId}
              />
            ))}

            <Button
              variant="contained"
              onClick={() =>
                normalAppend({
                  name: "",
                  description: "",
                  categoryType: "",
                  showProduct: false,
                  outsourced: false,
                  pictures: [],
                })
              }
              startIcon={<FuseSvgIcon>heroicons-solid:plus-circle</FuseSvgIcon>}
            >
              ثبت محصول جدید
            </Button>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-16">محصولات برون‌سپاری شده</h3>
            {outsourcedFields.map((field, index) => (
              <ProductItem
                key={field.id}
                name="outSourcedProducts"
                index={index}
                onRemove={outsourcedRemove}
                isOutsourced
                companyId={companyId}
              />
            ))}

            <Button
              variant="contained"
              onClick={() =>
                outsourcedAppend({
                  name: "",
                  description: "",
                  categoryType: "",
                  showProduct: false,
                  outsourced: true,
                  pictures: [],
                })
              }
              startIcon={<FuseSvgIcon>heroicons-solid:plus-circle</FuseSvgIcon>}
            >
              ثبت محصول برون‌سپاری شده جدید
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductsAndServicesTab;
