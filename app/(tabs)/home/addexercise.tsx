import SearchableCardList from "@/src/components/SearchableCardList";
import { Exercise } from "@/src/types";
import { useNavigation } from "expo-router";
import { useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { Button, useTheme } from "react-native-paper";

export default function AddExercise() {
	const theme = useTheme();
	const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
	const navigation = useNavigation();

	// Set header button
	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Button
					mode="text"
					onPress={() => {
						console.log("Creating new exercise");
						// handle creating new exercise here
					}}
					icon="plus"
				>
					Create New
				</Button>
			),
		});
	}, [navigation]);

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
