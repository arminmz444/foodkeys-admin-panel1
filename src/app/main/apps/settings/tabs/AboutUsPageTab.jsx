import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseUtils from '@fuse/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from '@lodash';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import { lighten } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { useState } from 'react';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { AiOutlineBgColors } from 'react-icons/ai';
import { BsTextLeft } from 'react-icons/bs';
import { LuHeading1 } from 'react-icons/lu';
import { MdAddLink, MdDriveFileRenameOutline } from 'react-icons/md';
import { z } from 'zod';
import FusePageSimple from '@fuse/core/FusePageSimple/index.js';

const defaultValues = {
	title: '',
	name: '',
	username: '',
	company: '',
	about: '',
	email: '',
	phone: '',
	country: '',
	language: '',
	description: '',
	color: '',
	isButtonRequired: '',
	buttonName: '',
	buttonLink: '',
	images: []
};
const schema = z.object({
	name: z.string().nonempty('Name is required'),
	description: z.string().nonempty('توضیحات الزامی می‌باشد.'),
	title: z.string().nonempty('عنوان الزامی می‌باشد.'),
	color: z.string().nonempty('انتخاب رنگ پس زمینه الزامی می‌باشد.'),

	username: z.string().nonempty('Username is required'),
	company: z.string().nonempty('Company is required'),
	about: z.string().nonempty('About is required'),
	email: z.string().email('Invalid email').nonempty('Email is required'),
	phone: z.string().nonempty('Phone is required'),
	country: z.string().nonempty('Country is required'),
	language: z.string().nonempty('Language is required')
});

function AboutUsPageTab() {
	const methods = useFormContext();

	const [colorValue, setColorValue] = useState('');

	// const { data: accountSettings, isError } = useGetAccountSettingsQuery();
	const { control, watch, reset, handleSubmit, formState } = useForm({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});
	const images = watch('images');
	const { isValid, dirtyFields, errors } = formState;

	/**
	 * Form Submit
	 */
	function onSubmit() {
		// Persist via website config API when wired
	}

	return (
		<FusePageSimple
			content={
				<div className="w-full max-w-3xl">
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="w-full">
							<Typography className="text-xl">اسلایدر</Typography>
							<Typography
								color="text.secondary"
								className="font-300"
							>
								تنظیمات اسلاید را انجام دهید.
							</Typography>
						</div>
						<div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
							<div className="sm:col-span-4">
								<Controller
									control={control}
									name="title"
									render={({ field }) => (
										<TextField
											{...field}
											label="عنوان اسلاید"
											placeholder="عنوان اسلایدر را بنویسید"
											id="title"
											error={!!errors.title}
											helperText={errors?.title?.message}
											variant="outlined"
											required
											fullWidth
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<LuHeading1 size={20} />
													</InputAdornment>
												)
											}}
										/>
									)}
								/>
								<Controller
									control={control}
									name="title"
									render={({ field }) => (
										<TextField
											{...field}
											label="عنوان اسلاید"
											placeholder="عنوان اسلایدر را بنویسید"
											id="title"
											error={!!errors.title}
											helperText={errors?.title?.message}
											variant="outlined"
											required
											fullWidth
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<LuHeading1 size={20} />
													</InputAdornment>
												)
											}}
										/>
									)}
								/>
							</div>
							<div className="sm:col-span-4">
								<Controller
									control={control}
									name="description"
									render={({ field }) => (
										<TextField
											{...field}
											label="توضیحات"
											placeholder="توضیحات اسلاید را بنویسید."
											id="description"
											error={!!errors.description}
											helperText={errors?.description?.message}
											variant="outlined"
											required
											minRows={3}
											multiline
											fullWidth
											InputProps={{
												className: 'max-h-min h-min items-start',
												startAdornment: (
													<InputAdornment
														position="start"
														className="mt-16"
													>
														<BsTextLeft size={20} />
													</InputAdornment>
												)
											}}
										/>
									)}
								/>
							</div>
							<div className="sm:col-span-4">
								<div className="flex flex-col w-full mb-10">
									<Typography className="text-base">اسلایدر</Typography>
									<Typography
										color="text.secondary"
										className="font-300"
									>
										تصویر مورد نظر را انتخاب نمایید.{' '}
									</Typography>
								</div>
								<div className="flex justify-center sm:justify-start flex-wrap -mx-16">
									<Controller
										name="images"
										control={control}
										render={({ field: { onChange, value } }) => (
											<Box
												sx={{
													backgroundColor: (theme) =>
														theme.palette.mode === 'light'
															? lighten(theme.palette.background.default, 0.4)
															: lighten(theme.palette.background.default, 0.02)
												}}
												component="label"
												htmlFor="button-file"
												className="productImageUpload flex items-center justify-center relative w-full h-128 rounded-16 mx-12 mb-24 overflow-hidden cursor-pointer shadow hover:shadow-lg"
											>
												<input
													accept="image/*"
													className="hidden"
													id="button-file"
													type="file"
													onChange={async (e) => {
														function readFileAsync() {
															return new Promise((resolve, reject) => {
																const file = e?.target?.files?.[0];

																if (!file) {
																	return;
																}

																const reader = new FileReader();
																reader.onload = () => {
																	resolve({
																		id: FuseUtils.generateGUID(),
																		url: `data:${file.type};base64,${btoa(reader.result)}`,
																		type: 'image'
																	});
																};
																reader.onerror = reject;
																reader.readAsBinaryString(file);
															});
														}

														const newImage = await readFileAsync();
														onChange([newImage, ...value]);
													}}
												/>

												<FuseSvgIcon
													size={32}
													color="action"
												>
													heroicons-outline:upload
												</FuseSvgIcon>
											</Box>
										)}
									/>
									<Controller
										name="images"
										control={control}
										defaultValue=""
										render={({ field: { onChange, value } }) => {
											return (
												<>
													{images.map((media) => (
														<div className="w-full flex flex-col sm:flex-row  items-center justify-center">
															<div
																onClick={() => onChange(media.id)}
																onKeyDown={() => onChange(media.id)}
																role="button"
																tabIndex={0}
																className={clsx(
																	'productImageItem flex items-center justify-center relative w-full sm:w-1/2 h-128 rounded-16 mx-12 mb-24 overflow-hidden cursor-pointer outline-none shadow hover:shadow-lg',
																	media.id === value && 'featured'
																)}
																key={media.id}
															>
																<img
																	className="max-w-none w-auto h-full"
																	src={media.url}
																	alt="product"
																/>
															</div>
															<div className="w-full sm:w-1/2 h-full flex flex-col gap-y-10 pl-12">
																<Controller
																	control={control}
																	name="description"
																	render={({ field }) => (
																		<TextField
																			{...field}
																			label="توضیح عکس"
																			placeholder="توضیحات عکس را بنویسید."
																			id="description"
																			error={!!errors.description}
																			helperText={errors?.description?.message}
																			variant="outlined"
																			required
																			multiline
																			fullWidth
																			InputProps={{
																				startAdornment: (
																					<InputAdornment position="start">
																						<BsTextLeft size={20} />
																					</InputAdornment>
																				)
																			}}
																		/>
																	)}
																/>
																<Button
																	variant="contained"
																	color="error"
																	sx={{ borderRadius: '10px' }}
																>
																	حذف
																</Button>
															</div>
														</div>
													))}
												</>
											);
										}}
									/>
								</div>
							</div>

							<div className="sm:col-span-2 relative">
								<Controller
									control={control}
									name="color"
									render={({ field }) => (
										<>
											<input
												className="absolute z-10 border-0 left-0 top-0 translate-x-1/2 translate-y-1/3 w-32 h-32 rounded-xl cursor-pointer"
												type="color"
												value={field.value || '#000000'}
												onChange={(e) => field.onChange(e.target.value)}
											/>
											<TextField
												className=""
												value={field.value || ''} // Display selected color value
												onChange={(e) => field.onChange(e.target.value)} // Update color if typed manually
												{...field}
												label="رنگ پس زمینه"
												placeholder="رنگ پس زمینه اسلاید را انتخاب کنید."
												id="color"
												error={!!errors.color}
												helperText={errors?.color?.message}
												variant="outlined"
												fullWidth
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<AiOutlineBgColors size={20} />
														</InputAdornment>
													)
												}}
											/>
										</>
									)}
								/>
							</div>

							<div className="sm:col-span-4">
								<Controller
									name="isButtonRequired"
									control={control}
									render={({ field: { onChange, value } }) => (
										<div className="flex flex-col gap-y-20">
											<div className="flex flex-col w-1/2 justify-center ">
												<FormControlLabel
													classes={{ root: 'm-0', label: 'flex flex-1' }}
													labelPlacement="start"
													label="استفاده از دکمه"
													control={
														<Switch
															onChange={(ev) => {
																onChange(ev.target.checked);
															}}
															checked={value}
															name="isButtonRequired"
														/>
													}
												/>
												<FormHelperText className="font-300">
													برای استفاده از دکمه روشن کنید.
												</FormHelperText>
											</div>
											{value && (
												<div className="flex w-full gap-x-20">
													<Controller
														control={control}
														name="buttonName"
														render={({ field }) => (
															<TextField
																className="w-1/2"
																{...field}
																label="عنوان دکمه"
																placeholder="عنوان دکمه اسلاید را انتخاب کنید."
																id="buttonName"
																error={!!errors.buttonName}
																helperText={errors?.buttonName?.message}
																variant="outlined"
																fullWidth
																InputProps={{
																	startAdornment: (
																		<InputAdornment position="start">
																			<MdDriveFileRenameOutline size={20} />
																		</InputAdornment>
																	)
																}}
															/>
														)}
													/>
													<Controller
														control={control}
														name="buttonLink"
														render={({ field }) => (
															<TextField
																className="w-1/2"
																{...field}
																label="لینک دکمه"
																placeholder="لینک دکمه اسلاید را انتخاب کنید."
																id="buttonLink"
																error={!!errors.buttonLink}
																helperText={errors?.buttonLink?.message}
																variant="outlined"
																fullWidth
																InputProps={{
																	startAdornment: (
																		<InputAdornment position="start">
																			<MdAddLink size={20} />
																		</InputAdornment>
																	)
																}}
															/>
														)}
													/>
												</div>
											)}
										</div>
									)}
								/>
							</div>
						</div>

						<Divider className="mb-40 mt-44 border-t" />
						<div className="flex items-center justify-end gap-x-10 w-1/2">
							<Button
								variant="outlined"
								disabled={_.isEmpty(dirtyFields)}
								onClick={() => reset(accountSettings)}
								size="large"
								fullWidth
							>
								لغو
							</Button>
							<Button
								variant="contained"
								color="secondary"
								disabled={_.isEmpty(dirtyFields) || !isValid}
								type="submit"
								size="large"
								fullWidth
							>
								ذخیره
							</Button>
						</div>
					</form>
				</div>
			}
		/>
	);
}

export default AboutUsPageTab;
