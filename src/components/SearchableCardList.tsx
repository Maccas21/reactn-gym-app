import { useAuth } from "@/src/providers/AuthProvider";
import { fetchAPIExercises } from "@/src/services/exercisedbAPI.service";
import {
	fetchCustomExercises,
	fetchRecentExercises,
} from "@/src/services/exercises.service";
import { Exercise } from "@/src/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SectionList, StyleSheet, View } from "react-native";
import {
	Card,
	Checkbox,
	IconButton,
	Searchbar,
	Text,
	useTheme,
} from "react-native-paper";

type SectionItem = { title: string; data: Exercise[] };

type Props = {
	mode: "single" | "multi";
	selectedItems?: Exercise[];
	onSelect?: (selected: Exercise[]) => void;
	onItemPress?: (item: Exercise) => void;
};

export default function SearchableCardList({
	mode,
	selectedItems,
	onSelect,
	onItemPress,
}: Props) {
	const router = useRouter();
	const theme = useTheme();
	const { session } = useAuth();

	const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
	const [recentExercises, setRecentExercises] = useState<Exercise[]>([]);
	const [apiExercises, setApiExercises] = useState<Exercise[]>([]);
	const [sections, setSections] = useState<SectionItem[]>([]);
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMoreApi, setHasMoreApi] = useState(true);

	const selectedIdSet = new Set(
		selectedItems?.map((i) => i.exerciseId) ?? []
	);

	// ---------------- LOAD SUPABASE ON MOUNT ----------------
	useEffect(() => {
		if (!session?.user.id) return;

		const load = async () => {
			setLoading(true);
			const customs = await fetchCustomExercises(session.user.id);
			const recents = await fetchRecentExercises(session.user.id);
			setCustomExercises(customs);
			setRecentExercises(recents);
			setLoading(false);
		};

		load();
	}, [session]);

	// ---------------- API FETCH ON QUERY ----------------
	useEffect(() => {
		const t = setTimeout(async () => {
			setLoading(true);
			try {
				const apiResults = await fetchAPIExercises(query);
				setApiExercises(apiResults.data);
				setHasMoreApi(apiResults.metadata?.nextPage != null);
			} catch (error) {
				console.error("Failed to fetch exercises:", error);
				setApiExercises([]); // optionally clear previous results on error
				setHasMoreApi(false);
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => clearTimeout(t);
	}, [query]);

	// Load more
	const loadMoreAPIExercises = async () => {
		if (loadingMore || !hasMoreApi) return;

		setLoadingMore(true);
		try {
			const res = await fetchAPIExercises(query, apiExercises.length);
			setApiExercises((prev) => {
				const existingIds = new Set(prev.map((i) => i.exerciseId));
				const newItems = res.data.filter(
					(i: Exercise) => !existingIds.has(i.exerciseId)
				);
				return [...prev, ...newItems];
			});

			setHasMoreApi(res.metadata?.nextPage != null);
		} catch (error) {
			console.error("Failed to load more exercises:", error);
		} finally {
			setLoadingMore(false);
		}
	};

	// ---------------- BUILD SECTIONS ----------------
	useEffect(() => {
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

		const newSections: SectionItem[] = [
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

		setSections(newSections);
	}, [query, customExercises, recentExercises, apiExercises]);

	// ---------------- HANDLE PRESS ----------------
	const handlePress = (item: Exercise) => {
		if (mode === "multi" && onSelect && selectedItems) {
			const exists = selectedItems.some(
				(i) => i.exerciseId === item.exerciseId
			);
			const next = exists
				? selectedItems.filter((i) => i.exerciseId !== item.exerciseId)
				: [...selectedItems, item];
			onSelect(next);
		} else {
			onItemPress?.(item);
		}
	};

	// Capitalize first letter of each word
	const capitaliseWords = (text: string) =>
		text
			.split(" ")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");

	// ---------------- RENDER ITEM ----------------
	const renderItem = ({ item }: { item: Exercise }) => {
		const isSelected = selectedIdSet.has(item.exerciseId);
		return (
			<Card style={styles.card} onPress={() => handlePress(item)}>
				<Card.Content style={styles.row}>
					<View style={{ flex: 1, gap: 5 }}>
						<Text variant="titleMedium">
							{capitaliseWords(item.name)}
						</Text>
						{item.targetMuscles?.length > 0 && (
							<Text variant="bodySmall">
								Muscles:{" "}
								{capitaliseWords(item.targetMuscles.join(", "))}
							</Text>
						)}
						{item.secondaryMuscles?.length > 0 && (
							<Text variant="bodySmall">
								Secondary:{" "}
								{capitaliseWords(
									item.secondaryMuscles.join(", ")
								)}
							</Text>
						)}
					</View>

					{mode === "multi" && (
						<Checkbox
							status={isSelected ? "checked" : "unchecked"}
							onPress={() => handlePress(item)}
						/>
					)}

					<IconButton
						icon="dots-vertical"
						onPress={() => console.log("Actions for", item.name)}
					/>
				</Card.Content>
			</Card>
		);
	};

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
				onEndReachedThreshold={1} // trigger when 50% from bottom
				ListFooterComponent={
					loadingMore ? (
						<ActivityIndicator
							size="large"
							color={theme.colors.primary}
						/>
					) : null
				}
			/>
		</View>
	);
}

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
