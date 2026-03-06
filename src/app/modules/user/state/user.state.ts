export interface UserState {
    id: string | null;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
}

export const initialUserState: UserState = {
    id: null,
    email: null,
    fullName: null,
    avatarUrl: null
};
