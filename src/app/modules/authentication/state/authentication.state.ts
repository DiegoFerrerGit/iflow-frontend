export interface AuthenticationState {
    isAuthenticated: boolean;
    isAuthResolved: boolean;
}

export const initialAuthenticationState: AuthenticationState = {
    isAuthenticated: false,
    isAuthResolved: false,
};
