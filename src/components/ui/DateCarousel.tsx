import React, { useEffect, useMemo, useRef } from "react";
import {
	Dimensions,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { Badge, Text, useTheme } from "react-native-paper";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DATE_WIDTH = 60;
const BADGE_WIDTH = 5;
const DATEDIFFERENCE = Platform.OS === "web" ? 25 : 14;

const addDays = (date: Date, days: number) => {
	const newDate = new Date(date);
	newDate.setDate(newDate.getDate() + days);
	return newDate;
};

const isSameDay = (d1: Date, d2: Date) => {
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	);
};

const formatWeekday = (date: Date) => {
	return date.toLocaleDateString("en-AU", { weekday: "short" });
};

type DateCarouselProps = {
	centerDate: Date; // center reference from calendar picker
	selectedDate: Date;
	onDateSelected: (selected: Date) => void;
	markedDates?: Date[];
};

const DateCarousel: React.FC<DateCarouselProps> = ({
	centerDate,
	selectedDate,
	onDateSelected,
	markedDates = [],
}: DateCarouselProps) => {
	const theme = useTheme();
	const styles = getStyles(theme);
	const scrollRef = useRef<ScrollView>(null);

	const today = new Date();

	const dates = useMemo(() => {
		const arr: Date[] = [];
		for (let i = -DATEDIFFERENCE; i <= DATEDIFFERENCE; i++) {
			arr.push(addDays(centerDate, i));
		}
		return arr;
	}, [centerDate]);

	// Scroll to center on mount and when calendarDate changes
	useEffect(() => {
		setTimeout(() => {
			if (scrollRef.current) {
				scrollRef.current.scrollTo({
					x:
						DATEDIFFERENCE * DATE_WIDTH -
						SCREEN_WIDTH / 2 +
						DATE_WIDTH / 2, // approximate center
					y: 0,
					animated: false,
				});
			}
		}, 100);
	}, [centerDate]);

	const handleDateSelected = (date: Date) => {
		onDateSelected(date);
	};

	const markedSet = useMemo(
		() =>
			new Set(
				markedDates.map((d) =>
					new Date(
						d.getFullYear(),
						d.getMonth(),
						d.getDate(),
					).getTime(),
				),
			),
		[markedDates],
	);

	const isMarked = (date: Date) =>
		markedSet.has(
			new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
			).getTime(),
		);

	return (
		<View style={styles.container}>
			<ScrollView
				ref={scrollRef}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.scroll}
			>
				{dates.map((date) => {
					const isToday = isSameDay(date, today);
					const isSelected = isSameDay(date, selectedDate);

					return (
						<Pressable
							key={date.toISOString()}
							onPress={() => handleDateSelected(date)}
							style={styles.dateContainer}
						>
							<Text style={styles.dayName}>
								{formatWeekday(date)}
							</Text>

							<Text
								style={[
									styles.dayNumber,
									isToday && styles.todayNumber,
									isSelected && styles.selectedNumber,
								]}
							>
								{date.getDate()}
							</Text>
							{isMarked(date) && (
								<Badge
									size={BADGE_WIDTH}
									style={styles.badge}
								/>
							)}
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
};

const getStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			margin: 0,
		},
		scroll: {
			marginVertical: 15,
			alignItems: "center",
		},
		dateContainer: {
			width: DATE_WIDTH,
			borderRadius: 10,
			//justifyContent: "center",
			alignItems: "center",
		},
		dayName: {
			fontSize: 12,
		},
		dayNumber: {
			fontSize: 20,
			fontWeight: "bold",
			borderWidth: 2,
			borderRadius: 7,
			width: 32,
			height: 32,
			textAlign: "center",
			textAlignVertical: "center",
			borderColor: "transparent",
		},
		todayNumber: {
			borderColor: theme.colors.primaryContainer,
			backgroundColor: theme.colors.primaryContainer,
		},
		selectedNumber: {
			borderColor: theme.colors.primaryContainer,
		},
		badge: {
			position: "absolute",
			bottom: -7,
			left: "50%",
			transform: [{ translateX: -BADGE_WIDTH / 2 }],
			backgroundColor: theme.colors.primary,
		},
	});

export default DateCarousel;
