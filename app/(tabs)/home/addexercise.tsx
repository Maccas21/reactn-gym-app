import SearchableCardList from "@/src/components/SearchableCardList";
import { useState } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

export type Exercise = {
	exerciseId: string;
	name: string;
	gifUrl: string;
	targetMuscles: string[];
	bodyParts: string;
	equipments: string;
	secondaryMuscles: string[];
	instructions: string[];
};

export default function AddExercise() {
	const theme = useTheme();
	const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: theme.colors.background,
			}}
		>
			<SearchableCardList
				mode="multi"
				selectedItems={selectedExercises}
				onSelect={(selected) => {
					console.log("Selected items:", selected);
					setSelectedExercises(selected);
				}}
			/>
		</View>
	);
}
