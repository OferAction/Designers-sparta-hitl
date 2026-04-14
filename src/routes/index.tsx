import { ReactFlowProvider } from "@xyflow/react";
import { createBrowserRouter, matchRoutes, useLocation } from "react-router-dom";

import AdminRoute from "@/components/common/AdminRoute";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AdminSettingsPage from "@/layouts/AdminSettingsLayout";
import CanvasFileLayout from "@/layouts/CanvasFileLayout";
import HQLayout from "@/hq/layout";
import RootLayout from "@/layouts/RootLayout";
import HQOverviewPage from "@/hq/pages/overview";
import HQReviewsPage from "@/hq/pages/reviews";
import { queryClient } from "@/lib/queryClient";
import {
  ArchiveListing,
  ArchivedFolderListing,
  TemplateListing,
  TemplateActionButton,
  FileActionButton,
  FolderActionButton,
  HomeFolderListing,
  WorkspaceListing,
} from "@/modules/workspace";
import { getArchivedFolderFiles, getFolderFiles } from "@/modules/workspace/services";
import DashboardTab from "@/pages/admin-dashboard";
import MembersTab from "@/pages/admin-members";
import AdminRequests from "@/pages/admin-requests";
import AdminRolesAndPermissions from "@/pages/admin-roles-and-permissions";
import AuthCallbackPage from "@/pages/auth-callback";
import BatchRunView from "@/pages/batchRunView";
import ConnectorsCallback from "@/pages/connectorsCallback";
import Dataset from "@/pages/dataset";
import Evaluation from "@/pages/evaluation";
import Flow from "@/pages/flow";
import FlowHistory from "@/pages/history";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import Monitoring from "@/pages/monitoring";
import Settings from "@/pages/settings";
import Subflow from "@/pages/subflow";
import Subflowhistory from "@/pages/subflowhistory";
import ViewSubflow from "@/pages/viewSubflow";

const router = createBrowserRouter([
  {
    children: [
      // Authentication routes (public)
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallbackPage />,
      },
      {
        path: "/EmailConnector/callback",
        element: <ConnectorsCallback />,
      },
      // HQ Dashboard — standalone layout (no ProtectedRoute, no RootLayout)
      {
        path: "/hq",
        element: <HQLayout />,
        children: [
          {
            index: true,
            element: <HQOverviewPage />,
          },
          {
            path: "reviews",
            element: <HQReviewsPage />,
          },
        ],
      },
      // Protected routes
      {
        element: (
          <ProtectedRoute>
            <ReactFlowProvider>
              <RootLayout />
            </ReactFlowProvider>
          </ProtectedRoute>
        ),
    children: [
      {
        path: "/",
        element: <Home />,
        children: [
          {
            index: true,
            element: <WorkspaceListing />,
            handle: {
              getTitle: () => "Home",
              action: <FolderActionButton />,
            },
          },
          {
            path: "folder/:folderId",
            element: <HomeFolderListing />,
            handle: {
              back: () => "/",
              getTitle: async ({ folderId }: { folderId: string }) => {
                if (!folderId) {
                  throw new Error("Unexpected url params, folderId is required");
                }
                const name = (await queryClient.fetchQuery(getFolderFiles(folderId))).name;
                return name ?? "Unknown Folder";
              },
              action: <FileActionButton />,
            },
          },
        ],
      },
      {
        path: "templates",
        element: <Home isTemplateList />,
        index: false,
        children: [
          {
            path: "",
            element: <TemplateListing />,
            handle: {
              getTitle: () => "Subflows & Exceptions",
              action: <TemplateActionButton />,
            },
          },
        ],
      },
      {
        path: "archive",
        element: <Home />,
        children: [
          {
            path: "",
            element: <ArchiveListing />,
            handle: {
              getTitle: () => "Archive",
            },
          },
          {
            path: "folder/:folderId",
            element: <ArchivedFolderListing />,
            handle: {
              back: () => "/archive",
              getTitle: async ({ folderId }: { folderId: string }) => {
                if (!folderId) {
                  throw new Error("Unexpected url params, folderId is required");
                }
                const name = (await queryClient.fetchQuery(getArchivedFolderFiles(folderId))).name;
                return name ? `Archived / ${name}` : "Unknown Folder";
              },
            },
          },
        ],
      },
      {
        path: "/canvas/:folderId/:fileId",
        element: <CanvasFileLayout />,
        children: [
          {
            path: ":configId?/subflow",
            element: <Subflow />,
            index: true,
          },
          {
            path: ":configId?",
            element: <Flow />,
          },
          {
            path: ":configId?/subflow/:subflowConfigId",
            element: <ViewSubflow />,
          },
          {
            path: ":configId?/dataset",
            element: <Dataset />,
          },
          {
            path: ":configId?/history",
            element: <FlowHistory />,
          },
          {
            path: ":configId?/subflowhistory",
            element: <Subflowhistory />,
          },
          {
            path: ":configId/evaluation",
            element: <Evaluation />,
          },
          {
            path: ":configId/monitoring",
            element: <Monitoring />,
          },
          {
            path: ":currentConfigId/evaluation/:batchId/version/:configId/property/:propertyPath/metric/:columnId/:metricName?",
            element: <BatchRunView />,
          },
          {
            path: ":configId/monitoring/property/:propertyPath/metric/:columnId/:metricName?",
            element: <BatchRunView />,
          },
        ],
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "settings/admin",
        element: (
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardTab />,
          },
          {
            path: "dashboard",
            element: <DashboardTab />,
          },
          {
            path: "members",
            element: <MembersTab />,
          },
          {
            path: "requests",
            element: <AdminRequests />,
          },
          {
            path: "roles-permissions",
            element: <AdminRolesAndPermissions />,
          },
        ],
      },
    ],
      },
    ],
  },
]);

export default router;

export const useCurrentPath = () => {
  const location = useLocation();
  const routes = matchRoutes(router.routes, location) || [];

  return (
    routes
      .map(({ route }) => route.path)
      .filter(Boolean)
      .join("/") || null
  );
};
