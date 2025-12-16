import { useAuth } from "@/src/providers/AuthProvider";
import { supabase } from "@/src/services/supabase";
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

type Exercise = {
	exerciseId: string;
	name: string;
	gifUrl: string;
	targetMuscles: string[];
	bodyParts: string;
	equipments: string;
	secondaryMuscles: string[];
	instructions: string[];
};

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

	const selectedIdSet = new Set(
		selectedItems?.map((i) => i.exerciseId) ?? []
	);

	// ---------------- SUPABASE ----------------
	const fetchCustomExercises = async () => {
		if (!session?.user.id) return [];

		const { data, error } = await supabase
			.from("exercise")
			.select(
				`
			*,
			body_part:body_part_id (name),
      		equipment:equipment_id (name),
			exercisemuscle (
				is_primary,
				muscle_id,
				muscle:muscle_id (name)
			)`
			)
			.eq("created_by_user_id", session.user.id)
			.order("name", { ascending: true });

		if (error) {
			console.error("Error fetching custom exercises:", error);
			return [];
		}

		const exercises: Exercise[] = (data || []).map((ex: any) => {
			const primaryMuscles: string[] = [];
			const secondaryMuscles: string[] = [];

			(ex.exercisemuscle || []).forEach((em: any) => {
				if (em.is_primary) primaryMuscles.push(em.muscle.name);
				else secondaryMuscles.push(em.muscle.name);
			});

			return {
				exerciseId: ex.exercise_id.toString(),
				name: ex.name,
				gifUrl: ex.image_url ?? "",
				targetMuscles: primaryMuscles,
				secondaryMuscles: secondaryMuscles,
				bodyParts: ex.body_part?.name ?? "",
				equipments: ex.equipment?.name ?? "",
				instructions: ex.description ?? [],
			};
		});

		return exercises;
	};

	const fetchRecentExercises = async () => {
		if (!session?.user.id) return [];

		const { data, error } = await supabase
			.from("exercise")
			.select(
				`
			*,
			body_part:body_part_id (name),
      		equipment:equipment_id (name),
			exercisemuscle (
				is_primary,
				muscle_id,
				muscle:muscle_id (name)
			)`
			)
			.not("last_used", "is", null)
			.order("last_used", { ascending: false })
			.limit(5);

		if (error) {
			console.error("Error fetching recent exercises:", error);
			return [];
		}

		const exercises: Exercise[] = (data || []).map((ex: any) => {
			const primaryMuscles: string[] = [];
			const secondaryMuscles: string[] = [];

			(ex.exercisemuscle || []).forEach((em: any) => {
				if (em.is_primary) primaryMuscles.push(em.muscle.name);
				else secondaryMuscles.push(em.muscle.name);
			});

			return {
				exerciseId: ex.exercise_id.toString(),
				name: ex.name,
				gifUrl: ex.image_url ?? "",
				targetMuscles: primaryMuscles,
				secondaryMuscles: secondaryMuscles,
				bodyParts: ex.body_part?.name ?? "",
				equipments: ex.equipment?.name ?? "",
				instructions: ex.description ?? [],
			};
		});

		return exercises;
	};

	// ---------------- API ----------------
	const EXERCISEDB_API_URL = process.env.EXPO_PUBLIC_EXERCISEDB_API_URL!;

	const fetchApiExercises = async (searchQuery: string) => {
		try {
			const url = `${EXERCISEDB_API_URL}?limit=25&search=${encodeURIComponent(
				searchQuery
			)}&sortBy=name&sortOrder=asc`;
			const res = await fetch(url);
			const json = await res.json();
			setApiExercises(json.data ?? []);
		} catch (error) {
			console.error("API error:", error);
		}
	};

	// ---------------- LOAD SUPABASE ON MOUNT ----------------
	useEffect(() => {
		const load = async () => {
			const customs = await fetchCustomExercises();
			const recents = await fetchRecentExercises();
			setCustomExercises(customs);
			setRecentExercises(recents);
		};
		load();
	}, [session]);

	// ---------------- API FETCH ON QUERY ----------------
	useEffect(() => {
		const t = setTimeout(() => {
			fetchApiExercises(query); // will fetch "" initially too
		}, 300);
		return () => clearTimeout(t);
	}, [query]);

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

	// capitalise first letter of each word
	function capitaliseWords(text: string): string {
		return text
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

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
