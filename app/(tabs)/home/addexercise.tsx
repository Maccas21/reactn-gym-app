import SearchableCardList from "@/src/components/SearchableCardList";
import { Exercise } from "@/src/types";
import { useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import DraggableFlatList, {
	RenderItemParams,
} from "react-native-draggable-flatlist";
import {
	Badge,
	Button,
	Divider,
	IconButton,
	Text,
	useTheme,
} from "react-native-paper";

export default function AddExercise() {
	const theme = useTheme();
	const navigation = useNavigation();

	const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [listHeight, setListHeight] = useState(0);
	const [bottomBarHeight, setBottomBarHeight] = useState(0);

	const bottomSheetAnim = useRef(new Animated.Value(0)).current; // 0 = hidden

	// Header button
	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Button mode="text" icon="plus">
					Create New
				</Button>
			),
		});
	}, [navigation]);

	const handleClear = () => {
		if (selectedExercises.length === 0) return;

		setSelectedExercises([]);
		setModalVisible(false);
	};

	const toggleSheet = () => {
		if (selectedExercises.length === 0) return;

		setModalVisible((prev) => !prev);
	};

	useEffect(() => {
		Animated.timing(bottomSheetAnim, {
			toValue: modalVisible ? 1 : 0, // 1 = visible, 0 = hidden
			duration: 250,
			useNativeDriver: true,
		}).start();
	}, [modalVisible]);

	const removeExercise = (id: string) => {
		setSelectedExercises((prev) =>
			prev.filter((ex) => ex.exerciseId !== id),
		);
	};

	const renderItem = ({
		item,
		drag,
		isActive,
	}: RenderItemParams<Exercise>) => (
		<View
			style={[
				styles.listItem,
				{
					backgroundColor: isActive
						? theme.colors.background //selected
						: theme.colors.secondaryContainer, //default
					borderColor: theme.colors.outline,
				},
			]}
		>
			<IconButton icon="drag" style={styles.icon} onLongPress={drag} />

			<Text style={styles.itemText}>{item.name}</Text>

			<IconButton
				icon="close"
				style={styles.icon}
				onPress={() => removeExercise(item.exerciseId)}
			/>
		</View>
	);

	return (
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			{/* LIST + SHEET REGION */}
			<View
				style={{
					flex: 1,
					position: "relative",
				}}
				onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
			>
				<SearchableCardList
					mode="multi"
					selectedItems={selectedExercises}
					onSelect={setSelectedExercises}
				/>

				<Animated.View
					pointerEvents={modalVisible ? "auto" : "none"}
					style={[
						styles.bottomSheet,
						{
							transform: [
								{
									translateY: bottomSheetAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [listHeight, 0],
									}),
								},
							],
							backgroundColor: theme.colors.secondaryContainer,
							borderColor: theme.colors.outline,
							borderWidth: 2,
							height: listHeight,
						},
					]}
				>
					<Text style={styles.bottomSheetTitle}>
						Selected Exercises
					</Text>

					<DraggableFlatList
						data={selectedExercises}
						renderItem={renderItem}
						keyExtractor={(item) => item.exerciseId}
						onDragEnd={({ data }) => setSelectedExercises(data)}
						style={{
							maxHeight: listHeight - bottomBarHeight,
						}}
					/>
				</Animated.View>
			</View>

			{/* BOTTOM BAR */}
			<Divider bold />
			<View
				onLayout={(e) =>
					setBottomBarHeight(e.nativeEvent.layout.height)
				}
				style={[
					styles.bottomView,
					{ backgroundColor: theme.colors.background },
				]}
			>
				<View style={{ flex: 1 }}>
					<Button mode="outlined" onPress={handleClear}>
						Clear
					</Button>
				</View>

				<View style={{ flex: 1 }}>
					<Button mode="outlined">Add</Button>
				</View>

				<View>
					<IconButton
						disabled={selectedExercises.length == 0}
						icon="format-list-checkbox"
						style={[
							styles.icon,
							{ transform: [{ rotate: "180deg" }] },
						]}
						onPress={toggleSheet}
					/>
					{selectedExercises.length > 0 && (
						<Badge style={styles.badge}>
							{selectedExercises.length}
						</Badge>
					)}
				</View>
			</View>
		</View>
	);
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
	bottomView: {
		flexDirection: "row",
		paddingVertical: 10,
		paddingHorizontal: 15,
		gap: 10,
	},
	badge: {
		position: "absolute",
		top: -6,
		right: -6,
	},
	bottomSheet: {
		position: "absolute",
		//top: 0,
		//bottom: 0,
		left: 0,
		right: 0,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		paddingTop: 15,
	},
	bottomSheetTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
		paddingHorizontal: 20,
	},
	listItem: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		paddingHorizontal: 10,
	},
	itemText: {
		flex: 1,
		fontSize: 16,
	},
	icon: {
		padding: 0,
		margin: 0,
	},
});
