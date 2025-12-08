import React, { createContext, ReactNode, useContext, useState } from "react";
import { Button, Dialog, Portal, Snackbar, Text } from "react-native-paper";

type Action = { label: string; onPress: () => void };

type MessageContextType = {
	showMessage: (options: {
		type?: "snackbar" | "dialog";
		title?: string;
		message: string;
		actions?: Action[];
	}) => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [dialogVisible, setDialogVisible] = useState(false);
	const [dialogMessage, setDialogMessage] = useState("");
	const [dialogTitle, setDialogTitle] = useState("");
	const [dialogActions, setDialogActions] = useState<Action[]>([]);

	const showMessage = ({
		type = "snackbar",
		title = "",
		message,
		actions = [],
	}: {
		type?: "snackbar" | "dialog";
		title?: string;
		message: string;
		actions?: Action[];
	}) => {
		if (type === "snackbar") {
			setSnackbarMessage(message);
			setSnackbarVisible(true);
		} else {
			setDialogTitle(title);
			setDialogMessage(message);
			setDialogActions(
				actions.length > 0
					? actions.map((a) => ({
							label: a.label,
							onPress: () => {
								setDialogVisible(false);
								a.onPress();
							},
					  }))
					: [
							{
								label: "OK",
								onPress: () => setDialogVisible(false),
							},
					  ]
			);
			setDialogVisible(true);
		}
	};

	return (
		<MessageContext.Provider value={{ showMessage }}>
			{children}

			<Snackbar
				visible={snackbarVisible}
				onDismiss={() => setSnackbarVisible(false)}
				duration={1500}
				action={{
					label: "OK",
					onPress: () => setSnackbarVisible(false),
				}}
			>
				{snackbarMessage}
			</Snackbar>

			<Portal>
				<Dialog
					visible={dialogVisible}
					onDismiss={() => setDialogVisible(false)}
				>
					{dialogTitle ? (
						<Dialog.Title>{dialogTitle}</Dialog.Title>
					) : null}
					<Dialog.Content>
						<Text>{dialogMessage}</Text>
					</Dialog.Content>
					<Dialog.Actions>
						{dialogActions.map((action, idx) => (
							<Button key={idx} onPress={action.onPress}>
								{action.label}
							</Button>
						))}
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</MessageContext.Provider>
	);
}

export const useMessage = () => {
	const context = useContext(MessageContext);
	if (!context)
		throw new Error("useMessage must be used within MessageProvider");
	return context;
};
