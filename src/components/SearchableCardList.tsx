import { ExerciseCard } from "@/src/components/ui/ExerciseCard";
import { FilterChips } from "@/src/components/ui/FilterChips";
import { useAuth } from "@/src/providers/AuthProvider";
import {
	fetchCustomExercises,
	fetchRecentExercises,
} from "@/src/services/exercises.service";
import { fetchWrkoutExercises } from "@/src/services/wrkoutExercises.service";
import { Exercise } from "@/src/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SectionList, StyleSheet, View } from "react-native";
import { Searchbar, Text, useTheme } from "react-native-paper";

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
	const [bodypartFilters, setBodypartFilters] = useState<string[]>([]);

	// ---------------- GLOBAL SELECTION MAP ----------------
	const [selectedMap, setSelectedMap] = useState<Map<string, Exercise>>(
		() => {
			const map = new Map<string, Exercise>();
			selectedItems?.forEach((ex) => map.set(ex.exerciseId, ex));
			return map;
		},
	);

	// Sync parent selection if selectedItems prop changes
	useEffect(() => {
		if (selectedItems) {
			const map = new Map<string, Exercise>();
			selectedItems.forEach((ex) => map.set(ex.exerciseId, ex));
			setSelectedMap(map);
		}
	}, [selectedItems]);

	const bodyParts = [
		"back",
		"cardio",
		"chest",
		"lower arms",
		"lower legs",
		"neck",
		"shoulders",
		"upper arms",
		"upper legs",
		"waist",
	];

	// ---------------- FILTER MATCH BODYPART HELPER ----------------
	const matchesBodypartFilters = useCallback(
		(ex: Exercise) => {
			if (bodypartFilters.length === 0) return true; // no filters = allow all
			if (!ex.bodyParts) return false;

			// Normalize to array of strings
			const parts: string[] = Array.isArray(ex.bodyParts)
				? ex.bodyParts
				: [ex.bodyParts];

			// Compare lowercase
			return parts.some((p) => bodypartFilters.includes(p.toLowerCase()));
		},
		[bodypartFilters],
	);

	// ---------------- BUILD SECTIONS ----------------
	const sections = useMemo(() => {
		const q = query.toLowerCase();

		const matchesQuery = (ex: Exercise) =>
			ex.name.toLowerCase().includes(q) ||
			ex.targetMuscles?.some((m) => m.toLowerCase().includes(q)) ||
			ex.secondaryMuscles?.some((m) => m.toLowerCase().includes(q)) ||
			ex.bodyParts?.toLowerCase().includes(q) ||
			ex.equipments?.toLowerCase().includes(q);

		const filterAndSearch = (exercises: Exercise[]) =>
			exercises.filter(
				(ex) => matchesQuery(ex) && matchesBodypartFilters(ex),
			);

		const filteredRecents = filterAndSearch(recentExercises);
		const filteredCustoms = filterAndSearch(customExercises);
		const filteredApi = filterAndSearch(apiExercises);

		return [
			...(query === "" && filteredRecents.length > 0
				? [{ title: "Recents", data: filteredRecents }]
				: []),
			filteredCustoms.length > 0
				? { title: "Custom Exercises", data: filteredCustoms }
				: null,
			filteredApi.length > 0
				? { title: "Exercises", data: filteredApi }
				: null,
		].filter(Boolean) as SectionItem[];
	}, [
		query,
		bodypartFilters,
		customExercises,
		recentExercises,
		apiExercises,
		matchesBodypartFilters,
	]);

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
				setCustomExercises(customs);
				setRecentExercises(recents);
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
				const apiResults = await fetchWrkoutExercises();
				setApiExercises(apiResults);
			} catch (error) {
				console.error("Failed to fetch exercises:", error);
				setApiExercises([]); // Optionally clear previous results on error
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => clearTimeout(t);
	}, [query, bodypartFilters]);

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
		[onSelect, onItemPress, mode],
	);

	// ---------------- RENDER CARDS ----------------
	const renderCard = useCallback(
		({ item }: { item: Exercise }) => (
			<ExerciseCard
				item={item}
				isSelected={selectedMap.has(item.exerciseId)}
				onPress={handlePress}
				mode={mode}
			/>
		),
		[selectedMap, handlePress, mode],
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

			<FilterChips
				chipWords={bodyParts}
				onFilterChange={(selected) => {
					setBodypartFilters(selected);
					//console.log("Selected items:", selected);
				}}
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
					renderItem={renderCard}
					renderSectionHeader={({ section: { title } }) => (
						<Text style={{ margin: 10, fontWeight: "bold" }}>
							{title}
						</Text>
					)}
					contentContainerStyle={{ paddingBottom: 0 }}
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
});
