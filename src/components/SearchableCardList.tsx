import { useAuth } from "@/src/providers/AuthProvider";
import { fetchAPIExercises } from "@/src/services/exercisedbAPI.service";
import {
	fetchCustomExercises,
	fetchRecentExercises,
} from "@/src/services/exercises.service";
import { Exercise } from "@/src/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SectionList, StyleSheet, View } from "react-native";
import {
	Card,
	Checkbox,
	IconButton,
	Searchbar,
	Text,
	useTheme,
} from "react-native-paper";

// ---------------- EXERCISE CARD ----------------
type ExerciseCardProps = {
	item: Exercise;
	isSelected: boolean;
	onPress: (item: Exercise) => void;
	onPressDots?: (item: Exercise) => void;
	mode: "single" | "multi";
};

const ExerciseCard = React.memo(
	({
		item,
		isSelected,
		onPress,
		onPressDots = () => {},
		mode,
	}: ExerciseCardProps) => (
		<Card style={styles.card} onPress={() => onPress(item)}>
			<Card.Content style={styles.row}>
				<View style={{ flex: 1, gap: 5 }}>
					<Text variant="titleMedium">{item.name}</Text>
					{item.targetMuscles?.length > 0 && (
						<Text variant="bodySmall">
							Muscles: {item.targetMuscles.join(", ")}
						</Text>
					)}
					{item.secondaryMuscles?.length > 0 && (
						<Text variant="bodySmall">
							Secondary: {item.secondaryMuscles.join(", ")}
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
		prev.isSelected === next.isSelected && prev.item === next.item
);

type SectionItem = { title: string; data: Exercise[] };

type Props = {
	mode: "single" | "multi";
	selectedItems?: Exercise[];
	onSelect?: (selected: Exercise[]) => void;
	onItemPress?: (item: Exercise) => void;
};

// ---------------- SEARCHABLE CARD LIST ----------------
export default function SearchableCardList({
	mode,
	selectedItems,
	onSelect = () => {},
	onItemPress = () => {},
}: Props) {
	const theme = useTheme();
	const { session } = useAuth();

	const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
	const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
	const [apiExercises, setApiExercises] = useState<Exercise[]>([]);
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMoreApi, setHasMoreApi] = useState(true);

	// ---------------- GLOBAL SELECTION MAP ----------------
	const [selectedMap, setSelectedMap] = useState<Map<string, Exercise>>(
		() => {
			const map = new Map<string, Exercise>();
			selectedItems?.forEach((ex) => map.set(ex.exerciseId, ex));
			return map;
		}
	);

	// Sync parent selection if selectedItems prop changes
	useEffect(() => {
		if (selectedItems) {
			const map = new Map<string, Exercise>();
			selectedItems.forEach((ex) => map.set(ex.exerciseId, ex));
			setSelectedMap(map);
		}
	}, [selectedItems]);

	// ---------------- LOAD SUPABASE ON MOUNT ----------------
	useEffect(() => {
		if (!session?.user.id) return;

		const load = async () => {
			setLoading(true);
			try {
				const [customs, recents] = await Promise.all([
					fetchCustomExercises(session.user.id),
					fetchRecentExercises(session.user.id),
				]);
				setCustomExercises(capitaliseInExercises(customs));
				setRecentExercises(capitaliseInExercises(recents));
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [session]);

	// ---------------- API FETCH ON QUERY ----------------
	useEffect(() => {
		const t = setTimeout(async () => {
			setLoading(true);
			try {
				const apiResults = await fetchAPIExercises(query);
				setApiExercises(capitaliseInExercises(apiResults.data));
				setHasMoreApi(apiResults.metadata?.nextPage != null);
			} catch (error) {
				console.error("Failed to fetch exercises:", error);
				setApiExercises([]); // Optionally clear previous results on error
				setHasMoreApi(false);
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => clearTimeout(t);
	}, [query]);

	// ---------------- LOAD MORE API ----------------
	const loadMoreAPIExercises = useCallback(async () => {
		if (loadingMore || !hasMoreApi) return;

		setLoadingMore(true);
		try {
			const res = await fetchAPIExercises(query, apiExercises.length);
			setApiExercises((prev) => {
				const existingIds = new Set(prev.map((i) => i.exerciseId));
				const newItems = res.data.filter(
					(i: Exercise) => !existingIds.has(i.exerciseId)
				);
				return [...prev, ...capitaliseInExercises(newItems)];
			});

			setHasMoreApi(res.metadata?.nextPage != null);
		} catch (error) {
			console.error("Failed to load more exercises:", error);
		} finally {
			setLoadingMore(false);
		}
	}, [loadingMore, hasMoreApi, query]);

	// ---------------- BUILD SECTIONS ----------------
	const sections = useMemo(() => {
		const filteredCustoms = customExercises.filter((ex) => {
			const q = query.toLowerCase();
			return (
				ex.name.toLowerCase().includes(q) ||
				ex.targetMuscles?.some((m) => m.toLowerCase().includes(q)) ||
				ex.secondaryMuscles?.some((m) => m.toLowerCase().includes(q)) ||
				ex.bodyParts?.toLowerCase().includes(q) ||
				ex.equipments?.toLowerCase().includes(q)
			);
		});

		return [
			...(query === "" && recentExercises.length > 0
				? [{ title: "Recents", data: recentExercises }]
				: []),
			filteredCustoms.length > 0
				? { title: "Custom Exercises", data: filteredCustoms }
				: null,
			apiExercises.length > 0
				? { title: "Exercises", data: apiExercises }
				: null,
		].filter(Boolean) as SectionItem[];
	}, [query, customExercises, recentExercises, apiExercises]);

	// ---------------- HANDLE PRESS ----------------
	const handlePress = useCallback(
		(item: Exercise) => {
			setSelectedMap((prev) => {
				const newMap = new Map(prev);
				if (newMap.has(item.exerciseId)) newMap.delete(item.exerciseId);
				else newMap.set(item.exerciseId, item);

				// If onSelect was defined
				if (onSelect) {
					onSelect(Array.from(newMap.values()));
				}

				return newMap;
			});

			if (mode === "single" && onItemPress) {
				onItemPress(item);
			}
		},
		[onSelect, onItemPress, mode]
	);

	// ---------------- CAPITALISE WORDS ----------------
	const capitaliseWords = useCallback((text: string) => {
		return text
			.split(" ") // Split by spaces
			.map(
				(word) =>
					word
						.split("-") // Split hyphenated words
						.map(
							(part) =>
								part.charAt(0).toUpperCase() + part.slice(1)
						)
						.join("-") // Join hyphenated parts
			)
			.map((word) =>
				// Capitalise inside brackets if present
				word.replace(/\((\w)/g, (_, c) => `(${c.toUpperCase()}`)
			)
			.join(" ");
	}, []);

	const capitaliseInExercises = useCallback(
		(exercises: Exercise[]): Exercise[] => {
			return exercises.map((ex) => ({
				...ex,
				name: capitaliseWords(ex.name),
				targetMuscles: ex.targetMuscles.map(capitaliseWords),
				secondaryMuscles: ex.secondaryMuscles.map(capitaliseWords),
			}));
		},
		[capitaliseWords]
	);

	// ---------------- RENDER ITEM ----------------
	const renderItem = useCallback(
		({ item }: { item: Exercise }) => (
			<ExerciseCard
				item={item}
				isSelected={selectedMap.has(item.exerciseId)}
				onPress={handlePress}
				mode={mode}
			/>
		),
		[selectedMap, handlePress, mode]
	);

	// ---------------- RENDER ----------------
	return (
		<View style={{ flex: 1 }}>
			<Searchbar
				placeholder="Search"
				value={query}
				onChangeText={setQuery}
				style={styles.searchBar}
			/>

			{loading && (
				<ActivityIndicator
					size="large"
					color={theme.colors.primary}
					style={{ marginTop: 20 }}
				/>
			)}

			{!loading && (
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.exerciseId}
					renderItem={renderItem}
					renderSectionHeader={({ section: { title } }) => (
						<Text style={{ margin: 10, fontWeight: "bold" }}>
							{title}
						</Text>
					)}
					contentContainerStyle={{ paddingBottom: 0 }}
					onEndReached={loadMoreAPIExercises}
					onEndReachedThreshold={0.5} // Trigger when 50% from bottom
					ListFooterComponent={
						loadingMore ? (
							<ActivityIndicator
								size="large"
								color={theme.colors.primary}
							/>
						) : null
					}
				/>
			)}
		</View>
	);
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
	searchBar: {
		margin: 10,
	},
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
