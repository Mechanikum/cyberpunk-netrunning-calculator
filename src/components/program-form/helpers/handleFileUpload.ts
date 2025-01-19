import {ProgramFormValues} from "@/components/program-form";
import {UseFormReturn} from "react-hook-form";
import {z} from "zod";

const handleFileUpload = (form: UseFormReturn<ProgramFormValues>, schema: z.ZodSchema<any>) => {
	// Create an input element for file upload
	const input = document.createElement("input");
	input.type = "file";
	input.accept = "application/json"; // Restrict to JSON files
	input.style.display = "none"; // Hide the input element

	// Add the input to the DOM
	document.body.appendChild(input);

	// Trigger the file input dialog
	input.click();

	// Remove the input from the DOM immediately after the dialog is triggered
	document.body.removeChild(input);

	// Handle file selection
	input.onchange = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) {
			document.body.removeChild(input); // Cleanup input element
			return;
		}

		try {
			const text = await file.text(); // Read the file content
			const parsedData = JSON.parse(text); // Parse the JSON content

			// Validate the data using the schema
			const validatedData = schema.parse(parsedData);

			// Set the validated data to the form
			Object.keys(validatedData).forEach((key) => {
				form.setValue(key as keyof ProgramFormValues, validatedData[key], { shouldValidate: true });
			});

			console.log("Form data successfully uploaded and applied!");
		} catch (error) {
			if (error instanceof z.ZodError) {
				console.error("Validation error:", error.errors);
				alert("Uploaded file is invalid. Please check the fields and try again.");
			} else {
				console.error("File upload error:", error);
				alert("An error occurred while uploading the file.");
			}
		}
	};
};

export default handleFileUpload