import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

export default function MainRouter() {
  return (
    <BrowserRouter future={{ v7_startTransition: true }}>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
          <Route path="search" element={<Search />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tags" element={<Tags />} />
          <Route path="authors" element={<Authors />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="tag/:slug" element={<Tag />} />
          <Route path="author/:slug" element={<Author />} />
          <Route path="posts/:slug" element={<Post />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/test" element={<Test />} errorElement={<ErrorBoundary />} />
      </Routes>
    </BrowserRouter>
  )
}
