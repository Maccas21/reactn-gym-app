import { useAuth } from "@/app/providers/AuthProvider";
import { Redirect } from "expo-router";

export default function Index() {
	const { session, loading } = useAuth();

	if (loading) return null;

	if (session) {
		return <Redirect href="/(tabs)/home" />;
	}

	return <Redirect href="/(auth)/login" />;
}
