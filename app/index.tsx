import { useAuth } from "@/src/providers/AuthProvider";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function Index() {
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

	if (session) {
		return <Redirect href="/(tabs)/home" />;
	}

	return <Redirect href="/(auth)/login" />;
}
