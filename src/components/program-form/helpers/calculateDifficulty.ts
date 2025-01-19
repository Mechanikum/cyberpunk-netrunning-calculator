import {ProgramFormValues} from "@/components/program-form";
import icons from "@/components/program-form/data/icons.json";
import types from "@/components/program-form/data/types.json";
import options from "@/components/program-form/data/options.json";
import intelligence from "@/components/program-form/data/pseudo-intelligence.json";

function calculateDifficulty(formData: ProgramFormValues): ProgramFormValues['difficulty'] {
	let base = 0;
	let ai = 0;

	// Add icon value
	base += icons[formData.icon as keyof typeof icons].value;

	// Add the sum of selected type values
	base += formData.type.reduce((sum, type) => sum + types[type as keyof typeof types].value, 0);

	// Add the sum of selected option values
	base += formData.options.reduce((sum, option) => sum + options[option as keyof typeof options].value, 0);

	// Add strength
	base += formData.strength;

	// Add speed
	base += formData.speed;

	// Calculate stats difference discount
	const stats = formData.stats;
	const totalNegativeDifference = Math.max(0, formData.strength - stats.perception) +
		Math.max(0, formData.strength - stats.attack) +
		Math.max(0, formData.strength - stats.defense)
	const discount = Math.floor(totalNegativeDifference / 2);
	base -= discount;

	// Add damage-based difficulty contribution
	if (formData.damage > 0) {
		const damageContribution = formData.type.reduce((sum, type) => {
			if (type === "anti_program" || type === "anti_system") {
				return sum + formData.damage * 5;
			}
			if (type === "anti_personnel") {
				return sum + formData.damage * 10;
			}
			return sum;
		}, 0);
		base += damageContribution;
	}

	// Calculate ai_difficulty based on intelligence
	if (formData.intelligence && intelligence[formData.intelligence as keyof typeof intelligence].cores === 1) {
		base += intelligence[formData.intelligence as keyof typeof intelligence].value;
	} else if (formData.intelligence) {
		ai = intelligence[formData.intelligence as keyof typeof intelligence].value;
	}

	return {base, ai};
}

export default calculateDifficulty