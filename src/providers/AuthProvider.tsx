import { supabase } from "@/src/services/supabase";
import { Session } from "@supabase/supabase-js";
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

// 1️ Define context type
type AuthContextType = {
	session: Session | null;
	loading: boolean;
};

// 2️ Create context
const AuthContext = createContext<AuthContextType>({
	session: null,
	loading: true,
});

// 3️ Hook to use context in any screen
export const useAuth = () => useContext(AuthContext);

// 4️ Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Load initial session
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});

		// Listen for login/logout
		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setSession(session);
			}
		);

		return () => listener.subscription?.unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ session, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export default AuthProvider;
