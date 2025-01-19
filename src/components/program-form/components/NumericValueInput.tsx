import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Minus, Plus} from "lucide-react";
import React, {ComponentPropsWithRef} from "react";
import {cn} from "@/lib/utils.ts";

interface NumericValueInput extends ComponentPropsWithRef<typeof FormField> {
	title: string,
	disabled?: boolean,
	max: number,
	min: number,
	className?: string,
	adornment: string,
}

const NumericValueInput: React.FC<NumericValueInput> = ({title, adornment, disabled, max, min, className, ...props}) => {

	return (
		<FormField
			{...props}
			render={({field}) => {

				const handleIncrement = () => {
					if (field.value != max) field.onChange(field.value + 1)
				}

				const handleDecrement = () => {
					if (field.value != min) field.onChange(field.value - 1)
				}

				return (
					<FormItem aria-disabled={disabled} className={cn("group", className)}>
						<FormLabel className={"group-aria-disabled:text-muted-foreground"}>{title}</FormLabel>
						<FormControl>
							<div className={"flex gap-1 items-center"}>
								<Button
									disabled={disabled || field.value === min}
									type={"button"}
									variant={"ghost"}
									size={"icon"}
									onClick={handleDecrement}
									className={"aspect-square"}
								>
									<Minus/>
								</Button>
								<p {...field}
								   className={"text-2xl select-none flex-1 text-center font-mono group-aria-disabled:text-muted-foreground"}>
									{disabled ? 0 : field.value}{adornment}
								</p>
								<Button
									disabled={disabled || field.value === max}
									type={"button"}
									variant={"ghost"}
									size={"icon"}
									onClick={handleIncrement}
									className={"aspect-square"}
								>
									<Plus/>
								</Button>
							</div>
						</FormControl>
						<FormMessage/>
					</FormItem>
				)
			}}
		/>
	)
}

export default NumericValueInput