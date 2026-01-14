import { Exercise } from "@/src/types";

const EXERCISEDB_API_URL = process.env.EXPO_PUBLIC_EXERCISEDB_API_URL!;
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 100;

export async function fetchAPIExercises(
	query: string,
	offset = DEFAULT_OFFSET,
	limit = DEFAULT_LIMIT
): Promise<{ data: Exercise[]; metadata?: any; error?: any }> {
	try {
		const params = new URLSearchParams({
			limit: String(limit),
			offset: String(offset),
			search: query,
			sortBy: "name",
			sortOrder: "asc",
		});

		const url = `${EXERCISEDB_API_URL}/exercises/filter?${params.toString()}`;
		const res = await fetch(url);

		if (!res.ok) {
			const text = await res.text();
			console.warn("API non-JSON response:", text);
			return { data: [], error: { status: res.status, message: text } };
		}

		const json = await res.json();

		return {
			...json,
			data: (json.data ?? []).map(
				(ex: any): Exercise => ({
					...ex,
					isCustom: false,
				})
			),
		};
	} catch (error) {
		console.error("API error:", error);
		// Return empty data + error object for handling in UI
		return { data: [], error };
	}
}

export async function fetchAPIExercisesByBodypart(
	bodyPartName: string,
	offset = DEFAULT_OFFSET,
	limit = DEFAULT_LIMIT
): Promise<{ data: Exercise[]; metadata?: any; error?: any }> {
	const url = `${EXERCISEDB_API_URL}/bodyparts
	/${encodeURIComponent(bodyPartName)}
	/exercises?
	limit=${limit}
	&offset=${offset}`;

	try {
		const res = await fetch(url);
		const json = await res.json();

		// Check for HTTP errors
		if (!res.ok) {
			// Optionally include the server error from JSON
			throw new Error(
				JSON.stringify(json.error ?? { message: res.statusText })
			);
		}

		return {
			...json,
			data: (json.data ?? []).map(
				(ex: any): Exercise => ({
					...ex,
					isCustom: false,
				})
			),
		};
	} catch (error) {
		console.error("API error:", error);
		// Return empty data + error object for handling in UI
		return { data: [], error };
	}
}
