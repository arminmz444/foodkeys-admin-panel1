import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import _ from '@lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CategoryHeader from './CategoryHeader';
import CategoryForm from './CategoryForm';
import { useGetWeblogCategoryQuery } from '../WeblogApi';
import CategoryModel from './models/CategoryModel';

/**
 * Form Validation Schema
 */
const schema = z.object({
  name: z.string().min(1, 'نام دسته‌بندی الزامی است').min(2, 'نام باید حداقل ۲ کاراکتر باشد')
});

/**
 * The Category page.
 */
function Category() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const routeParams = useParams();
  const { categoryId } = routeParams;
  const isNew = categoryId === 'new';

  const {
    data: category,
    isLoading,
    isError
  } = useGetWeblogCategoryQuery(categoryId, { skip: isNew });

  const methods = useForm({
    mode: 'onChange',
    defaultValues: CategoryModel({}),
    resolver: zodResolver(schema)
  });

  const { reset, watch } = methods;
  const form = watch();

  useEffect(() => {
    if (isNew) {
      reset(CategoryModel({}));
    }
  }, [isNew, reset]);

  useEffect(() => {
    if (category) {
      reset(CategoryModel(category));
    }
  }, [category, reset]);

  if (isLoading) {
    return <FuseLoading />;
  }

  if (isError && !isNew) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          دسته‌بندی مورد نظر یافت نشد!
        </Typography>
        <Button
          className="mt-24"
          component={Link}
          variant="outlined"
          to="/apps/weblog/categories"
          color="inherit"
        >
          بازگشت به لیست دسته‌بندی‌ها
        </Button>
      </motion.div>
    );
  }

  if (_.isEmpty(form) || (category && routeParams.categoryId !== String(category.id) && !isNew)) {
    return <FuseLoading />;
  }

  return (
    <FormProvider {...methods}>
      <FusePageCarded
        header={<CategoryHeader />}
        content={
          <div className="p-16 sm:p-24 max-w-3xl w-full mx-auto">
            <CategoryForm />
          </div>
        }
        scroll={isMobile ? 'normal' : 'content'}
      />
    </FormProvider>
  );
}

export default Category;
