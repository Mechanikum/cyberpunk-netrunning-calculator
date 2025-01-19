import {ProgramFormValues} from "@/components/program-form";

function getEnabledFields(formData: ProgramFormValues): string[] {
	const enabledFields: Set<string> = new Set();

	// Enable fields based on speed
	if (formData.speed > 0) {
		enabledFields.add("stats.defense");
	}

	// Enable fields based on types
	formData.type.forEach((type) => {
		switch (type) {
			case "anti_program":
			case "anti_system":
			case "anti_personnel":
				enabledFields.add("stats.attack");
				enabledFields.add("damage");
				break;
			case "cryptography":
			case "defense":
			case "service":
				enabledFields.add("rez");
				break;
			case "synth":
				enabledFields.add("rez");
				enabledFields.add("stats.defense");
				break;
		}
	});

	// Enable fields based on options
	formData.options.forEach((option) => {
		switch (option) {
			case "track":
			case "recog":
				enabledFields.add("stats.perception");
				break;
		}
	});

	return Array.from(enabledFields);
}

export default getEnabledFields