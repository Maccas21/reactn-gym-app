import { supabase } from "@/services/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Button,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSendCode = async () => {
		if (!email) {
			Alert.alert("Error", "Please enter your email");
			return;
		}

		setLoading(true);
		const { data, error } = await supabase.auth.signInWithOtp({
			email,
			options: { shouldCreateUser: false },
		});
		setLoading(false);

		if (error) {
			Alert.alert("Error", error.message);
			return;
		}
		Alert.alert("Success", "Please check your email for a reset code");
		console.log("Code sent");
	};

	const handleResetPassword = async () => {
		if (!email || !code || !newPassword) {
			Alert.alert("Error", "Please enter email, code, and new password");
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
			Alert.alert("Error", verifyResponse.error.message);
			return;
		}

		console.log("Temp login in via OTP");

		// 2. Reset password
		const updateResponse = await supabase.auth.updateUser({
			password: newPassword,
		});
		if (updateResponse.error) {
			setLoading(false);
			Alert.alert("Error", updateResponse.error.message);
			return;
		}
		console.log("Password reset successful");

		// 3. Logout
		const logoutResponse = await supabase.auth.signOut();
		setLoading(false);

		if (logoutResponse.error) {
			Alert.alert("Error", logoutResponse.error.message);
			return;
		}

		console.log("Logout");

		Alert.alert(
			"Success",
			"Password reset successfully. You can now login.",
			[
				{
					text: "OK",
					onPress: () => router.replace("/login"),
				},
			]
		);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Reset Password</Text>

			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				style={styles.input}
			/>

			<TextInput
				placeholder="Reset Code"
				value={code}
				onChangeText={setCode}
				keyboardType="numeric"
				style={styles.input}
			/>
			<TextInput
				placeholder="New Password"
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
				style={styles.input}
			/>

			<View style={{ marginBottom: 15 }}>
				<Button title="Send / Resend Code" onPress={handleSendCode} />
			</View>

			<View style={{ marginBottom: 15 }}>
				<Button title="Reset Password" onPress={handleResetPassword} />
			</View>

			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size={60} color="#007AFF" />
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		marginBottom: 15,
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
