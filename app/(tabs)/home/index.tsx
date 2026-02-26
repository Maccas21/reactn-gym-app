import DateCarousel from "@/src/components/ui/DateCarousel";
import { useSelectedExercises } from "@/src/providers/SelectedExercisesProvider";
import { HeaderTitle, HeaderTitleProps } from "@react-navigation/elements";
import { router, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Button, Icon, IconButton, Text, useTheme } from "react-native-paper";

const SCREEN_Height = Dimensions.get("window").height;

export default function Home() {
	const theme = useTheme();
	const styles = getStyles(theme);
	const navigation = useNavigation();

	const { selectedExercises, setSelectedExercises } = useSelectedExercises();
	const [title, setTitle] = useState("");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [centerDate, setCenterDate] = useState(new Date());
	const [markedDates, setMarkedDates] = useState<Date[]>([]);

	// HEADER
	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: (props: HeaderTitleProps) => (
				<HeaderTitle {...props} children={title} onPress={resetDate} />
			),
			headerRight: () => (
				<View style={{ flexDirection: "row" }}>
					<IconButton
						icon="calendar-blank"
						style={styles.icon}
						onPress={() => {
							console.log("calendar press");
						}}
					/>
					<IconButton
						icon="dots-horizontal"
						style={styles.icon}
						onPress={() => {
							console.log("options press");
						}}
					/>
				</View>
			),
		});
	}, [navigation, title]);

	// Set title when currentDate changes
	useEffect(() => {
		setTitle(dateToString(currentDate));
	}, [currentDate]);

	// Reset dates to today
	const resetDate = () => {
		setCurrentDate(new Date());
		setCenterDate(new Date());
	};

	const dateToString = (date: Date) => {
		const newTitle = date.toLocaleDateString("en-AU", {
			weekday: "long", // full day name
			day: "numeric", // 1, 2, ..., 31
			month: "long", // full month name
		});

		return newTitle;
	};

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: theme.colors.background,
			}}
		>
			<DateCarousel
				centerDate={centerDate}
				selectedDate={currentDate}
				onDateSelected={(selected) => setCurrentDate(selected)}
				markedDates={markedDates}
			/>

			<Button
				mode="outlined"
				style={styles.button}
				onPress={() => {
					console.log("Routine Press");
				}}
			>
				Routines
			</Button>
			<Button
				mode="outlined"
				style={styles.button}
				onPress={() => router.push("/home/addexercise")}
			>
				Add Exercise
			</Button>

			{selectedExercises.length === 0 && (
				<Pressable
					style={styles.emptyExercises}
					onPress={() => router.push("/home/addexercise")}
				>
					<Text style={{ fontSize: 16, marginBottom: 10 }}>
						No exercises yet. Tap here to get started.
					</Text>
					<View
						style={{ flexDirection: "row", alignItems: "center" }}
					>
						<Icon source="plus-circle-outline" size={25} />
						<Text style={{ fontSize: 16 }}>Add Exercise</Text>
					</View>
				</Pressable>
			)}
		</View>
	);
}

// ---------------- STYLES ----------------
const getStyles = (theme: any) =>
	StyleSheet.create({
		icon: {
			padding: 0,
			margin: 0,
		},
		button: {
			borderRadius: 7,
			marginHorizontal: 20,
			marginBottom: 15,
		},
		emptyExercises: {
			borderWidth: 2,
			borderColor: theme.colors.outline,
			borderStyle: "dashed",
			borderRadius: 7,
			marginHorizontal: 20,
			height: SCREEN_Height / 3,
			justifyContent: "center",
			alignItems: "center",
		},
	});
