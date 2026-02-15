import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const WeblogApp = lazy(() => import('./WeblogApp'));
const Posts = lazy(() => import('./posts/Posts'));
const Post = lazy(() => import('./post/Post'));
const Categories = lazy(() => import('./categories/Categories'));
const Category = lazy(() => import('./category/Category'));
const Tags = lazy(() => import('./tags/Tags'));
const Tag = lazy(() => import('./tag/Tag'));
const Media = lazy(() => import('./media/Media'));
const Dashboard = lazy(() => import('./dashboard/Dashboard'));

/**
 * The Weblog Management app configuration.
 */
const WeblogAppConfig = {
  settings: {
    layout: {}
  },
  routes: [
    {
      path: 'apps/weblog',
      element: <WeblogApp />,
      children: [
        {
          path: '',
          element: <Navigate to="dashboard" />
        },
        {
          path: 'dashboard',
          element: <Dashboard />
        },
        {
          path: 'posts',
          element: <Posts />
        },
        {
          path: 'posts/:postId/*',
          element: <Post />
        },
        {
          path: 'categories',
          element: <Categories />
        },
        {
          path: 'categories/:categoryId/*',
          element: <Category />
        },
        {
          path: 'tags',
          element: <Tags />
        },
        {
          path: 'tags/:tagId/*',
          element: <Tag />
        },
        {
          path: 'media',
          element: <Media />
        }
      ]
    }
  ]
};

export default WeblogAppConfig;
