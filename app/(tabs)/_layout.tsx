import { useAuth } from "@/src/providers/AuthProvider";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function TabsLayout() {
	const { session, loading } = useAuth();

	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	// Protect all screens inside (tabs)
	if (!session) return <Redirect href="/(auth)/login" />;

	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="home" options={{ title: "Home" }} />
			<Tabs.Screen name="settings" options={{ title: "Settings" }} />
		</Tabs>
	);
}
