import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function Graph() {
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
			<Text>Edit (tabs)/graph/index.tsx to edit this screen.</Text>
		</View>
	);
}
