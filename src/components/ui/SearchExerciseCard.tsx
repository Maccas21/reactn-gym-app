import { Exercise } from "@/src/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Checkbox, IconButton, Text } from "react-native-paper";

type SearchExerciseCardProps = {
	item: Exercise;
	isSelected: boolean;
	onPress: (item: Exercise) => void;
	onPressDots?: (item: Exercise) => void;
	mode: "single" | "multi";
};

export const SearchExerciseCard = React.memo(
	({
		item,
		isSelected,
		onPress,
		onPressDots = () => {},
		mode,
	}: SearchExerciseCardProps) => (
		<Card style={styles.card} onPress={() => onPress(item)}>
			<Card.Content style={styles.row}>
				<View style={{ flex: 1, gap: 5 }}>
					<Text
						variant="titleMedium"
						style={{ textTransform: "capitalize" }}
					>
						{item.name}
					</Text>
					{item.targetMuscles?.length > 0 && (
						<Text
							variant="bodySmall"
							style={{ textTransform: "capitalize" }}
						>
							Muscles: {item.targetMuscles.join(", ")}
						</Text>
					)}
					{item.secondaryMuscles?.length > 0 && (
						<Text
							variant="bodySmall"
							style={{ textTransform: "capitalize" }}
						>
							Secondary: {item.secondaryMuscles.join(", ")}
						</Text>
					)}
					{item.bodyParts?.length > 0 && (
						<Text
							variant="bodySmall"
							style={{ textTransform: "capitalize" }}
						>
							Body Parts: {item.bodyParts}
						</Text>
					)}
				</View>

				{mode === "multi" && (
					<Checkbox status={isSelected ? "checked" : "unchecked"} />
				)}

				<IconButton
					icon="dots-vertical"
					onPress={(e) => {
						e.stopPropagation(); // Stops card onPress from firing
						onPressDots(item);
						console.log("Actions for", item.name);
					}}
				/>
			</Card.Content>
		</Card>
	),
	(prev, next) =>
		prev.isSelected === next.isSelected && prev.item === next.item,
);

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
	card: {
		marginHorizontal: 10,
		marginVertical: 5,
		padding: 0,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
});
