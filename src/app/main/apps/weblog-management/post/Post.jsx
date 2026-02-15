import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import _ from '@lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PostHeader from './PostHeader';
import BasicInfoTab from './tabs/BasicInfoTab';
import ContentTab from './tabs/ContentTab';
import SeoTab from './tabs/SeoTab';
import MediaTab from './tabs/MediaTab';
import { useGetWeblogPostQuery } from '../WeblogApi';
import PostModel from './models/PostModel';

/**
 * Form Validation Schema
 */
const schema = z.object({
  title: z.string().min(1, 'عنوان پست الزامی است').min(3, 'عنوان پست باید حداقل ۳ کاراکتر باشد'),
  content: z.string().min(1, 'محتوای پست الزامی است')
});

/**
 * The Post page.
 */
function Post() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const routeParams = useParams();
  const { postId } = routeParams;
  const isNew = postId === 'new';

  const {
    data: post,
    isLoading,
    isError
  } = useGetWeblogPostQuery(
    { idOrSlug: postId },
    { skip: isNew }
  );

  const [tabValue, setTabValue] = useState(0);

  const methods = useForm({
    mode: 'onChange',
    defaultValues: PostModel({}),
    resolver: zodResolver(schema)
  });

  const { reset, watch } = methods;
  const form = watch();

  useEffect(() => {
    if (isNew) {
      reset(PostModel({}));
    }
  }, [isNew, reset]);

  useEffect(() => {
    if (post) {
      // Transform post data to form format
      const formData = {
        ...post,
        tagIds: post.tags?.map((t) => t.tagId) || []
      };
      reset(PostModel(formData));
    }
  }, [post, reset]);

  /**
   * Tab Change
   */
  function handleTabChange(event, value) {
    setTabValue(value);
  }

  if (isLoading) {
    return <FuseLoading />;
  }

  /**
   * Show Message if the requested post does not exist
   */
  if (isError && !isNew) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Typography color="text.secondary" variant="h5">
          پست مورد نظر یافت نشد!
        </Typography>
        <Button
          className="mt-24"
          component={Link}
          variant="outlined"
          to="/apps/weblog/posts"
          color="inherit"
        >
          بازگشت به لیست پست‌ها
        </Button>
      </motion.div>
    );
  }

  /**
   * Wait while post data is loading and form is set
   */
  if (_.isEmpty(form) || (post && routeParams.postId !== String(post.id) && !isNew)) {
    return <FuseLoading />;
  }

  return (
    <FormProvider {...methods}>
      <FusePageCarded
        header={<PostHeader />}
        content={
          <>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="secondary"
              textColor="secondary"
              variant="scrollable"
              scrollButtons="auto"
              classes={{ root: 'w-full h-64 border-b-1' }}
            >
              <Tab className="h-64" label="اطلاعات پایه" />
              <Tab className="h-64" label="محتوا" />
              <Tab className="h-64" label="تنظیمات سئو" />
              <Tab className="h-64" label="رسانه‌ها" />
            </Tabs>
            <div className="p-16 sm:p-24 max-w-4xl w-full mx-auto">
              <div className={tabValue !== 0 ? 'hidden' : ''}>
                <BasicInfoTab />
              </div>

              <div className={tabValue !== 1 ? 'hidden' : ''}>
                <ContentTab />
              </div>

              <div className={tabValue !== 2 ? 'hidden' : ''}>
                <SeoTab />
              </div>

              <div className={tabValue !== 3 ? 'hidden' : ''}>
                <MediaTab postId={postId} />
              </div>
            </div>
          </>
        }
        scroll={isMobile ? 'normal' : 'content'}
      />
    </FormProvider>
  );
}

export default Post;
