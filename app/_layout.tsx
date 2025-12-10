import { AuthProvider } from "@/src/providers/AuthProvider";
import { MessageProvider } from "@/src/providers/MessageProvider";
import * as NavigationBar from "expo-navigation-bar";
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
	const [theme, setTheme] = useState(MD3DarkTheme);

	useEffect(() => {
		NavigationBar.setButtonStyleAsync(theme.dark ? "light" : "dark");
	}, [theme]);

	const toggleTheme = () => {
		setTheme(theme === MD3LightTheme ? MD3DarkTheme : MD3LightTheme);
	};

	return (
		<PaperProvider theme={theme}>
			<StatusBar
				barStyle={theme.dark ? "light-content" : "dark-content"}
				backgroundColor={theme.colors.background}
			/>

			<SafeAreaProvider>
				<AuthProvider>
					<MessageProvider>
						<SafeAreaView
							style={{ flex: 1 }}
							edges={["top", "bottom"]}
						>
							<Slot />
						</SafeAreaView>
					</MessageProvider>
				</AuthProvider>
			</SafeAreaProvider>
		</PaperProvider>
	);
}
