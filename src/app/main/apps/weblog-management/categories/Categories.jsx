import GlobalStyles from '@mui/material/GlobalStyles';
import CategoriesHeader from './CategoriesHeader';
import CategoriesContent from './CategoriesContent';

/**
 * The Categories page.
 */
function Categories() {
  return (
    <>
      <GlobalStyles
        styles={() => ({
          '#root': {
            maxHeight: '100vh'
          }
        })}
      />
      <div className="w-full h-full container flex flex-col">
        <CategoriesHeader />
        <CategoriesContent />
      </div>
    </>
  );
}

export default Categories;
