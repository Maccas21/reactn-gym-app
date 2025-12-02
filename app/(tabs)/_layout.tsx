import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../(providers)/AuthProvider";

export default function TabsLayout() {
	const { session, loading } = useAuth();

	if (loading) return null;

	// Protect all screens inside (tabs)
	if (!session) return <Redirect href="/(auth)/login" />;

	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="home" options={{ title: "Home" }} />
			<Tabs.Screen name="settings" options={{ title: "Settings" }} />
		</Tabs>
	);
}
