import { UIComponent } from '../../types/dsl'

/**
 * Default DSL for new UI components using the new schema structure
 * Simple, creative welcome screen with modern design
 */
export const createDefaultDSL = (): UIComponent => ({
	id: "welcome_ui",
	name: "WelcomeUI",
	data: {
		// Default data for the welcome screen
		theme: {
			primaryColor: "#8b5cf6",
			secondaryColor: "#ec4899"
		},
		user: {
			isNew: true,
			hasSeenWelcome: true
		}
	},
	render: {
		id: "welcome_container",
		type: "div",
		props: {
			className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8"
		},
		children: [
			{
				id: "welcome_card",
				type: "div",
				props: {
					className: "bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6"
				},
				children: [
					{
						id: "welcome_header",
						type: "div",
						props: {
							className: "space-y-4"
						},
						children: [
							{
								id: "welcome_icon",
								type: "div",
								props: {
									className: "flex justify-center"
								},
								children: [
									{
										id: "icon_wrapper",
										type: "div",
										props: {
											className: "w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse"
										},
										children: [
											{
												id: "star_icon",
												type: "div",
												props: {
													className: "text-white text-2xl"
												},
												children: "✨"
											}
										]
									}
								]
							},
							{
								id: "welcome_title",
								type: "h1",
								props: {
									className: "text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
								},
								children: "Welcome to Superatom"
							},
							{
								id: "welcome_subtitle",
								type: "p",
								props: {
									className: "text-gray-600 text-lg leading-relaxed"
								},
								children: "Transform your ideas into beautiful UIs with the power of AI"
							}
						]
					},
					{
						id: "features_grid",
						type: "div",
						props: {
							className: "grid grid-cols-1 sm:grid-cols-3 gap-4 py-6"
						},
						children: [
							{
								id: "feature_ai",
								type: "div",
								props: {
									className: "bg-purple-50 rounded-lg p-4 space-y-2"
								},
								children: [
									{
										id: "ai_emoji",
										type: "div",
										props: {
											className: "text-2xl"
										},
										children: "🤖"
									},
									{
										id: "ai_text",
										type: "p",
										props: {
											className: "text-sm font-medium text-purple-700"
										},
										children: "AI Powered"
									}
								]
							},
							{
								id: "feature_realtime",
								type: "div",
								props: {
									className: "bg-blue-50 rounded-lg p-4 space-y-2"
								},
								children: [
									{
										id: "realtime_emoji",
										type: "div",
										props: {
											className: "text-2xl"
										},
										children: "⚡"
									},
									{
										id: "realtime_text",
										type: "p",
										props: {
											className: "text-sm font-medium text-blue-700"
										},
										children: "Real-time"
									}
								]
							},
							{
								id: "feature_visual",
								type: "div",
								props: {
									className: "bg-pink-50 rounded-lg p-4 space-y-2"
								},
								children: [
									{
										id: "visual_emoji",
										type: "div",
										props: {
											className: "text-2xl"
										},
										children: "🎨"
									},
									{
										id: "visual_text",
										type: "p",
										props: {
											className: "text-sm font-medium text-pink-700"
										},
										children: "Visual Editor"
									}
								]
							}
						]
					},
					{
						id: "cta_section",
						type: "div",
						props: {
							className: "space-y-4"
						},
						children: [
							{
								id: "prompt_hint",
								type: "div",
								props: {
									className: "bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200"
								},
								children: [
									{
										id: "hint_text",
										type: "p",
										props: {
											className: "text-gray-500 text-sm"
										},
										children: "💡 Try typing: \"Create a login form with email and password\""
									}
								]
							},
							{
								id: "get_started_text",
								type: "p",
								props: {
									className: "text-xs text-gray-400"
								},
								children: "Start typing your prompt in the chat to begin creating"
							}
						]
					}
				]
			}
		]
	}
})

/**
 * Alternative minimal default DSL for simpler use cases
 */
export const createMinimalDefaultDSL = (): UIComponent => ({
	id: "minimal_welcome",
	name: "MinimalWelcome",
	render: {
		id: "minimal_container",
		type: "div",
		props: {
			className: "min-h-screen flex items-center justify-center bg-gray-50"
		},
		children: [
			{
				id: "minimal_content",
				type: "div",
				props: {
					className: "text-center space-y-4"
				},
				children: [
					{
						id: "minimal_title",
						type: "h1",
						props: {
							className: "text-4xl font-bold text-gray-800"
						},
						children: "Welcome to Superatom"
					},
					{
						id: "minimal_description",
						type: "p",
						props: {
							className: "text-gray-600 max-w-md"
						},
						children: "Describe what you want to build and watch it come to life."
					}
				]
			}
		]
	}
})

/**
 * Get default DSL with data for new UIs
 */
export const getDefaultDSLWithData = (useMinimal: boolean = false) => {
	const ui = useMinimal ? createMinimalDefaultDSL() : createDefaultDSL()

	return {
		ui,
		data: {
			// Default data for the welcome screen
			theme: {
				primaryColor: "#8b5cf6",
				secondaryColor: "#ec4899"
			},
			user: {
				isNew: true,
				hasSeenWelcome: true
			}
		}
	}
}

// Default export for backward compatibility
export const default_dsl = createDefaultDSL()

export default createDefaultDSL
