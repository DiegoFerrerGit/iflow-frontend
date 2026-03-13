export interface AuthenticationState {
    isAuthenticated: boolean;
    isAuthResolved: boolean;
    isLoggingIn: boolean;
}

export const initialAuthenticationState: AuthenticationState = {
    isAuthenticated: false,
    isAuthResolved: false,
    isLoggingIn: false,
};
