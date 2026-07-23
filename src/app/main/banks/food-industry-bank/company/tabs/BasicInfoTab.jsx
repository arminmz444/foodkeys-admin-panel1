import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { BiMinus } from "react-icons/bi";
import { Button, InputAdornment, Grid } from "@mui/material";
/**
 * The basic info tab.
 */
function BasicInfoTab() {
  const methods = useFormContext();
  const { control, formState, watch } = methods;
  const { errors } = formState;
  const { categoryId: routeCategoryId } = useParams();
  // Prefer the bank categoryId from the dynamic route (`banks/company/:categoryId/...`).
  // Fall back to the company's own category, then to the legacy food-industry id (1).
  const watchedCategoryId = watch("categoryId") ?? watch("category")?.value ?? watch("category")?.id;
  const categoryId = routeCategoryId || watchedCategoryId || 1;
  const [subcategories, setSubcategories] = useState(methods.getValues("subcategories") || []);
  const [companyTypeOptions, setCompanyTypeOptions] = useState(methods.getValues("companyTypeOptions") || []);
  const [subCategory, setSubCategory] = useState(0);
  const [companyType, setCompanyType] = useState(0);
  const [hasFetchedCompanyTypes, setHasFetchedCompanyTypes] = useState(false);
  useEffect(() => {
    if (!categoryId) {
      return undefined;
    }

    let cancelled = false;

    const fetchSubCategories = async () => {
      try {
        const response = await axios.get(`/category/${categoryId}/subcategory`);
        if (!cancelled && response.data.status === "SUCCESS") {
          setSubcategories(response.data.data || []);
          methods.setValue("subcategories", response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchSubCategories();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);
  useEffect(() => {
    const fetchCompanyTypes = async () => {
      const response = await axios.get(`/client/panel/company/fetch/type`);
      if (response.data.status === "SUCCESS") {
        setCompanyTypeOptions(response.data.data);
        methods.setValue("companyTypeOptions", response.data.data);
      }
    };
    if((!companyTypeOptions || companyTypeOptions.length === 0) && !hasFetchedCompanyTypes) {
      fetchCompanyTypes();
      setHasFetchedCompanyTypes(true);
    }
  }, []);
  
  const { fields: activityFields, append: appendActivity, remove: removeActivity } =
  useFieldArray({ control, name: "activities" });

  const watchedSubCategory = watch("subCategory");
  const watchedCompanyType = watch("companyType");
  useEffect(() => {
    if (watchedSubCategory) setSubCategory(watchedSubCategory.value);
    // if (subcategories && subcategories.length) setSubCategory(subCategoryWatch[0].value);
    if (watchedCompanyType) setCompanyType(watchedCompanyType.value);
  }, [watchedSubCategory, watchedCompanyType]);
  const handleChange = (event, setter, fieldName) => {
    const { value } = event.target;
    setter(value);
    if (fieldName) {
      methods.setValue(fieldName, { 
        value, 
        label: fieldName === "companyType" 
          ? companyTypeOptions.find(type => type.value === value)?.name
          : subcategories.find(cat => cat.value === value)?.name 
      });
    }
  };

  return (
    <div>
      <Controller
        name="subCategory"
        control={control}
        render={({ field }) => (
          <FormControl className="mt-8 mb-16 w-full">
            <InputLabel id="subCategorySelect">دسته بندی</InputLabel>
            <Select
              // options={subcategories.map((subcategory) => ({
              //   value: subcategory.value,
              //   label: subcategory.name,
              // }))}
              labelId="subCategorySelect"
              id="subCategorySelect"
              value={subCategory}
              label="زیرشاخه"
              getOptionLabel={(option) => option.name}
              onChange={(e) => handleChange(e, setSubCategory, "subCategory")}
              fullWidth
              required
            >
              {subcategories && subcategories.length ? (
                subcategories.map((cat, catIndex) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={0}>دسته بندی</MenuItem>
              )}
            </Select>
          </FormControl>
          // <TextField
          // 	{...field}
          // 	className="mt-8 mb-16 sm:mx-4"
          // 	error={!!errors.category}
          // 	required
          // 	helperText={errors?.category?.message}
          // 	label="دسته بندی"
          // 	id="category"
          // 	variant="outlined"
          // 	fullWidth
          // />
        )}
      />
      <div className="flex sm:flex-row flex-col -mx-4">
        <Controller
          name="companyName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.companyName}
              required
              helperText={errors?.companyName?.message}
              label="نام شرکت"
              autoFocus
              id="companyName"
              variant="outlined"
              fullWidth
            />
          )}
        />
        <Controller
          name="companyNameEn"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.companyNameEn}
              required
              helperText={errors?.companyNameEn?.message}
              label="نام شرکت به انگلیسی"
              id="companyNameEn"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </div>
      <div className="flex sm:flex-row flex-col -mx-4">
        <Controller
          name="mainBrand"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.mainBrand}
              required
              helperText={errors?.mainBrand?.message}
              label="نام تجاری (برند) اصلی"
              id="mainBrand"
              variant="outlined"
              fullWidth
            />
          )}
        />
        <Controller
          name="mainBrandEn"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.mainBrandEn}
              required
              helperText={errors?.mainBrandEn?.message}
              label="نام تجاری (برند) اصلی به انگلیسی"
              id="mainBrandEn"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </div>


      <Controller
        name="companyType"
        control={control}
        render={({ field }) => (
          <FormControl className="mt-8 mb-16 w-full">
            <InputLabel id="companyTypeSelectLabel">نوع شرکت</InputLabel>
            <Select
              labelId="companyTypeSelectLabel"
              id="companyTypeSelect"
              value={companyType}
              label="نوع شرکت"
              getOptionLabel={(option) => option.name}
              onChange={(e) => handleChange(e, setCompanyType, "companyType")}
              fullWidth
              required
            >
              {companyTypeOptions && companyTypeOptions.length ? (
                companyTypeOptions.map((cotype, catIndex) => (
                  <MenuItem key={cotype.value} value={cotype.value}>
                    {cotype.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value={0}>نوع شرکت</MenuItem>
              )}
            </Select>
          </FormControl>
        )}
      />
      
      <div className="flex sm:flex-row flex-col -mx-4">
        <Controller
          name="establishDateStr"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="text"
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.establishmentDate}
              helperText={errors?.establishmentDate?.message || "(مثال: 1389)"}
              label="تاریخ تأسیس"
              id="establishDateStr"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </div>
      
      <div className="flex flex-col space-y-4 mt-8 mb-16">
        <label className="font-medium text-gray-700 dark:text-gray-300">
            فعالیت‌های شرکت
        </label>

        {activityFields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name={`activities.${index}.name`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="نام فعالیت"
                                    placeholder="نام فعالیت را وارد کنید"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors?.activities?.[index]?.name}
                                    helperText={errors?.activities?.[index]?.name?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FuseSvgIcon size={20}>heroicons-solid:briefcase</FuseSvgIcon>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller
                            name={`activities.${index}.capacity`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="ظرفیت"
                                    placeholder="ظرفیت فعالیت"
                                    variant="outlined"
                                    fullWidth
                                    type="number"
                                    error={!!errors?.activities?.[index]?.capacity}
                                    helperText={errors?.activities?.[index]?.capacity?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FuseSvgIcon size={20}>heroicons-solid:chart-bar</FuseSvgIcon>
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={(e) => {
                                        // Ensure only integers are accepted
                                        const value = e.target.value;
                                        if (value === '' || /^[0-9]\d*$/.test(value)) {
                                            field.onChange(value === '' ? '' : parseInt(value, 10));
                                        }
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Controller
                            name={`activities.${index}.description`}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="توضیحات فعالیت"
                                    placeholder="توضیحات مربوط به این فعالیت را وارد کنید"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={!!errors?.activities?.[index]?.description}
                                    helperText={errors?.activities?.[index]?.description?.message}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                <div className="flex justify-end mt-2">
                    <Button
                        onClick={() => removeActivity(index)}
                        variant="outlined"
                        color="error"
                        size="small"
                        className="mt-2"
                        startIcon={<BiMinus />}
                    >
                        حذف فعالیت
                    </Button>
                </div>
            </div>
        ))}

        <Button
            className="mt-2 self-start"
            variant="contained"
            color="secondary"
            onClick={() => appendActivity({ name: '', description: '', capacity: '' })}
            startIcon={<FuseSvgIcon>heroicons-solid:plus-circle</FuseSvgIcon>}
        >
            افزودن فعالیت جدید
        </Button>
      </div>
      
      <div className="flex sm:flex-row flex-col -mx-4">
        <Controller
          name="advertisingSlogan"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.advertisingSlogan}
              helperText={
                errors?.advertisingSlogan?.message ||
                "متن شعار تبلیغاتی را وارد کنید"
              }
              label="شعار تبلیغاتی"
              id="advertisingSlogan"
              variant="outlined"
              fullWidth
            />
          )}
        />

      </div>
      <Controller
        name="subjectOfActivity"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mt-8 mb-16 sm:mx-4"
            error={!!errors.subjectOfActivity}
            helperText={errors?.subjectOfActivity?.message}
            label="موضوع فعالیت"
            id="subjectOfActivity"
            variant="outlined"
            fullWidth
            multiline
          />
        )}
      />
      <div className="flex sm:flex-row flex-col -mx-4">
        <Controller
          name="landArea"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.landArea}
              helperText={errors?.landArea?.message}
              label="متراژ زمین"
              id="landArea"
              variant="outlined"
              fullWidth
            />
          )}
        />
        <Controller
          name="buildingArea"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.buildingArea}
              helperText={errors?.buildingArea?.message}
              label="متراژ بنا"
              id="buildingArea"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </div>
      <div className="flex sm:flex-row flex-col -mx-4">
        <Controller
          name="ceo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.ceoName}
              helperText={errors?.ceoName?.message}
              label="نام و نام خانوادگی مدیرعامل"
              id="ceoName"
              variant="outlined"
              fullWidth
            />
          )}
        />
        <Controller
          name="ceoPhoneNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              className="mt-8 mb-16 sm:mx-4"
              error={!!errors.ceoPhoneNumber}
              helperText={
                errors?.ceoPhoneNumber?.message || "(مثال: 09123456789)"
              }
              label="تلفن همراه مدیر عامل"
              id="ceoPhoneNumber"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </div>
        <Controller
            name="owner"
            control={control}
            render={({ field }) => (
                <TextField
                    {...field}
                    className="mt-8 mb-16 sm:mx-4"
                    error={!!errors.owner}
                    helperText={errors?.owner?.message}
                    label="نام مالک"
                    id="owner"
                    variant="outlined"
                    fullWidth
                />
            )}
        />
      <Controller
        name="stakeholders"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mt-8 mb-16 sm:mx-4"
            error={!!errors.stakeholders}
            helperText={errors?.stakeholders?.message}
            label="سهامداران"
            id="stakeholders"
            variant="outlined"
            fullWidth
          />
        )}
      />
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

      <Controller
        name="companyKeyWords"
        control={control}
        defaultValue={[]}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            className="mt-8 mb-16"
            multiple
            freeSolo
            options={[]}
            value={value}
            onChange={(event, newValue) => {
              onChange(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="چندین کلمه کلیدی را انتخاب کنید"
                label="کلمات کلیدی"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        )}
      />

      <Controller
        name="companyTags"
        control={control}
        defaultValue={[]}
        render={({ field: { onChange, value } }) => (
          <Autocomplete
            className="mt-8 mb-16"
            multiple
            freeSolo
            options={[]}
            value={value}
            onChange={(event, newValue) => {
              onChange(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="چندین برچسب را انتخاب کنید"
                label="برچسب ها"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        )}
      />
    </div>
  );
}

export default BasicInfoTab;
