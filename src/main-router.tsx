import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { useRenderContext } from './providers/render-context'
import NotFound from './exceptions/NotFound'
import Home from './routes/Home'
import About from './routes/About'
import Blog from './routes/Blog'
import Post from './routes/Post'
import Category from './routes/Category'
import Tag from './routes/Tag'
import Author from './routes/Author'
import Categories from './routes/Categories'
import Tags from './routes/Tags'
import Authors from './routes/Authors'
import Search from './routes/Search'
import Test from './routes/Test'

// Client router must match server structure for hydration
export default function MainRouter() {
  const { context } = useRenderContext()
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout context={context} sidebar="none"><Home /></MainLayout>} />
        <Route path="/about" element={<MainLayout context={context} sidebar="left"><About /></MainLayout>} />
        <Route path="/blog" element={<MainLayout context={context}><Blog /></MainLayout>} />
        <Route path="/search" element={<MainLayout context={context}><Search /></MainLayout>} />
        <Route path="/categories" element={<MainLayout context={context}><Categories /></MainLayout>} />
        <Route path="/tags" element={<MainLayout context={context}><Tags /></MainLayout>} />
        <Route path="/authors" element={<MainLayout context={context}><Authors /></MainLayout>} />
        <Route path="/category/:slug" element={<MainLayout context={context}><Category /></MainLayout>} />
        <Route path="/tag/:slug" element={<MainLayout context={context}><Tag /></MainLayout>} />
        <Route path="/author/:slug" element={<MainLayout context={context}><Author /></MainLayout>} />
        <Route path="/posts/:slug" element={<MainLayout context={context}><Post /></MainLayout>} />
        <Route path="/test" element={<MainLayout context={context} sidebar="none"><Test /></MainLayout>} />
        <Route path="*" element={<MainLayout context={context} sidebar="none"><NotFound /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  )
}
