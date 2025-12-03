import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "./(providers)/AuthProvider";

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
				<ActivityIndicator size={60} />
			</View>
		);
	}

	if (session) {
		return <Redirect href="/(tabs)/home" />;
	}

	return <Redirect href="/(auth)/login" />;
}
