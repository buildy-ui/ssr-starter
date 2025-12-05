import { Outlet, useLocation } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'

export default function App() {
  const location = useLocation()
  
  const sidebarConfig: Record<string, 'left' | 'right' | 'none'> = {
    '/about': 'left',
    '/': 'none',
  }

  const getSidebarPosition = (): 'left' | 'right' | 'none' => {
    return sidebarConfig[location.pathname] || 'right'
  }

  return (
    <MainLayout sidebar={getSidebarPosition()}>
      <Outlet />
    </MainLayout>
  )
}
