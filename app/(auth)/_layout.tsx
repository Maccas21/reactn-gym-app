// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
	return (
		<Stack>
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
