export interface AuthenticationState {
    isAuthenticated: boolean;
    isAuthResolved: boolean;
    isLoading: boolean;
}

export const initialAuthenticationState: AuthenticationState = {
    isAuthenticated: false,
    isAuthResolved: false,
    isLoading: false,
};
