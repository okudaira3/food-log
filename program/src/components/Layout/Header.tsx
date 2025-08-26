import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const location = useLocation()
  
  return (
    <header className="bg-primary shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-textColor">
            🍽️ フードログ
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-accent text-white' 
                  : 'text-textColor hover:text-accent'
              }`}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              ホーム
            </Link>
            <Link
              to="/create"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/create' 
                  ? 'bg-accent text-white' 
                  : 'text-textColor hover:text-accent'
              }`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新しい記録
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}