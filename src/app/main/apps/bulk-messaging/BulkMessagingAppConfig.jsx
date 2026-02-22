import { lazy } from "react";
import { Navigate } from "react-router-dom";

const BulkMessagingOutlet = lazy(() => import("./BulkMessagingOutlet"));
const BulkMessagingCompose = lazy(() => import("./compose/BulkMessagingCompose"));
const BulkMessagingTasks = lazy(() => import("./tasks/BulkMessagingTasks"));
const BulkMessagingReport = lazy(() => import("./report/BulkMessagingReport"));

const BulkMessagingAppConfig = {
  settings: {
    layout: {
      config: {
        navbar: { display: true },
        toolbar: { display: true },
        footer: { display: false },
        leftSidePanel: { display: true },
      },
    },
  },
  routes: [
    {
      path: "apps/bulk-messaging",
      element: <BulkMessagingOutlet />,
      children: [
        { path: "", element: <Navigate to="compose" /> },
        { path: "compose", element: <BulkMessagingCompose /> },
        { path: "tasks", element: <BulkMessagingTasks /> },
        { path: "tasks/:taskId/report", element: <BulkMessagingReport /> },
      ],
    },
  ],
};

export default BulkMessagingAppConfig;
