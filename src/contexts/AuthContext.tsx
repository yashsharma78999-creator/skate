import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { profileService } from "@/services/database";
import { Profile } from "@/types/database";

export interface User extends Profile {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const timeoutId = setTimeout(() => {
      console.warn("Auth check timeout - moving forward");
      setIsLoading(false);
    }, 5000); // 5 second timeout

    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      clearTimeout(timeoutId);

      if (authUser) {
        try {
          const profile = await profileService.getById(authUser.id);
          setUser({
            ...profile,
            email: authUser.email || profile.email,
          });
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await profileService.getById(session.user.id);
          setUser({
            ...profile,
            email: session.user.email || profile.email,
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const profile = await profileService.getById(data.user.id);
      setUser({
        ...profile,
        email: data.user.email || profile.email,
      });
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create profile
      const profile = await profileService.create({
        id: data.user.id,
        email,
        full_name: fullName || null,
        role: "customer",
        avatar_url: null,
      });

      setUser({
        ...profile,
        email: data.user.email || email,
      });
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
