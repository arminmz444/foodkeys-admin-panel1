/**
 * Tag model for creating/updating tags
 */
const TagModel = (data) => ({
  name: data?.name || '',
  slug: data?.slug || '',
  metaTitle: data?.metaTitle || '',
  metaDescription: data?.metaDescription || ''
});

export default TagModel;
