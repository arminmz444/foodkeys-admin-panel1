import FuseLoading from '@fuse/core/FuseLoading';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import _ from '@lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TagHeader from './TagHeader';
import TagForm from './TagForm';
import { useGetWeblogTagQuery } from '../WeblogApi';
import TagModel from './models/TagModel';

/**
 * Form Validation Schema
 */
const schema = z.object({
  name: z.string().min(1, 'نام برچسب الزامی است').min(2, 'نام برچسب باید حداقل ۲ کاراکتر باشد')
});

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

/**
 * The Tag page.
 */
function Tag() {
  const routeParams = useParams();
  const { tagId } = routeParams;
  const isNew = tagId === 'new';

  const {
    data: tag,
    isLoading,
    isError
  } = useGetWeblogTagQuery(
    { idOrSlug: tagId },
    { skip: isNew }
  );

  const methods = useForm({
    mode: 'onChange',
    defaultValues: TagModel({}),
    resolver: zodResolver(schema)
  });

  const { reset, watch } = methods;
  const form = watch();

  useEffect(() => {
    if (isNew) {
      reset(TagModel({}));
    }
  }, [isNew, reset]);

  useEffect(() => {
    if (tag) {
      reset(TagModel(tag));
    }
  }, [tag, reset]);

  if (isLoading) {
    return <FuseLoading />;
  }

  /**
   * Show Message if the requested tag does not exist
   */
  if (isError && !isNew) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          برچسب مورد نظر یافت نشد!
        </Typography>
        <Button
          className="mt-24"
          component={Link}
          variant="outlined"
          to="/apps/weblog/tags"
          color="inherit"
        >
          بازگشت به لیست برچسب‌ها
        </Button>
      </motion.div>
    );
  }

  /**
   * Wait while tag data is loading and form is set
   */
  if (_.isEmpty(form) || (tag && routeParams.tagId !== String(tag.id) && !isNew)) {
    return <FuseLoading />;
  }

  return (
    <FormProvider {...methods}>
      <motion.div
        className="flex flex-col w-full h-full"
        variants={pageVariants}
        initial="hidden"
        animate="show"
      >
        <TagHeader />
        <div className="flex-1 overflow-auto">
          <Paper 
            className="p-24 sm:p-32 max-w-3xl w-full mx-auto my-24 rounded-2xl"
            elevation={0}
            sx={{ backgroundColor: 'background.paper' }}
          >
            <TagForm />
          </Paper>
        </div>
      </motion.div>
    </FormProvider>
  );
}

export default Tag;
