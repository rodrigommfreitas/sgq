import React, {createContext, useContext, useState, useEffect} from 'react';
import type {User} from '../types';
import {apiLogout, refresh} from "@/api/auth.ts";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string) => Promise<void>;
    setAuth: (data: { user: User; accessToken: string }) => void;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {

                const data = await refresh()
                setAuth({
                    accessToken: data.accessToken,
                    user: {
                        id: data.userId,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                    },
                })
            } catch (err) {
                console.log("No valid session found", err)
                logout()
            } finally {
                setIsLoading(false)
            }
        }

        checkSession()
    }, [])


    const login = async (email: string) => {
        setIsLoading(true);
        // Simulate API Call
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const mockUser: User = {
                    id: 1,
                    firstName: 'Demo',
                    lastName: 'User',
                    email: email,
                    role: 'admin',
                };
                const mockToken = 'mock-jwt-token-xyz-123';

                setUser(mockUser);
                setToken(mockToken);

                // In a real app, token goes to memory, refresh token to httpOnly cookie.
                // For this demo persistence, we use localStorage.
                localStorage.setItem('nexus_access_token', mockToken);
                localStorage.setItem('nexus_user', JSON.stringify(mockUser));

                setIsLoading(false);
                resolve();
            }, 1000);
        });
    };

    const setAuth = ({user, accessToken}: any) => {
        setUser(user)
        setToken(accessToken)
    }

    const logout = async () => {
        try {
            await apiLogout();
        } catch (err: any) {
            // even if backend fails, we still clear frontend state
        } finally {
            setAuth({user: null, accessToken: null});
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            setAuth,
            logout,
            isLoading,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
