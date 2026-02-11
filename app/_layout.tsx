import { AuthProvider } from "@/src/providers/AuthProvider";
import { MessageProvider } from "@/src/providers/MessageProvider";
import * as NavigationBar from "expo-navigation-bar";
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
	const [theme, setTheme] = useState(MD3DarkTheme);

	useEffect(() => {
		NavigationBar.setButtonStyleAsync(theme.dark ? "light" : "dark");
	}, [theme]);

	const toggleTheme = () => {
		setTheme(theme === MD3LightTheme ? MD3DarkTheme : MD3LightTheme);
	};

	return (
		<GestureHandlerRootView>
			<SafeAreaProvider>
				<PaperProvider theme={theme}>
					<StatusBar
						barStyle={theme.dark ? "light-content" : "dark-content"}
						backgroundColor={theme.colors.background}
					/>

					<AuthProvider>
						<MessageProvider>
							<Slot />
						</MessageProvider>
					</AuthProvider>
				</PaperProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
