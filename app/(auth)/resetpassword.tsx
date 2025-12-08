import { useMessage } from "@/src/providers/MessageProvider";
import { supabase } from "@/src/services/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { showMessage } = useMessage();

	const handleSendCode = async () => {
		if (!email) {
			showMessage({
				type: "dialog",
				title: "Error",
				message: "Please enter your email",
			});
			return;
		}

		setLoading(true);
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { shouldCreateUser: false },
		});
		setLoading(false);

		if (error) {
			showMessage({
				type: "dialog",
				title: "Error",
				message: error.message,
			});
			return;
		}

		showMessage({
			type: "dialog",
			title: "Sucess",
			message: "Please check your email for a reset code",
		});
	};

	const handleResetPassword = async () => {
		if (!email || !code || !newPassword) {
			showMessage({
				type: "dialog",
				title: "Error",
				message: "Please enter your email, code and new password",
			});
			return;
		}

		setLoading(true);

		// 1. Verify OTP / login temporarily
		const verifyResponse = await supabase.auth.verifyOtp({
			email,
			token: code,
			type: "magiclink",
		});

		if (verifyResponse.error) {
			setLoading(false);
			showMessage({
				type: "dialog",
				title: "Error",
				message: verifyResponse.error.message,
			});
			return;
		}

		// 2. Reset password
		const updateResponse = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (updateResponse.error) {
			setLoading(false);
			showMessage({
				type: "dialog",
				title: "Error",
				message: updateResponse.error.message,
			});
			return;
		}

		// 3. Logout
		const logoutResponse = await supabase.auth.signOut();
		setLoading(false);

		if (logoutResponse.error) {
			showMessage({
				type: "dialog",
				title: "Error",
				message: logoutResponse.error.message,
			});
			return;
		}

		showMessage({
			type: "dialog",
			title: "Sucess",
			message: "Password reset successfully. You can now login.",
			actions: [
				{
					label: "OK",
					onPress: () => router.replace("/login"),
				},
			],
		});
	};

	return (
		<View style={styles.container}>
			<Text variant="headlineMedium" style={styles.title}>
				Reset Password
			</Text>

			<TextInput
				label="Email"
				mode="outlined"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>

			<TextInput
				label="Reset Code"
				mode="outlined"
				value={code}
				onChangeText={setCode}
				keyboardType="numeric"
			/>

			<TextInput
				label="New Password"
				mode="outlined"
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
			/>

			<Button mode="contained" onPress={handleSendCode}>
				Send / Resend Code
			</Button>

			<Button mode="contained" onPress={handleResetPassword}>
				Reset Password
			</Button>

			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" />
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 10,
		justifyContent: "center",
	},
	title: {
		textAlign: "center",
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
});
