import React, { Suspense, useState, useEffect } from 'react';
import { Alert } from '@mui/material';
import FuseLoading from '@fuse/core/FuseLoading';

/**
 * Loads a remote module using Module Federation
 */
const loadRemoteModule = async (miniapp) => {
  if (!miniapp) return null;

  try {
    // Create a unique scope name based on the miniapp name
    const scopeName = `miniapp_${miniapp.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Construct the remoteEntry URL (static hosting, not /api/miniapps)
    const remoteEntryUrl = miniapp.remoteEntryUrl
      || `/static/miniapps/${miniapp.name}/${miniapp.version}/remoteEntry.js`;

    // Check if the remote script is already loaded
    if (!window[scopeName]) {
      // Load the remote entry script
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = remoteEntryUrl;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Initialize sharing
    // @ts-ignore
    await __webpack_init_sharing__('default');

    // Get the container
    // @ts-ignore
    const container = window[scopeName];

    // Initialize the container
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);

    // Get the factory function
    const factory = await container.get('./MiniApp');

    // Create the React component
    const MiniApp = factory();

    return MiniApp;
  } catch (error) {
    console.error(`Error loading remote module for ${miniapp.name}:`, error);
    throw error;
  }
};

/**
 * Federation MiniApp Loader
 * Dynamically loads a MiniApp using Module Federation from provided miniapp data
 */
function FederationMiniAppLoader({ miniapp: miniappProp, companyId }) {
  const [miniapp, setMiniapp] = useState(miniappProp || null);
  const [loading, setLoading] = useState(Boolean(miniappProp));
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (!miniappProp) {
      setMiniapp(null);
      setError('MiniApp data must be provided');
      setLoading(false);
      return;
    }

    setMiniapp(miniappProp);
    setError(null);
  }, [miniappProp]);

  // Load the federated component
  useEffect(() => {
    if (!miniapp || miniapp.integrationType !== 'moduleFederation') {
      setLoading(false);
      return;
    }

    const loadComponent = async () => {
      try {
        setLoading(true);
        const RemoteComponent = await loadRemoteModule(miniapp);
        setComponent(() => RemoteComponent);
      } catch (err) {
        console.error('Error loading federated component:', err);
        setError(`Failed to load component: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [miniapp]);

  if (loading) {
    return <FuseLoading />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!miniapp) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        MiniApp not found
      </Alert>
    );
  }

  if (miniapp.integrationType !== 'moduleFederation') {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        This MiniApp does not use Module Federation integration type.
      </Alert>
    );
  }

  if (!Component) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Failed to load MiniApp component
      </Alert>
    );
  }

  return (
    <Suspense fallback={<FuseLoading />}>
      <Component
        companyId={companyId || miniapp.targetCompanyId}
        miniappId={miniapp.id}
        {...miniapp.componentProps}
      />
    </Suspense>
  );
}

export default FederationMiniAppLoader;
