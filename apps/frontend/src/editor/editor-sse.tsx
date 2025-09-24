import { useEffect, useState, useMemo, useCallback } from 'react'
import { UIComponent } from '../types/dsl'
import { trpc } from '../utils/trpc'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import SelectableUIRenderer from './components/SelectableUIRenderer'
import { DatabaseUtils, parseDSLFromVersion } from '../utils/database'
import { createDefaultDSL } from '../lib/utils/default-dsl'
import NodeEditor from './components/NodeEditor'
import { findNodeById, updateNodeById } from './utils/node-operations'
import { COMPLEX_DSL } from '@/test/complex-dsl'
import { editorModeStore } from '../stores/mobx_editor_mode_store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const default_ui_schema: UIComponent = createDefaultDSL()
		
const EditorSSE = () => {
	const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
	const [input, setInput] = useState('')

	const [currentSchema, setCurrentSchema] = useState<UIComponent | null>(COMPLEX_DSL)
	const [projectId, setProjectId] = useState<string>("");
	const [isDSLLoading, setIsDSLLoading] = useState<boolean>(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string>('');

	// SSE specific states
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [sseEvents, setSSEEvents] = useState<Array<{ type: string, message: string, data?: any, timestamp: Date }>>([]);
	
	const { uiId } = useParams<{ uiId: string }>();

	const { data: uidata} = trpc.uisGetById.useQuery(
		{ id: uiId! },   // non-null assertion
		{ enabled: !!uiId } // only run query if uiId exists
	);

	useEffect(() => {
		if (uiId && uidata) {
			const ui = uidata.ui;
			setProjectId(()=>{
				return ui.projectId.toString()
			})
		}
	}, [uiId, uidata]);

	// Load existing UI DSL on component mount - run after projectId is set
	// useEffect(() => {
	// 	const loadExistingUI = async () => {
	// 		if (!projectId || !uiId || projectId === "") return;
			
	// 		setIsDSLLoading(true);
	// 		try {
	// 			console.log('Loading existing UI for projectId:', projectId, 'uiId:', uiId);
			
	// 			if (uidata && uidata.ui) {
	// 				const ui_version = uidata.ui.uiVersion;

	// 				let dslToUse = null;

	// 				try {
	// 					const versionResult = await getVersionQuery.refetch();
	// 					if (versionResult.data && versionResult.data.versions) {
	// 						const versions = versionResult.data.versions;
							
	// 						// Load conversations from all versions
	// 						const conversations: Array<{ role: string, content: string }> = [];
							
	// 						if (Array.isArray(versions)) {
	// 							// Sort versions by creation date (assuming id is chronological or there's a createdAt field)
	// 							const sortedVersions = [...versions].sort((a, b) => a.id - b.id);
								
	// 							sortedVersions.forEach(version => {
	// 								if (version.prompt && version.prompt.trim()) {
	// 									// Add user message (the prompt)
	// 									conversations.push({
	// 										role: 'user',
	// 										content: version.prompt
	// 									});
	// 									// Add assistant response
	// 									conversations.push({
	// 										role: 'assistant',
	// 										content: 'UI generated successfully!'
	// 									});
	// 								}
	// 							});
	// 						}
							
	// 						// Set conversations in messages state
	// 						if (conversations.length > 0) {
	// 							setMessages(conversations);
	// 						}
							
	// 						// Find the current version's DSL
	// 						const versionData = Array.isArray(versions) ? 
	// 							versions.find(v => v.id === ui_version) : null;
	// 						if (versionData && versionData.dsl) {
	// 							dslToUse = versionData.dsl;
	// 						}
	// 					}
	// 				} catch (versionError) {
	// 					console.error('Failed to fetch version data:', versionError);
	// 				}

	// 				// console.log('dsl to use', dslToUse);
	// 					// Parse and set the DSL if we found it using new utilities
	// 				if (dslToUse) {
	// 					try {
	// 						const uiComponent = parseDSLFromVersion(dslToUse);

	// 						if (uiComponent) {
	// 							console.log('Setting current schema from DSL:', uiComponent);
	// 							setCurrentSchema(uiComponent);
	// 						}

	// 					} catch (parseError) {
	// 						console.error('Failed to parse DSL:', parseError);
	// 					}
	// 				} else {
	// 					console.error('No DSL found for this UI');
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error('Failed to load existing UI:', error);
	// 		} finally {
	// 			setIsDSLLoading(false);
	// 		}
	// 	};
	// 	loadExistingUI();
	// }, [projectId, uiId]); // Run when projectId or uiId changes


	// Prompt history state
	const [promptHistory, setPromptHistory] = useState<string[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)



	// Local storage key for prompt history
	const PROMPT_HISTORY_KEY = 'prompt_history'

	// Load prompt history from localStorage on component mount
	useEffect(() => {
		const savedHistory = localStorage.getItem(PROMPT_HISTORY_KEY)
		if (savedHistory) {
			try {
				const parsedHistory = JSON.parse(savedHistory)
				if (Array.isArray(parsedHistory)) {
					setPromptHistory(parsedHistory)
				}
			} catch (error) {
				console.error('Failed to parse prompt history from localStorage:', error)
			}
		}
	}, [])

	// Save prompt to history and localStorage
	const savePromptToHistory = (prompt: string) => {
		if (!prompt.trim()) return

		setPromptHistory(prev => {
			// Remove duplicate if it exists and add to beginning
			const filtered = prev.filter(p => p !== prompt.trim())
			const newHistory = [prompt.trim(), ...filtered].slice(0, 50) // Keep only last 50 prompts
			
			// Save to localStorage
			localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(newHistory))
			
			return newHistory
		})
		
		// Reset history index
		setHistoryIndex(-1)
	}

	// Navigate through prompt history
	const navigateHistory = (direction: 'up' | 'down') => {
		if (promptHistory.length === 0) return

		let newIndex: number
		
		if (direction === 'up') {
			newIndex = historyIndex + 1
			if (newIndex >= promptHistory.length) {
				newIndex = promptHistory.length - 1
			}
		} else {
			newIndex = historyIndex - 1
			if (newIndex < -1) {
				newIndex = -1
			}
		}

		setHistoryIndex(newIndex)
		
		if (newIndex === -1) {
			setInput('')
		} else {
			setInput(promptHistory[newIndex])
		}
	}


	// Add version query to fetch DSL if needed
	const getVersionQuery = trpc.versionsGetAll.useQuery(
		{ uiId: uiId }, // Pass uiId to get versions for this UI
		{ enabled: false } // Only run manually
	);

	// Database operations using centralized utilities
	const { createVersionAndUpdateUI, isLoading: isSavingToDatabase } = DatabaseUtils.useCreateVersionAndUpdateUI()

	// SSE UI Generation Function
	const generateUIWithSSE = async (prompt: string, projectId: string, currentSchema: UIComponent) => {
		setIsGenerating(true);
		setSSEEvents([]);
		
		try {
			// Use the SSE endpoint from app controller
			const response = await fetch(`${API_URL}/generate-ui-sse`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					prompt,
					projectId,
					currentSchema
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error('No response body');
			}

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						try {
							const eventData = JSON.parse(line.slice(6));
							
							const sseEvent = {
								type: eventData.type || 'unknown',
								message: eventData.message || eventData.data || 'Unknown event',
								data: eventData.data,
								timestamp: new Date()
							};

							setSSEEvents(prev => [...prev, sseEvent]);

							// Handle completion event
							if (eventData.type === 'complete' && eventData.data) {
								const response = eventData.data;
								if (response.success && response.data) {
									const ui_schema = response.data.ui;
									const ui_data = response.data.data;

									// Merge data into UIComponent structure
									const uiComponent: UIComponent = {
										...ui_schema,
										data: ui_data || {}
									};

									console.log('SSE UI generated:', uiComponent);
									setCurrentSchema(uiComponent);

									// Create version using new database utilities
									createVersionAndUpdateUI({
										uiId: uiId!,
										uiComponent: uiComponent,
										prompt: prompt,
										operation: 'SSE Generation'
									}, uidata);

									setMessages(prev => [...prev, {
										role: 'assistant',
										content: 'UI generated successfully with SSE!'
									}]);
								}
							}
						} catch (e) {
							console.error('Failed to parse SSE event:', e);
						}
					}
				}
			}
		} catch (error) {
			console.error('SSE Error:', error);
			setSSEEvents(prev => [...prev, {
				type: 'error',
				message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				timestamp: new Date()
			}]);
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: 'Failed to generate UI. Please try again.'
			}]);
		} finally {
			setIsGenerating(false);
		}
	};
	
	// Define handlers that can be used in generated UI
	const handlers = useMemo(() => ({
		handleClick: () => alert('Button clicked!'),
		handleSubmit: (e: React.FormEvent) => {
			e.preventDefault()
		}
	}), [])

	// Handle schema updates from copy-paste operations
	const handleSchemaUpdate = useCallback((newSchema: UIComponent, operation?: string) => {
		// Log DSL before and after update

		setCurrentSchema(newSchema)
		console.log('🔄 Schema updated via:', operation || 'unknown operation', newSchema.id)

		// Save to database using new database utilities
		// if (uiId) {
		// 	try {
		// 		createVersionAndUpdateUI({
		// 			uiId: uiId,
		// 			uiComponent: newSchema,
		// 			prompt: `Schema updated via ${operation || 'copy/paste/cut/delete'}`,
		// 			operation: operation || 'Schema Update'
		// 		}, uidata, {
		// 			onComplete: () => {
		// 				console.log('✅ Schema update saved successfully')
		// 			},
		// 			onError: (error, step) => {
		// 				console.error(`❌ Failed to save schema update at ${step}:`, error)
		// 			}
		// 		});
		// 	} catch (error) {
		// 		console.error('Failed to save schema update to database:', error)
		// 	}
		// } else {
		// 	console.warn('Cannot save to database: missing uiId')
		// }
	}, [uiId, uidata, createVersionAndUpdateUI, currentSchema])

	// Handle schema updates silently in background (no toasts for node editor)
	const handleSchemaUpdateSilent = useCallback((newSchema: UIComponent, operation: string) => {
		console.log('🔄 Saving schema update silently:', operation, newSchema.id)

		// Save to database using new database utilities
		if (uiId) {
			try {
				createVersionAndUpdateUI({
					uiId: uiId,
					uiComponent: newSchema,
					prompt: `Schema updated via ${operation}`,
					operation: operation || 'Schema Update'
				}, uidata, {
					onComplete: () => {
						console.log('✅ Schema update saved successfully (silent)')
					},
					onError: (error, step) => {
						console.error(`❌ Failed to save schema update at ${step}:`, error)
						// Only log errors for node editor, no toasts
					}
				});
			} catch (error) {
				console.error('Failed to save schema update to database:', error)
			}
		} else {
			console.warn('Cannot save to database: missing uiId')
		}
	}, [uiId, uidata, createVersionAndUpdateUI])

	// Handle node selection - opens modal when a node is selected
	const handleNodeSelection = useCallback((selectedNodeId: string) => {
		if (selectedNodeId && currentSchema) {
			// Use the utility function to find the node
			const selectedNode = findNodeById(currentSchema, selectedNodeId)
			// console.log('Found node:', selectedNode)

			if (selectedNode) {
				// Update window.SAEDITOR with selected node data
				if (window.SAEDITOR) {
					// Extract text and className from the node
					const nodeProps = (selectedNode as any).props || selectedNode

					// Check for text in multiple locations (must be string, not array/object)
					let textValue = ''
					let hasStringText = false

					// console.log('Extracting text from node:', {
					// 	selectedNode,
					// 	nodeProps,
					// 	directNodeText: (selectedNode as any).text,
					// 	directPropsText: nodeProps.text,
					// 	nestedPropsText: nodeProps.props?.text,
					// 	children: nodeProps.children
					// })

					// Only consider it "text" if it's actually a string, not an array or object
					// Priority: props.children -> direct children -> other text properties
					if (typeof (selectedNode as any).props?.children === 'string') {
						textValue = (selectedNode as any).props.children
						hasStringText = true
					} else if (typeof (selectedNode as any).children === 'string') {
						textValue = (selectedNode as any).children
						hasStringText = true
					} else if (typeof (selectedNode as any).text === 'string') {
						textValue = (selectedNode as any).text
						hasStringText = true
					} else if (typeof nodeProps.text === 'string') {
						textValue = nodeProps.text
						hasStringText = true
					} else if (typeof nodeProps.props?.text === 'string') {
						textValue = nodeProps.props.text
						hasStringText = true
					} else if (typeof nodeProps.children === 'string') {
						textValue = nodeProps.children
						hasStringText = true
					}

					// console.log('Final text value:', textValue)
					// console.log('Has string text:', hasStringText)
					// console.log('Setting hasText to:', hasStringText)

					window.SAEDITOR.text = textValue
					window.SAEDITOR.className = nodeProps.className || (selectedNode as any).props?.className || ''
					window.SAEDITOR.nodeId = selectedNodeId
					window.SAEDITOR.hasText = hasStringText

					// console.log('Window.SAEDITOR after update:', window.SAEDITOR)
				}
				// Update React state to trigger re-render
				setSelectedNodeId(selectedNodeId)
				// NodeEditor is now always visible
				console.log('Selected node for editing:', selectedNodeId)
			}
		}
	}, [currentSchema])

	// Memoize the renderer to prevent unnecessary re-renders
	const memoizedRenderer = useMemo(() => {
		if (!currentSchema) return null
		return (
			<SelectableUIRenderer
				uiComponent={currentSchema}
				handlers={handlers}
				enableSelection={editorModeStore.isDev} // Only enable selection in dev mode
				onSchemaUpdate={handleSchemaUpdate}
				onNodeSelect={handleNodeSelection}
			/>
		)
	}, [currentSchema, handlers, handleSchemaUpdate, handleNodeSelection, editorModeStore.isDev, editorModeStore.isPreview])

	const handleSend = async () => {
		if (!input.trim()) return
		
		if (!projectId || projectId === "") {
			console.error('ProjectId not available yet');
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: 'Please wait for the project to load before generating UI.'
			}])
			return;
		}

		const currentInput = input
		
		// Save prompt to history
		savePromptToHistory(currentInput)
		
		setMessages([...messages, { role: 'user', content: input }])
		
		// Use SSE UI generation
		await generateUIWithSSE(currentInput, projectId, currentSchema || default_ui_schema);
	}


	return (
		<div className="flex h-screen bg-white overflow-hidden">
			{/* Left Side - Generated React Component */}
			<div className="flex-1 bg-white bg-opacity-90 border-r border-gray-300 shadow-xl overflow-hidden">
				<div className="h-full flex flex-col">
					{/* Preview Content */}
					<div className="flex-1 relative overflow-y-auto">
						{isDSLLoading ? (
							<div className="h-full flex items-center justify-center bg-white">
								<div className="text-center space-y-6">
									<div className="relative w-20 h-20 mx-auto">
										<div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-full opacity-75 animate-spin"></div>
										<div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
											<svg className="w-8 h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
										</div>
									</div>
									<div className="space-y-2">
										<h3 className="text-xl font-semibold text-slate-700">Loading Your UI</h3>
										<p className="text-slate-500 max-w-sm mx-auto">Fetching and setting up the DSL data...</p>
									</div>
									<div className="flex justify-center space-x-1">
										<div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
										<div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
										<div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
									</div>
								</div>
							</div>
						) : currentSchema ? (
							<div className="">
								{memoizedRenderer}
							</div>
						) : (
							<div className="h-full flex items-center justify-center">
								<div className="text-center space-y-4">
									<div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
										<svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
										</svg>
									</div>
									<h3 className="text-xl font-semibold text-slate-700">Ready to Create</h3>
									<p className="text-slate-500 max-w-sm">Describe what you want to build and watch it come to life</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Right Side - Chat Interface with SSE Logs */}
			<div className="w-96 bg-slate-200 flex flex-col shadow-2xl overflow-hidden">
				{/* Chat Header */}
				<div className="py-1">
					<div className="flex items-center">
						<button
							onClick={() => editorModeStore.toggleMode()}
							className=" p-1.5 flex justify-center items-center hover:bg-slate-400 outline rounded-lg font-medium transition-all duration-200"
						>
							<span className="w-2 h-2 rounded-full"></span>
							<span>{editorModeStore.currentMode.toUpperCase()}</span>
						</button>
					</div>
				</div>

				{/* Node Editor - Below header */}

				{editorModeStore.isDev && (
					<NodeEditor
						selectedNodeId={selectedNodeId}
						onUpdate={(text: string, className: string) => {
								// Update the schema with new text and className
								if (currentSchema && window.SAEDITOR && window.SAEDITOR.nodeId) {
									// Log DSL before and after node edit
									console.log('✏️ NODE EDIT - NodeId:', window.SAEDITOR.nodeId)
									console.log('🔴 ORIGINAL DSL:', currentSchema)
	
									const updatedSchema = updateNodeById(currentSchema, window.SAEDITOR.nodeId, text, className)
	
									if (updatedSchema) {
										console.log('🟢 UPDATED DSL:', updatedSchema)
										console.log('-----------------------------------')
	
										setCurrentSchema(updatedSchema as UIComponent)
										// Save to database in background without toasts
										handleSchemaUpdateSilent(updatedSchema as UIComponent, 'node-edit')
									}
								}
							}}
						/>
				)}

				{/* Messages and SSE Logs */}
				<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50">
					{messages.length === 0 && (
						<div className="text-center py-8">
							<div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
								<svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
							</div>
							<p className="text-slate-500 text-sm">Start a conversation to generate your UI with live logs</p>
						</div>
					)}
					
					{messages.map((msg, i) => (
						<div key={i} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
							<div className={`inline-block p-2.5 rounded-2xl max-w-[85%] shadow-sm ${msg.role === 'user'
								? 'bg-blue-500 text-white'
								: 'bg-white border border-gray-200 text-gray-800 shadow-md'
								}`}>
								<p className="text-sm leading-relaxed">{msg.content}</p>
							</div>
						</div>
					))}
					
					{/* SSE Live Logs */}
					{isGenerating && (
						<div className="text-left">
							<div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
								<div className="flex items-center space-x-2 mb-3">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
									<span className="text-green-400 text-xs font-medium">LIVE LOGS</span>
								</div>
								<div className="space-y-1 max-h-32 overflow-y-auto">
									{sseEvents.map((event, index) => (
										<div key={index} className="text-xs font-mono">
											<span className="text-gray-400">
												{event.timestamp.toLocaleTimeString()}
											</span>
											<span className={`ml-2 ${
												event.type === 'error' ? 'text-red-400' :
												event.type === 'complete' ? 'text-green-400' :
												'text-blue-400'
											}`}>
												{event.message}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
					
					{isGenerating && (
						<div className="text-left">
							<div className="inline-block p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
								<div className="flex items-center space-x-3">
									<div className="flex space-x-1">
										<div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
										<div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
										<div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
									</div>
									<span className="text-sm text-slate-600">Generating your UI with SSE...</span>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Input Area */}
				<div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-2.5">
					<div className="space-y-3">
						<textarea
							value={input}
							onChange={(e) => {
								setInput(e.target.value)
								// Reset history index when user types
								if (historyIndex !== -1) {
									setHistoryIndex(-1)
								}
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault()
									handleSend()
								} else if (e.key === 'ArrowUp') {
									e.preventDefault()
									navigateHistory('up')
								} else if (e.key === 'ArrowDown') {
									e.preventDefault()
									navigateHistory('down')
								}
							}}
							className="w-full p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-slate-400"
							placeholder="Describe your UI... (e.g., 'Show me list of users in a table')"
							rows={3}
							disabled={isGenerating}
						/>
						<div className="flex justify-between items-center">
							<p className="text-xs text-slate-500">
								Enter to send • Shift+Enter for new line • ↑/↓ for history
							</p>
							<button
								onClick={handleSend}
								disabled={isGenerating || !input.trim()}
								className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
							>
								{isGenerating ? (
									<div className="flex items-center space-x-2">
										<svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
											<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
											<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
										</svg>
										<span>Generating...</span>
									</div>
								) : (
									<div className="flex items-center space-x-2">
										<span>Generate SSE</span>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
										</svg>
									</div>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default observer(EditorSSE)