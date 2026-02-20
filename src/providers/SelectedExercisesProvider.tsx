import { Exercise } from "@/src/types";
import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from "react";

type SelectedExerciseContextType = {
	selectedExercises: Exercise[];
	setSelectedExercises: Dispatch<SetStateAction<Exercise[]>>;
};

const SelectedExerciseContext = createContext<
	SelectedExerciseContextType | undefined
>(undefined);

export const SelectedExerciseProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

	return (
		<SelectedExerciseContext.Provider
			value={{ selectedExercises, setSelectedExercises }}
		>
			{children}
		</SelectedExerciseContext.Provider>
	);
};

export const useSelectedExercises = () => {
	const context = useContext(SelectedExerciseContext);

	if (!context) {
		throw new Error("useExercises must be used within an ExerciseProvider");
	}

	return context;
};
