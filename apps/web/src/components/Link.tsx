import { useNavigate as useRouterNavigate, useLocation } from 'react-router'

interface LinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function Link({ href, children, className }: LinkProps) {
  const navigate = useRouterNavigate()
  const location = useLocation()
  const isActive = location.pathname === href

  return (
    <a
      href={href}
      className={`${className || ''} ${isActive ? 'active' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        navigate(href)
      }}
    >
      {children}
    </a>
  )
}