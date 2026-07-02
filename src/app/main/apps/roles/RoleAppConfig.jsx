import { lazy } from "react";

const RoleApp = lazy(() => import("./RoleApp.jsx"));

/**
 * The Role management app configuration.
 */
const RoleAppConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: "apps/roles",
      element: <RoleApp />,
    },
  ],
};

export default RoleAppConfig;
