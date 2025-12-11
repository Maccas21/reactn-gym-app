import { useAuth } from "@/src/providers/AuthProvider";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function TabsLayout() {
	const { session, loading } = useAuth();
	const theme = useTheme();

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
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarActiveTintColor: theme.colors.primary,
				tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
				tabBarStyle: {
					backgroundColor: theme.colors.surface,
					borderTopColor: theme.colors.outlineVariant,
					borderTopWidth: 1,
					elevation: 0,
					paddingTop: 6,
					paddingBottom: 6,
					height: 65,
				},
				tabBarItemStyle: {
					margin: 0, // remove default margins
					padding: 0,
					justifyContent: "center", // center the icon vertically
				},
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size, focused }) => (
						<MaterialCommunityIcons
							name={
								focused
									? "home-variant"
									: "home-variant-outline"
							}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="graph"
				options={{
					title: "Graph",
					tabBarIcon: ({ color, size, focused }) => (
						<MaterialCommunityIcons
							name={focused ? "chart-box" : "chart-box-outline"}
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color, size, focused }) => (
						<MaterialCommunityIcons
							name={focused ? "cog" : "cog-outline"}
							size={size}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
