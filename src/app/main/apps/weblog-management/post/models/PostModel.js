/**
 * Post model for creating/updating posts
 */
const PostModel = (data) => ({
  title: data?.title || '',
  slug: data?.slug || '',
  content: data?.content || '',
  excerpt: data?.excerpt || '',
  featuredImage: data?.featuredImage || '',
  status: data?.status || 'DRAFT',
  categoryId: data?.categoryId || null,
  tagIds: data?.tagIds || [],
  metaTitle: data?.metaTitle || '',
  metaDescription: data?.metaDescription || '',
  canonicalUrl: data?.canonicalUrl || '',
  publishedAt: data?.publishedAt || null,
  meta: data?.meta || {}
});

export default PostModel;
