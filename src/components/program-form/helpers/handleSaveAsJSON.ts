import {ProgramFormValues} from "@/components/program-form";

const handleSaveAsJSON = (formData: ProgramFormValues) => {
	// Serialize form data to JSON
	const jsonData = JSON.stringify(formData, null, 2);

	// Create a Blob with the JSON data
	const blob = new Blob([jsonData], { type: "application/json" });

	// Create a link element
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `Cyberpunk_RED-Program-${formData.name}.json`; // File name for the download

	// Programmatically trigger the download
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link); // Clean up
};

export default handleSaveAsJSON