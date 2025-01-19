import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import types from "./data/types.json"
import options from "./data/options.json"
import icons from "./data/icons.json"
import intelligence from "./data/pseudo-intelligence.json"

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import NumericValueInput from "@/components/program-form/components/NumericValueInput.tsx";
import useFormInteractions from "@/components/program-form/helpers/useFormInteractions.tsx";
import handleCopy from "@/components/program-form/helpers/handleCopy.ts";
import {Button} from "@/components/ui/button.tsx";
import {Download, Upload} from "lucide-react";
import handleSaveAsJSON from "@/components/program-form/helpers/handleSaveAsJSON.ts";
import handleFileUpload from "@/components/program-form/helpers/handleFileUpload.ts";

const FormSchema = z.object({
	name: z.string().min(3),
	type: z.array(z.enum(Object.keys(types) as [string, ...string[]])).min(1),
	options: z.array(z.enum(Object.keys(options) as [string, ...string[]])),
	icon: z.enum(Object.keys(icons) as [string, ...string[]]),
	icon_desc: z.string(),
	intelligence: z.nullable(z.enum(Object.keys(intelligence) as [string, ...string[]])),
	strength: z.number().gt(0),
	speed: z.number(),
	stats: z.object({
		perception: z.number().min(0),
		attack: z.number().min(0),
		defense: z.number().min(0)
	}),
	damage: z.number(),

	difficulty: z.object({base: z.number(), ai: z.number()}),
	rez: z.number(),
	size: z.number()
})

export type ProgramFormValues = z.infer<typeof FormSchema>;

const ProgramForm = () => {

	const form = useForm<ProgramFormValues>({
		resolver: zodResolver(FormSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			type: ["anti_program"],
			options: [],
			icon: "simple",
			icon_desc: "",
			intelligence: null,
			strength: 3,
			speed: 0,
			stats: {
				perception: 3,
				attack: 3,
				defense: 3,
			},
			damage: 1,

			difficulty: {base: 14, ai: 0},
			size: 1,
			rez: 7,
		},
	})

	const {strength, accessibleFields} = useFormInteractions(form)

	const copyToClipboard = async (data: ProgramFormValues) => {
		try {
			const typesString = data.type.map((key) => types[key as keyof typeof types].name).join("/");
			const optionsContent = data.options.map((key) => options[key as keyof typeof options].name).join(", ");
			const optionsEntry = optionsContent.length ? {"Options:": optionsContent} : {}

			const perception = data.stats.perception ? {"PER:": data.stats.perception} : {}
			const speed = data.speed ? {"SPD:": data.speed} : {}
			const damage = data.speed ? {"DMG:": data.damage + "d6"} : {}

			const intelligenceValue = data.intelligence ? {"INT:": intelligence[data.intelligence as keyof typeof intelligence].intelligence} : {}
			const intelligenceName = data.intelligence ? {"Intelligence level:": intelligence[data.intelligence as keyof typeof intelligence].name} : {}
			const intelligenceDesc = data.intelligence ? {"Description:": intelligence[data.intelligence as keyof typeof intelligence].desc} : {}

			const dataToCopy = {
				"Name:": data.name,
				"Type:": typesString,
				"Size:": data.size + "mu",
				...optionsEntry,
				"Icon:": data.icon,
				"Icon Description:": data.icon_desc,
				...intelligenceName,
				...intelligenceDesc,

				...damage,
				...intelligenceValue,
				...perception,
				...speed,
				"DEF:": data.stats.defense,
				"ATK:": data.stats.attack,
				"REZ:": data.rez
			}

			handleCopy(dataToCopy)
		} catch (e) {
			console.error(e)
		}
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((data) => console.error(data), (e) => console.error(e))}
				className="flex-1 min-h-0 max-w-[60vw] grid grid-rows-[auto_1fr] grid-cols-3 gap-4 py-4 px-4"
			>
				<div className={"flex flex-col gap-4"}>
					<FormField
						control={form.control}
						name="name"
						render={({field}) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Program name" {...field} />
								</FormControl>
								<FormMessage/>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="icon"
						render={({field: {ref, ...restField}}) => {
							const list = Object.keys(icons)

							return (
								<FormItem>
									<FormLabel>Icon</FormLabel>
									<TooltipProvider>
										<div className={"grid grid-cols-[1fr_50px]"}>
											{list.map((key) => {
												const state = restField.value.includes(key)
												return (
													<Tooltip key={key}>
														<TooltipTrigger
															data-state={state}
															className={"grid col-span-2 transition-colors rounded py-0.5 px-2 cursor-pointer select-none grid-cols-subgrid items-center data-[state=false]:text-muted-foreground hover:bg-muted"}
															type={"button"}
															onClick={() => {
																restField.onChange(key)
															}}
														>
															<p className={"mr-auto"}>
																{icons[key as keyof typeof icons].name}
															</p>
															<p className={"text-2xl font-mono text-right"}>
																{icons[key as keyof typeof icons].value}
															</p>
														</TooltipTrigger>
														<TooltipContent>
															{icons[key as keyof typeof icons].desc}
														</TooltipContent>
													</Tooltip>
												)
											})}
										</div>
									</TooltipProvider>
									<FormMessage/>
								</FormItem>
							)
						}}
					/>

					<FormField
						control={form.control}
						name="icon_desc"
						render={({field}) => (
							<FormItem className={"flex-1"}>
								<FormLabel>Icon description</FormLabel>
								<FormControl>
									<Textarea className={"resize-none h-[calc(100%-30px)]"}
											  placeholder="How does your program icon looks" {...field} />
								</FormControl>
								<FormMessage/>
							</FormItem>
						)}
					/>
					<div className={"flex gap-2"}>
						<Button
							type={"button"}
							className={"flex-1"}
							variant={"outline"}
							disabled={!form.formState.isValid}
							onClick={() => copyToClipboard(form.getValues())}
						>
							Copy as text
						</Button>
						<Button
							type={"button"}
							size={"icon"}
							disabled={!form.formState.isValid}
							onClick={() => handleSaveAsJSON(form.getValues())}
						>
							<Download/>
						</Button>
						<Button
							variant={"destructive"}
							type={"button"}
							size={"icon"}
							disabled={!form.formState.isValid}
							onClick={() => handleFileUpload(form, FormSchema)}
						>
							<Upload/>
						</Button>
					</div>
				</div>

				<div className={"col-span-2 gap-4 grid grid-cols-subgrid grid-rows-[auto_1fr]"}>
					<div className={"col-span-2 grid grid-cols-5 grid-rows-2 gap-4 max-w-[750px]"}>
						<NumericValueInput
							// @ts-ignore
							control={form.control}
							name="strength"
							title="Strength"
							min={1}
							max={10}
						/>
						<NumericValueInput
							// @ts-ignore
							control={form.control}
							name="damage"
							title="DMG"
							adornment={"D6"}
							disabled={!accessibleFields.includes("damage")}
							min={0}
							max={10}
							className={"col-span-2"}
						/>
						<FormField
							control={form.control}
							name="difficulty"
							render={({field}) => (
								<FormItem>
									<FormLabel>Difficulty</FormLabel>
									<FormControl>
										<div className={"flex items-center gap-[1ch]"}>
											{field.value.ai ?
												<>
													<p {...field}
													   className={"text-xs select-none m-auto text-center text-n font-mono group-aria-disabled:text-muted-foreground"}>
														Base: <span className={"text-xl"}>{field.value.base}</span>
													</p>
													<p {...field}
													   className={"text-xs select-none m-auto text-center font-mono group-aria-disabled:text-muted-foreground"}>
														AI: <span className={"text-xl"}>{field.value.ai}</span>
													</p>
												</>
												:
												<p {...field}
												   className={"text-2xl select-none w-10 mx-auto text-center font-mono group-aria-disabled:text-muted-foreground"}>
													{field.value.base}
												</p>
											}
										</div>
									</FormControl>
									<FormMessage/>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="size"
							render={({field}) => (
								<FormItem>
									<FormLabel>Size</FormLabel>
									<FormControl>
										<div className={"flex items-center"}>
											<p {...field}
											   className={"text-2xl select-none w-10 mx-auto text-center font-mono group-aria-disabled:text-muted-foreground"}>
												{field.value}<span className={"text-base ml-1"}>mu</span>
											</p>
										</div>
									</FormControl>
									<FormMessage/>
								</FormItem>
							)}
						/>
						<NumericValueInput
							// @ts-ignore
							control={form.control}
							name="stats.perception"
							title="PER"
							min={0}
							max={strength}
							disabled={!accessibleFields.includes("stats.perception")}
							className={"row-start-2"}
						/>
						<NumericValueInput
							// @ts-ignore
							control={form.control}
							name="speed"
							title="SPD"
							min={0}
							max={10}
							className={"row-start-2"}
						/>
						<NumericValueInput
							// @ts-ignore
							control={form.control}
							name="stats.attack"
							title="ATK"
							min={0}
							max={strength}
							disabled={!accessibleFields.includes("stats.attack")}
							className={"row-start-2"}
						/>
						<NumericValueInput
							// @ts-ignore
							control={form.control}
							name="stats.defense"
							title="DEF"
							min={0}
							max={strength}
							disabled={!accessibleFields.includes("stats.defense")}
							className={"row-start-2"}
						/>
						<FormField
							control={form.control}
							name="rez"
							render={({field}) => (
								<FormItem className={"row-start-2"}>
									<FormLabel>REZ</FormLabel>
									<FormControl>
										<div className={"flex items-center"}>
											<p {...field}
											   className={"text-2xl select-none w-10 mx-auto text-center font-mono group-aria-disabled:text-muted-foreground"}>
												{field.value}
											</p>
										</div>
									</FormControl>
									<FormMessage/>
								</FormItem>
							)}
						/>
					</div>
					<div className={"flex flex-col gap-4"}>
						<FormField
							control={form.control}
							name="type"
							render={({field: {ref, ...restField}}) => {
								const list = Object.keys(types)

								const addItem = (keys: typeof restField.value) => {
									if (restField.value.length <= 1) {
										restField.onChange([...restField.value, ...keys])
									} else {
										restField.onChange([restField.value[1], ...keys])
									}
								}
								const removeItem = (keys: typeof restField.value) => {
									if (restField.value.length != 1) restField.onChange(restField.value.filter((value) => !keys.includes(value)))
								}

								return (
									<FormItem>
										<FormLabel>Type</FormLabel>
										<div className={"grid grid-cols-[1fr_50px]"}>
											{list.map((key) => {
												const state = restField.value.includes(key)
												return (
													<div
														data-state={state}
														key={key}
														className={"grid col-span-2 transition-colors rounded py-0.5 px-2 cursor-pointer select-none grid-cols-subgrid items-center data-[state=false]:text-muted-foreground hover:bg-muted"}
														onClick={() => {
															!state ?
																addItem([key as keyof typeof types])
																:
																removeItem([key as keyof typeof types])

														}}
													>
														<p className={"mr-auto"}>
															{types[key as keyof typeof types].name}
														</p>
														<p className={"text-2xl font-mono text-right"}>
															{types[key as keyof typeof types].value}
														</p>
													</div>
												)
											})}
										</div>
										<FormMessage/>
									</FormItem>
								)
							}}
						/>

						<FormField
							control={form.control}
							name="options"
							render={({field: {ref, ...restField}}) => {
								const list = Object.keys(options)

								const addItem = (keys: typeof restField.value) => {
									restField.onChange([...restField.value, ...keys])
								}
								const removeItem = (keys: typeof restField.value) => {
									restField.onChange(restField.value.filter((value) => !keys.includes(value)))
								}

								return (
									<FormItem>
										<FormLabel>Options</FormLabel>
										<div className={"grid grid-cols-[1fr_50px]"}>
											<TooltipProvider>
												{list.map((key) => {
													const state = restField.value.includes(key)
													return (
														<Tooltip key={key}>
															<TooltipTrigger
																data-state={state}
																type={"button"}
																className={"grid col-span-2 transition-colors rounded py-0.5 px-2 cursor-pointer select-none grid-cols-subgrid items-center data-[state=false]:text-muted-foreground hover:bg-muted"}
																onClick={() => {
																	!state ?
																		addItem([key as keyof typeof options])
																		:
																		removeItem([key as keyof typeof options])

																}}
															>
																<p className={"mr-auto"}>
																	{options[key as keyof typeof options].name}
																</p>
																<p className={"text-2xl font-mono text-right"}>
																	{options[key as keyof typeof options].value}
																</p>
															</TooltipTrigger>
															<TooltipContent>
																{options[key as keyof typeof options].desc}
															</TooltipContent>
														</Tooltip>
													)
												})}
											</TooltipProvider>
										</div>
										<FormMessage/>
									</FormItem>
								)
							}}
						/>
					</div>
					<FormField
						control={form.control}
						name="intelligence"
						render={({field: {ref, ...restField}}) => {
							const list = Object.keys(intelligence)
							const handleClick = (key: string) => {
								if (restField.value === key) restField.onChange(null)
								else restField.onChange(key)
							}

							return (
								<FormItem>
									<FormLabel>Pseudo-intelligence</FormLabel>
									<TooltipProvider>
										<div className={"grid grid-cols-[1fr_auto_auto]"}>
											{list.map((key) => {
												const state = !!restField.value?.includes(key)
												return (
													<Tooltip key={key}>
														<TooltipTrigger
															data-state={state}
															type={"button"}
															className={"grid col-span-3 transition-colors rounded py-0.5 px-2 cursor-pointer select-none grid-cols-subgrid items-center data-[state=false]:text-muted-foreground hover:bg-muted"}
															onClick={() => handleClick(key)}
														>
															<p className={"mr-auto"}>
																{intelligence[key as keyof typeof intelligence].name}
															</p>
															<p className={"text-sm font-mono text-nowrap mr-4"}>
																INT {intelligence[key as keyof typeof intelligence].intelligence}
															</p>
															<p className={"text-2xl font-mono text-right"}>
																{intelligence[key as keyof typeof intelligence].value}
															</p>
														</TooltipTrigger>
														<TooltipContent>
															{intelligence[key as keyof typeof intelligence].desc}
														</TooltipContent>
													</Tooltip>
												)
											})}
										</div>
									</TooltipProvider>
									<FormMessage/>
								</FormItem>
							)
						}}
					/>
				</div>

			</form>
		</Form>

	)
}

export default ProgramForm