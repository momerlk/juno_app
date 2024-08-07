import React from 'react';
import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './storage';
import * as api from "../backend/api"

// Define the context type
type AuthContextType = {
  signIn: (email : string, password : string) => any;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  signIn: (email : string, password : string) => Promise<boolean>,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

// Define the props for the provider
interface SessionProviderProps extends PropsWithChildren<{}> {}

export function SessionProvider({ children }: SessionProviderProps) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email : string, password : string) => {
          // Perform sign-in logic here
          const ok = await api.signIn(email, password);
          if (ok){
            setSession('true');
          }
          return ok;
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
