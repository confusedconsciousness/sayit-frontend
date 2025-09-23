import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
    '/',                // home page
    '/sign-in(.*)',     // sign-in and its subroutes
    '/sign-up(.*)',     // sign-up and its subroutes
    '/:space',        // space page (view only)
    '/:space/:postId' // post page with comments view
])

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
    runtime: 'nodejs'
}