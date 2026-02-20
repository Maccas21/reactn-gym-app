import { useSelectedExercises } from "@/src/providers/SelectedExercisesProvider";
import { router } from "expo-router";
import { View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

export default function Home() {
	const theme = useTheme();

	const { selectedExercises, setSelectedExercises } = useSelectedExercises();

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
			}}
		>
			<Text>Edit (tabs)/home/index.tsx to edit this screen.</Text>
			<Button
				mode="contained"
				onPress={() => router.push("/home/addexercise")}
			>
				Add Exercise
			</Button>

			<Button
				mode="contained"
				onPress={() => {
					let test = "";
					selectedExercises.map((item) => {
						test += item.name + ", ";
					});
					console.log(test);
				}}
			>
				Console.log()
			</Button>
			<Button
				mode="contained"
				onPress={() => {
					setSelectedExercises([]);
				}}
			>
				Clear
			</Button>
		</View>
	);
}
