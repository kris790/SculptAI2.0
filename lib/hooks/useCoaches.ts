// This hook is now deprecated as data is fetched via Next.js API routes in the components.
// It can be removed or kept for potential future client-side-only data fetching.
// For now, it serves as a placeholder.

export function useCoaches() {
    // Logic would go here if we were fetching directly from the client
    // e.g., using Supabase client-side library.
    // Since we're using API routes, this hook is not actively used by the CoachMarketplace component.
    return { coaches: [], loading: false, error: null };
}
