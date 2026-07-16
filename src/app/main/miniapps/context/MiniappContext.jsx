import React, { createContext, useContext, useMemo, useState } from 'react';

const MiniAppContext = createContext(null);

export const useMiniapp = () => useContext(MiniAppContext);

/**
 * Local-only MiniApp context (no /api/miniapps backend calls).
 * Components can register miniapps in memory via setMiniapps / upload stubs.
 */
export const MiniAppProvider = ({ children, initialMiniapps = [] }) => {
  const [miniapps, setMiniapps] = useState(initialMiniapps);
  const [loading] = useState(false);
  const [error] = useState(null);

  const value = useMemo(() => {
    const getAccessibleMiniapps = () => miniapps;

    const getMiniapp = (id) => miniapps.find((app) => String(app.id) === String(id));

    const fetchMiniapps = async () => miniapps;

    const uploadMiniapp = async () => {
      throw new Error('MiniApp upload API has been removed');
    };

    return {
      miniapps,
      loading,
      error,
      setMiniapps,
      fetchMiniapps,
      getAccessibleMiniapps,
      getMiniapp,
      uploadMiniapp
    };
  }, [miniapps, loading, error]);

  return <MiniAppContext.Provider value={value}>{children}</MiniAppContext.Provider>;
};

export default MiniAppContext;
