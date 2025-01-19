import {useEffect, useRef} from "react";
import {ProgramFormValues} from "@/components/program-form";
import {UseFormReturn} from "react-hook-form";
import calculateDifficulty from "@/components/program-form/helpers/calculateDifficulty.ts";
import getEnabledFields from "@/components/program-form/helpers/getEnabledFields.ts";

function calculateMU(difficulty: number) {
	if (difficulty < 10) return 1;
	return Math.ceil((difficulty - 10) / 5) + 1;
}

function useFormInteractions(form: UseFormReturn<ProgramFormValues>) {
	const lastStrength = useRef<number>(3);
	const enabledFields = useRef<string[]>(["stats.attack"]);

	useEffect(() => {
		const subscription = form.watch((value, {name}) => {
			if (name === "strength" && value.stats) {
				const strengthChange = value.strength! - lastStrength.current;

				Object.keys(value.stats!).map((key) => {
					const statValue = value.stats![key as keyof typeof value.stats]! + strengthChange

					form.setValue(
						`stats.${key as keyof typeof value.stats}`,
						statValue > 0 ? statValue : 0,
						{shouldValidate: true}
					)
				})
				lastStrength.current = value.strength!;
			}
			if (name != "difficulty" && name != "size" && name != "rez") {
				const difficulty = calculateDifficulty(form.getValues())
				form.setValue("difficulty", difficulty)
				const rez = Math.floor((difficulty.base + difficulty.ai) / 2)
				form.setValue("rez", rez)
				const size = calculateMU(difficulty.base + difficulty.ai)
				form.setValue("size", size)
			}

			if (name === "type" || name === "options" || name === "speed") {
				// Handle enabled fields
				const fields = getEnabledFields(form.getValues());

				// Reset stats to strength if not enabled
				const statsToReset = ["stats.perception", "stats.attack", "stats.defense"];
				const statsToZero = ["damage"]
				statsToReset.forEach((statField) => {
					if (!fields.includes(statField)) {
						form.setValue(
							statField as keyof ProgramFormValues,
							value.strength ?? 0,
							{ shouldValidate: true }
						);
					}
				});

				statsToZero.forEach((statField) => {
					if (!fields.includes(statField)) {
						form.setValue(
							statField as keyof ProgramFormValues,
							0,
							{ shouldValidate: true }
						);
					}
				});

				enabledFields.current = fields
			}
		});
		return () => subscription.unsubscribe();
	}, [form]);

	return {strength: lastStrength.current, accessibleFields: enabledFields.current}
}

export default useFormInteractions