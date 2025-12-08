import { supabase } from "@/src/services/supabase";
import { Button, Text, View } from "react-native";

export default function Settings() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Text>Edit (tabs)/settings/settings.tsx to edit this screen.</Text>
			<View>
				<Button
					title="Sign Out"
					onPress={() => supabase.auth.signOut()}
				/>
			</View>
		</View>
	);
}
