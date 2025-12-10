import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function AuthLayout() {
	const theme = useTheme();

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: theme.colors.background, // stack header background
				},
				headerTintColor: theme.colors.primary, // header text/buttons colour
			}}
		>
			<Stack.Screen name="login" options={{ headerShown: false }} />
			<Stack.Screen
				name="resetpassword"
				options={{
					headerShown: true,
					title: "",
					headerShadowVisible: false,
					headerTransparent: true,
				}}
			/>
		</Stack>
	);
}
