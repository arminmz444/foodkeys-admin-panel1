import { Navigate, useLocation } from 'react-router-dom';
import { isPageAllowed, getMetaCache } from 'app/store/metaCache';
import FuseLoading from '@fuse/core/FuseLoading';
import { useEffect, useState } from 'react';

/**
 * Page Authorization Wrapper (Authorization v2)
 * 
 * This component checks if the user has access to a page based on the
 * `allowedPages` from the meta cache.
 * 
 * If the page is not allowed OR the page doesn't exist in the allowed list,
 * it shows a uniform 404 to prevent information leakage.
 * 
 * Usage:
 * <PageAuthorization pageId="users">
 *   <UsersPage />
 * </PageAuthorization>
 */
function PageAuthorization({ pageId, children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if meta is loaded
    const meta = getMetaCache();
    
    if (!meta) {
      // Meta not loaded yet, wait a bit
      // In production, this should trigger a meta fetch if needed
      const timeout = setTimeout(() => {
        const metaRetry = getMetaCache();
        if (metaRetry) {
          const allowed = isPageAllowed(pageId);
          setHasAccess(allowed);
        } else {
          // No meta available, deny access for security
          setHasAccess(false);
        }
        setChecking(false);
      }, 100);
      
      return () => clearTimeout(timeout);
    }
    
    const allowed = isPageAllowed(pageId);
    setHasAccess(allowed);
    setChecking(false);
  }, [pageId, location]);

  if (checking) {
    return <FuseLoading />;
  }

  if (!hasAccess) {
    // Redirect to uniform 404 page
    return <Navigate to="/404" replace />;
  }

  return children;
}

export default PageAuthorization;
