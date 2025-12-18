const EXERCISEDB_API_URL = process.env.EXPO_PUBLIC_EXERCISEDB_API_URL!;

export async function fetchAPIExercises(
	query: string,
	offset = 0,
	limit = 25
): Promise<any> {
	const url = `${EXERCISEDB_API_URL}/exercises/filter?
	limit=${limit}
	&offset=${offset}
	&search=${encodeURIComponent(query)}
	&sortBy=name&sortOrder=asc`;

	try {
		const res = await fetch(url);
		const json = await res.json();

		return json;
	} catch (error) {
		console.error("API error:", error);
		return { data: [] };
	}
}
