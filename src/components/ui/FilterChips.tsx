import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, useTheme } from "react-native-paper";

export function FilterChips({
	chipWords,
	onFilterChange,
}: {
	chipWords: string[];
	onFilterChange: (selected: string[]) => void;
}) {
	const theme = useTheme();
	const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

	const toggleFilter = (part: string) => {
		setSelectedFilters((prev) => {
			const newSelected = prev.includes(part)
				? prev.filter((p) => p !== part)
				: [...prev, part];
			onFilterChange(newSelected); // notify parent
			return newSelected;
		});
	};

	return (
		<View
			style={{
				paddingVertical: 5,
				backgroundColor: theme.colors.secondaryContainer,
			}}
		>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 10, gap: 5 }}
			>
				{chipWords.map((part) => (
					<Button
						key={part}
						mode="outlined"
						onPress={() => toggleFilter(part)}
						compact
						style={{
							borderRadius: 10,
							borderColor: selectedFilters.includes(part)
								? theme.colors.outline
								: theme.colors.secondaryContainer,
						}}
						labelStyle={{
							marginHorizontal: 7,
							marginVertical: 7,
							textTransform: "capitalize",
						}}
					>
						{part}
					</Button>
				))}
			</ScrollView>
		</View>
	);
}
