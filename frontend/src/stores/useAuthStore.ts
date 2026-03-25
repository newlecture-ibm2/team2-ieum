// 인증 상태 전역 스토어 (Zustand)
//
// TODO: zustand 설치 후 구현
// npm install zustand

// import { create } from 'zustand';

export interface AuthState {
  user: {
    id: number;
    email: string;
    nickname: string;
    role: "USER" | "ADMIN";
  } | null;
  isLoggedIn: boolean;
  setUser: (user: AuthState["user"]) => void;
  clearUser: () => void;
}

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   isLoggedIn: false,
//   setUser: (user) => set({ user, isLoggedIn: !!user }),
//   clearUser: () => set({ user: null, isLoggedIn: false }),
// }));
