import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import HomePage from '../pages/HomePage'
import CreatePage from '../pages/CreatePage'
import DetailPage from '../pages/DetailPage'
import EditPage from '../pages/EditPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'create',
        element: <CreatePage />
      },
      {
        path: 'detail/:id',
        element: <DetailPage />
      },
      {
        path: 'edit/:id',
        element: <EditPage />
      }
    ]
  }
])