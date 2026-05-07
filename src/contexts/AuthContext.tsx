import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null;
  firstName: string | null;
  lastName: string | null;
  mustChangePassword: boolean;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (lastFetchedUserIdRef.current !== session.user.id) {
          fetchProfile(session.user.id);
        }
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (lastFetchedUserIdRef.current !== session.user.id) {
          fetchProfile(session.user.id);
        }
      } else {
        setRole(null);
        setMustChangePassword(false);
        setLoading(false);
        lastFetchedUserIdRef.current = null;
        if (event === 'SIGNED_OUT') {
          setError(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, force = false) => {
    if (!force && lastFetchedUserIdRef.current === userId && !loading) return;
    lastFetchedUserIdRef.current = userId;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, must_change_password, is_active, first_name, last_name')
        .eq('id', userId)
        .single();
        
      if (error) throw error;

      if (data.is_active === false) {
        setError('Your account has been suspended. Please contact an administrator.');
        await supabase.auth.signOut();
        return;
      }

      setRole(data.role);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setMustChangePassword(!!data.must_change_password);
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setRole('user'); // Fallback
      setMustChangePassword(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, true);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      role, 
      firstName, 
      lastName, 
      mustChangePassword, 
      loading, 
      error, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
