import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from '@/App'
import NotFound from '@/exceptions/NotFound'
import ErrorBoundary from '@/exceptions/ErrorBoundary'
import Home from '@/routes/Home'
import About from '@/routes/About'
import Blog from '@/routes/Blog'
import Post from '@/routes/Post'
import Category from '@/routes/Category'
import Tag from '@/routes/Tag'
import Author from '@/routes/Author'
import Categories from '@/routes/Categories'
import Tags from '@/routes/Tags'
import Authors from '@/routes/Authors'
import Search from '@/routes/Search'
import Test from '@/routes/Test'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'blog', element: <Blog /> },
      { path: 'search', element: <Search /> },
      { path: 'categories', element: <Categories /> },
      { path: 'tags', element: <Tags /> },
      { path: 'authors', element: <Authors /> },
      { path: 'category/:slug', element: <Category /> },
      { path: 'tag/:slug', element: <Tag /> },
      { path: 'author/:slug', element: <Author /> },
      { path: 'posts/:slug', element: <Post /> },
      { path: '*', element: <NotFound /> }
    ]
  },
  {
    path: '/test',
    element: <Test />
  }
], {
  future: { v7_startTransition: true }
})

export default function MainRouter() {
  return <RouterProvider router={router} />
}
