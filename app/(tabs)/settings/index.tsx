import { supabase } from "@/src/services/supabase";
import { View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

export default function Settings() {
	const theme = useTheme();
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
			}}
		>
			<Text>Edit (tabs)/settings/settings.tsx to edit this screen.</Text>
			<Button mode="contained" onPress={() => supabase.auth.signOut()}>
				Sign Out
			</Button>
		</View>
	);
}
