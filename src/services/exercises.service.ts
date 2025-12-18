import { Exercise } from "@/src/types";
import { supabase } from "./supabase";

function mapExerciseRows(rows: any[]): Exercise[] {
	return rows.map((ex) => {
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
}

export async function fetchCustomExercises(
	userId: string
): Promise<Exercise[]> {
	const { data, error } = await supabase
		.from("exercise")
		.select(
			`
			*,
			body_part:body_part_id (name),
			equipment:equipment_id (name),
			exercisemuscle (
				is_primary,
				muscle:muscle_id (name)
			)
		`
		)
		.eq("created_by_user_id", userId)
		.order("name", { ascending: true });

	if (error) {
		console.error("Error fetching custom exercises:", error);
		return [];
	}

	return mapExerciseRows(data ?? []);
}

export async function fetchRecentExercises(
	userId: string
): Promise<Exercise[]> {
	const { data, error } = await supabase
		.from("exercise")
		.select(
			`
			*,
			body_part:body_part_id (name),
			equipment:equipment_id (name),
			exercisemuscle (
				is_primary,
				muscle:muscle_id (name)
			)
		`
		)
		.not("last_used", "is", null)
		.order("last_used", { ascending: false })
		.limit(5);

	if (error) {
		console.error("Error fetching recent exercises:", error);
		return [];
	}

	return mapExerciseRows(data ?? []);
}
