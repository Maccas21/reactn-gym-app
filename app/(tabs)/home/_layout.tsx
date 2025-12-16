import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function StackLayout() {
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
			<Stack.Screen
				name="index"
				options={{ headerTitle: "Home Screen" }}
			/>
			<Stack.Screen
				name="addexercise"
				options={{ headerTitle: "Exercises" }}
			/>
		</Stack>
	);
}
