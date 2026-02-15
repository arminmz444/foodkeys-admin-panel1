/**
 * Category model for creating/updating categories
 */
const CategoryModel = (data) => ({
  name: data?.name || '',
  slug: data?.slug || '',
  description: data?.description || '',
  parentId: data?.parentId || null,
  metaTitle: data?.metaTitle || '',
  metaDescription: data?.metaDescription || ''
});

export default CategoryModel;
