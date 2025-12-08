import { AuthProvider } from "@/src/providers/AuthProvider";
import { MessageProvider } from "@/src/providers/MessageProvider";
import { Slot } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
	return (
		<PaperProvider>
			<AuthProvider>
				<MessageProvider>
					<Slot />
				</MessageProvider>
			</AuthProvider>
		</PaperProvider>
	);
}
