import { Button, Checkbox, FormControlLabel, InputAdornment, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useEffect } from "react";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { BiMinus } from "react-icons/bi";

function ContactInfoTab() {
    const methods = useFormContext();
    const { control, formState } = methods;
    const { errors } = formState;

    const { fields: factoryTelFields, append: appendFactoryTel, remove: removeFactoryTel } =
        useFieldArray({ control, name: "factoryTels" });

    const { fields: factoryFaxFields, append: appendFactoryFax, remove: removeFactoryFax } =
        useFieldArray({ control, name: "factoryFaxes" });

    const { fields: officeTelFields, append: appendOfficeTel, remove: removeOfficeTel } =
        useFieldArray({ control, name: "officeTels" });

    const { fields: officeFaxFields, append: appendOfficeFax, remove: removeOfficeFax } =
        useFieldArray({ control, name: "officeFaxes" });

    const { fields: emailFields, append: appendEmail, remove: removeEmail } =
        useFieldArray({ control, name: "emails" });

    const { fields: websiteFields, append: appendWebsite, remove: removeWebsite } =
        useFieldArray({ control, name: "websites" });

    return (
        <div>
            <Typography variant="h5" color="WindowText" className="font-bold">
                اطلاعات تماس محل فعالیت
            </Typography>

            <div className="flex sm:flex-row flex-col -mx-4">
                <Controller
                    name="factoryState"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.factoryState}
                            helperText={errors?.factoryState?.message}
                            label="استان کارخانه"
                            id="factoryState"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="factoryCity"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.factoryCity}
                            helperText={errors?.factoryCity?.message}
                            label="شهر کارخانه"
                            id="factoryCity"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </div>

            <div className="flex sm:flex-row flex-col -mx-4">
                <Controller
                    name="industrialCity"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.industrialCity}
                            helperText={errors?.industrialCity?.message}
                            label="نام شهرک صنعتی"
                            id="industrialCity"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="factoryPoBox"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="number"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.factoryPoBox}
                            helperText={errors?.factoryPoBox?.message}
                            label="کدپستی"
                            id="factoryPoBox"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </div>

            <Controller
                name="factoryLocation"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        className="mt-8 mb-16"
                        id="factoryLocation"
                        label="آدرس کارخانه"
                        type="text"
                        multiline
                        rows={3}
                        variant="outlined"
                        fullWidth
                    />
                )}
            />

            {/* Factory Tels - Array Field */}
            <div className="flex flex-col space-y-2">
                <label className="font-medium text-gray-700 dark:text-gray-600">
                    تلفن ثابت کارخانه
                </label>

                {factoryTelFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 space-x-2">
                        <Controller
                            name={`factoryTels.${index}.telNumber`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={`تلفن کارخانه ${index + 1}`}
                                    placeholder={`تلفن کارخانه ${index + 1}`}
                                    variant="outlined"
                                    fullWidth
                                    className="me-10 mt-16"
                                    error={!!errors?.factoryTels?.[index]?.telNumber}
                                    helperText={errors?.factoryTels?.[index]?.telNumber?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FuseSvgIcon size={20}>heroicons-solid:tag</FuseSvgIcon>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />

                        <Button
                            onClick={() => removeFactoryTel(index)}
                            variant="flat"
                            color="danger"
                        >
                            <BiMinus size={30} color="red" className="text-red-light" />
                        </Button>
                    </div>
                ))}

                {factoryTelFields.length < 3 && (
                    <Button
                        className="group inline-flex items-center mt-8 -ml-4 py-2 px-4 rounded cursor-pointer"
                        onClick={() => appendFactoryTel({ telNumber: '', telType: 'FACTORY_TEL' })}
                    >
                        <FuseSvgIcon size={20}>heroicons-solid:plus-circle</FuseSvgIcon>
                        <span className="ml-8 font-medium text-secondary group-hover:underline">
              {"افزودن شماره تلفن جدید"}
            </span>
                    </Button>
                )}
            </div>

            {/* Factory Faxes - Array Field */}
            <div className="flex flex-col space-y-2 mt-16">
                <label className="font-medium text-gray-700 dark:text-gray-600">
                    فکس ثابت کارخانه
                </label>

                {factoryFaxFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 space-x-2 mt-8">
                        <Controller
                            name={`factoryFaxes.${index}.telNumber`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={`فکس کارخانه ${index + 1}`}
                                    placeholder={`فکس کارخانه ${index + 1}`}
                                    variant="outlined"
                                    fullWidth
                                    className="me-10"
                                    error={!!errors?.factoryFaxes?.[index]?.telNumber}
                                    helperText={errors?.factoryFaxes?.[index]?.telNumber?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FuseSvgIcon size={20}>heroicons-solid:tag</FuseSvgIcon>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />

                        <Button
                            onClick={() => removeFactoryFax(index)}
                            variant="flat"
                            color="danger"
                        >
                            <BiMinus size={30} color="red" className="text-red-light" />
                        </Button>
                    </div>
                ))}

                {factoryFaxFields.length < 3 && (
                    <Button
                        className="group inline-flex items-center mt-2 -ml-4 py-2 px-4 rounded cursor-pointer"
                        onClick={() => appendFactoryFax({ telNumber: '', telType: 'FACTORY_FAX' })}
                    >
                        <FuseSvgIcon size={20}>heroicons-solid:plus-circle</FuseSvgIcon>
                        <span className="ml-8 font-medium text-secondary group-hover:underline">
              {"افزودن شماره فکس جدید"}
            </span>
                    </Button>
                )}
            </div>

            <Typography variant="h5" color="WindowText" className="font-bold mt-48">
                اطلاعات تماس دفتر مرکزی
            </Typography>

            <div className="flex sm:flex-row flex-col -mx-4">
                <Controller
                    name="officeState"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.officeState}
                            helperText={errors?.officeState?.message}
                            label="استان محل دفتر مرکزی"
                            id="officeState"
                            variant="outlined"
                            fullWidth
                            required
                        />
                    )}
                />

                <Controller
                    name="officeCity"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.officeCity}
                            helperText={errors?.officeCity?.message}
                            label="شهر دفتر مرکزی"
                            id="officeCity"
                            required
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="officePoBox"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type="number"
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.officePoBox}
                            helperText={errors?.officePoBox?.message}
                            label="کدپستی دفتر مرکزی"
                            id="officePoBox"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </div>

            <Controller
                name="officeLocation"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        className="mt-8 mb-16"
                        id="officeLocation"
                        label="آدرس دفتر مرکزی"
                        type="text"
                        error={!!errors.officeLocation}
                        helperText={errors?.officeLocation?.message}
                        multiline
                        rows={3}
                        variant="outlined"
                        fullWidth
                    />
                )}
            />

            {/* Office Tels - Array Field */}
            <div className="flex flex-col space-y-2 mt-8">
                <label className="font-medium text-gray-700 dark:text-gray-600">
                    تلفن ثابت اداره مرکزی
                </label>

                {officeTelFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 space-x-2">
                        <Controller
                            name={`officeTels.${index}.telNumber`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={`تلفن اداره مرکزی ${index + 1}`}
                                    placeholder={`تلفن اداره مرکزی ${index + 1}`}
                                    variant="outlined"
                                    fullWidth
                                    className="me-10 mt-16"
                                    error={!!errors?.officeTels?.[index]?.telNumber}
                                    helperText={errors?.officeTels?.[index]?.telNumber?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FuseSvgIcon size={20}>heroicons-solid:tag</FuseSvgIcon>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />

                        <Button
                            onClick={() => removeOfficeTel(index)}
                            variant="flat"
                            color="danger"
                        >
                            <BiMinus size={30} color="red" className="text-red-light" />
                        </Button>
                    </div>
                ))}

                {officeTelFields.length < 3 && (
                    <Button
                        className="group inline-flex items-center mt-8 -ml-4 py-2 px-4 rounded cursor-pointer"
                        onClick={() => appendOfficeTel({ telNumber: '', telType: 'OFFICE_TEL' })}
                    >
                        <FuseSvgIcon size={20}>heroicons-solid:plus-circle</FuseSvgIcon>
                        <span className="ml-8 font-medium text-secondary group-hover:underline">
              {"افزودن شماره تلفن جدید"}
            </span>
                    </Button>
                )}
            </div>

            {/* Office Faxes - Array Field */}
            <div className="flex flex-col space-y-2">
                <label className="font-medium text-gray-700 dark:text-gray-600">
                    شماره فکس‌های اداره مرکزی
                </label>

                {officeFaxFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 space-x-2">
                        <Controller
                            name={`officeFaxes.${index}.telNumber`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={`فکس اداره مرکزی ${index + 1}`}
                                    placeholder={`فکس اداره مرکزی ${index + 1}`}
                                    variant="outlined"
                                    fullWidth
                                    className="me-10 mt-16"
                                    error={!!errors?.officeFaxes?.[index]?.telNumber}
                                    helperText={errors?.officeFaxes?.[index]?.telNumber?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FuseSvgIcon size={20}>heroicons-solid:tag</FuseSvgIcon>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />

                        <Button
                            onClick={() => removeOfficeFax(index)}
                            variant="flat"
                            color="danger"
                        >
                            <BiMinus size={30} color="red" className="text-red-light" />
                        </Button>
                    </div>
                ))}

                {officeFaxFields.length < 3 && (
                    <Button
                        className="group inline-flex items-center mt-8 -ml-4 py-2 px-4 rounded cursor-pointer"
                        onClick={() => appendOfficeFax({ telNumber: '', telType: 'OFFICE_FAX' })}
                    >
                        <FuseSvgIcon size={20}>heroicons-solid:plus-circle</FuseSvgIcon>
                        <span className="ml-8 font-medium text-secondary group-hover:underline">
              {"افزودن شماره فکس جدید"}
            </span>
                    </Button>
                )}
            </div>

            <div className="flex sm:flex-row flex-col mt-16 -mx-4">
                <Controller
                    name="smsNumber"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="number"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.smsNumber}
                            helperText={errors?.smsNumber?.message}
                            label="سامانه پیام کوتاه"
                            id="smsNumber"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="specialLineNumber"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="number"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.specialLineNumber}
                            helperText={errors?.specialLineNumber?.message}
                            label="شماره خط ویژه"
                            id="specialLineNumber"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </div>

            <Typography variant="h5" color="WindowText" className="font-bold mt-48">
                اطلاعات شبکه های اجتماعی و اینترنت{" "}
            </Typography>

            <div className="flex sm:flex-row flex-col -mx-4">
                <Controller
                    name="telegramId"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="text"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.telegramId}
                            helperText={errors?.telegramId?.message || "(مثال: 09123456789)"}
                            label="آیدی تلگرام"
                            id="telegramId"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="telegramPhoneNo"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="text"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.telegramPhoneNo}
                            helperText={errors?.telegramPhoneNo?.message || "(مثال: 09123456789)"}
                            label="شماره تلگرام"
                            id="telegramPhoneNo"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="whatsAppId"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="text"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.whatsAppId}
                            helperText={errors?.whatsAppId?.message || "(مثال: 09123456789)"}
                            label="آیدی واتساپ"
                            id="whatsAppId"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="whatsAppPhoneNo"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="text"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.whatsAppPhoneNo}
                            helperText={errors?.whatsAppPhoneNo?.message || "(مثال: 09123456789)"}
                            label="شماره واتساپ"
                            id="whatsAppPhoneNo"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </div>

            <div className="flex sm:flex-row flex-col -mx-4">
                <Controller
                    name="instagramId"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.instagramId}
                            helperText={errors?.instagramId?.message || "(مثال: @foodkeys)"}
                            label="آی دی اینستاگرام"
                            id="instagramId"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="linkedInId"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.linkedInId}
                            helperText={errors?.linkedInId?.message || "(مثال: foodkeys)"}
                            label="آی دی لینکدین"
                            id="linkedInId"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="skypeId"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.skypeId}
                            helperText={errors?.skypeId?.message || "(مثال: foodkeys)"}
                            label="آی دی اسکایپ"
                            id="skypeId"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </div>

            <div className="flex sm:flex-row flex-col -mx-4">
                <Controller
                    name="eitaaPhoneNo"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="number"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.eitaaPhoneNo}
                            helperText={errors?.eitaaPhoneNo?.message || "(مثال: 09123456789)"}
                            label="شماره ایتا"
                            id="eitaaPhoneNo"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="rubikaPhoneNo"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            type="number"
                            {...field}
                            className="mt-8 mb-16 sm:mx-4"
                            error={!!errors.rubikaPhoneNo}
                            helperText={errors?.rubikaPhoneNo?.message || "(مثال: 09123456789)"}
                            label="شماره روبیکا"
                            id="rubikaPhoneNo"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </div>

            {/* Emails - Array Field */}
            <div className="flex flex-col space-y-2">
                <label className="font-medium text-gray-700 dark:text-gray-600">
                    ایمیل ثبت شده
                </label>

                {emailFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 space-x-2">
                        <Controller
                            name={`emails.${index}`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={`آدرس ایمیل ${index + 1}`}
                                    placeholder={`آدرس ایمیل ${index + 1}`}
                                    variant="outlined"
                                    fullWidth
                                    type="email"
                                    className="me-10 mt-16"
                                    error={!!errors?.emails?.[index]}
                                    helperText={errors?.emails?.[index]?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FuseSvgIcon size={20}>heroicons-solid:tag</FuseSvgIcon>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />

                        <Button
                            onClick={() => removeEmail(index)}
                            variant="flat"
                            color="danger"
                        >
                            <BiMinus size={30} color="red" className="text-red-light" />
                        </Button>
                    </div>
                ))}

                {emailFields.length < 3 && (
                    <Button
                        className="group inline-flex items-center mt-8 -ml-4 py-2 px-4 rounded cursor-pointer"
                        onClick={() => appendEmail('')}
                    >
                        <FuseSvgIcon size={20}>heroicons-solid:plus-circle</FuseSvgIcon>
                        <span className="ml-8 font-medium text-secondary group-hover:underline">
              {"افزودن ایمیل جدید"}
            </span>
                    </Button>
                )}
            </div>

            {/* Websites - Array Field (up to 5) */}
            <div className="flex flex-col space-y-2 mt-16">
                <label className="font-medium text-gray-700 dark:text-gray-600">
                    وبسایت‌ها
                </label>

                {websiteFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 space-x-2">
                        <Controller
                            name={`websites.${index}.name`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={`آدرس وبسایت ${index + 1}`}
                                    placeholder="www.example.com"
                                    variant="outlined"
                                    fullWidth
                                    className="me-10 mt-16"
                                    error={!!errors?.websites?.[index]?.name}
                                    helperText={errors?.websites?.[index]?.name?.message || "(مثال: www.foodkeys.com)"}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FuseSvgIcon size={20}>heroicons-solid:globe-alt</FuseSvgIcon>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />

                        <Controller
                            name={`websites.${index}.visibility`}
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    className="mt-16 whitespace-nowrap min-w-160"
                                    control={
                                        <Checkbox
                                            checked={field.value === "FK_WEBSITE:ADMIN_PANEL"}
                                            onChange={(e) => {
                                                field.onChange(
                                                    e.target.checked
                                                        ? "FK_WEBSITE:ADMIN_PANEL"
                                                        : "ADMIN_PANEL"
                                                );
                                            }}
                                            color="secondary"
                                        />
                                    }
                                    label="نمایش در وبسایت"
                                />
                            )}
                        />

                        <Button
                            onClick={() => removeWebsite(index)}
                            variant="flat"
                            color="danger"
                            className="mt-16"
                        >
                            <BiMinus size={30} color="red" className="text-red-light" />
                        </Button>
                    </div>
                ))}

                {websiteFields.length < 5 && (
                    <Button
                        className="group inline-flex items-center mt-8 -ml-4 py-2 px-4 rounded cursor-pointer"
                        onClick={() => appendWebsite({ name: '', visibility: 'FK_WEBSITE:ADMIN_PANEL' })}
                    >
                        <FuseSvgIcon size={20}>heroicons-solid:plus-circle</FuseSvgIcon>
                        <span className="ml-8 font-medium text-secondary group-hover:underline">
                            {"افزودن وبسایت جدید"}
                        </span>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default ContactInfoTab;