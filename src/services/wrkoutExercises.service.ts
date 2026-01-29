import { Exercise } from "@/src/types";
import rawData from "./wrkoutExercises.json";

const muscleToBodyPartMap: Record<string, string> = {
	// Waist / core
	abdominals: "waist",

	// Upper arms
	biceps: "upper arms",
	triceps: "upper arms",

	// Lower arms
	forearms: "lower arms",

	// Chest
	chest: "chest",

	// Back
	lats: "back",
	"lower back": "back",
	"middle back": "back",
	traps: "back",

	// Shoulders / neck
	shoulders: "shoulders",
	neck: "neck",

	// Upper legs
	quadriceps: "upper legs",
	hamstrings: "upper legs",
	glutes: "upper legs",
	adductors: "upper legs",
	abductors: "upper legs",

	// Lower legs
	calves: "lower legs",
};

const musclesToBodyPart = (
	muscles: string[],
	category: string
): string | null => {
	if (category.toLowerCase() === "cardio") return "cardio";

	for (const muscle of muscles) {
		const bodyPart = muscleToBodyPartMap[muscle.toLowerCase()];
		if (bodyPart) {
			return bodyPart;
		}
	}
	return null;
};

export const fetchWrkoutExercises = async (): Promise<Exercise[]> => {
	return rawData.exercises.map(
		(ex, index): Exercise => ({
			exerciseId: `wrkout-${index}-${ex.name
				.replace(/\s+/g, "-")
				.toLowerCase()}`,
			name: ex.name,
			gifUrl: "",
			targetMuscles: ex.primaryMuscles,
			bodyParts: musclesToBodyPart(ex.primaryMuscles, ex.category) ?? "",
			equipments: ex.equipment ?? "",
			secondaryMuscles: ex.secondaryMuscles,
			instructions: ex.instructions ?? [],
			isCustom: false,
			force: ex.force ?? "",
			level: ex.level ?? "",
			mechanic: ex.mechanic ?? "",
			category: ex.category ?? "",
		})
	);
};
