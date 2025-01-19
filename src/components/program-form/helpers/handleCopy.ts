function handleCopy(record: Record<string, unknown>) {
	const rows = Object.entries(record).map(([key, value]) => {
		// Convert value to a tab-separated string if it's an array
		const formattedValue = Array.isArray(value) ? value.join("\t") : value;
		return `${key}\t${formattedValue}`;
	});

	// Join all rows with newlines
	const clipboardText = rows.join("\n");

	// Copy the result to the clipboard
	navigator.clipboard.writeText(clipboardText).then(() => {
		console.log("Record copied to clipboard!");
	}).catch((err) => {
		console.error("Failed to copy record to clipboard:", err);
	});
}

export default handleCopy