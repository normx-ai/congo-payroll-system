import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware() {
    // Le middleware peut faire des vérifications supplémentaires ici
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employes/:path*',
    '/paie/:path*',
    '/rapports/:path*',
    '/parametres/:path*'
  ]
}