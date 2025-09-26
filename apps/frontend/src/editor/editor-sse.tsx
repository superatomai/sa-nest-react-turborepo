import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { UIComponent, UIComponentSchema } from '../types/dsl'
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
import { PERFORMANCE_OPTIMIZED_DSL } from '@/test/performance-optimized-dsl'
import { COMPONENT_DSL } from '@/test/componet-dsl'
import { duckdb_dashboard_dsl } from '@/test/duckdb-dashboard'
import { supplier_risks_dsl } from '@/test/supplier-risks'
import {API_URL as API_BASE_URL} from '../config/api'

const API_URL = API_BASE_URL; // points to backend api
const default_ui_schema: UIComponent = createDefaultDSL()
		
const EditorSSE = () => {
	const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
	const [input, setInput] = useState('')

	const [currentSchema, setCurrentSchema] = useState<UIComponent | null>()
	const [isDSLLoading, setIsDSLLoading] = useState<boolean>(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string>('');

	// SSE specific states
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [sseEvents, setSSEEvents] = useState<Array<{ type: string, message: string, data?: any, timestamp: Date }>>([]);
	const [llmStream, setLlmStream] = useState<string>('');
	const [isLlmStreaming, setIsLlmStreaming] = useState<boolean>(false);
	const [isLlmAccordionOpen, setIsLlmAccordionOpen] = useState<boolean>(true);
	const llmStreamRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const loadedUiIdRef = useRef<string | null>(null);

	// Auto-scroll to bottom of messages
	const scrollToBottom = () => {
		setTimeout(() => {
			if (messagesContainerRef.current) {
				messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
			}
		}, 0);
	};

	// Cancel generation function
	const cancelGeneration = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		setIsGenerating(false);
		setIsLlmStreaming(false);
		setLlmStream('');
		setSSEEvents([]);
		setMessages(prev => [...prev, {
			role: 'assistant',
			content: 'Generation cancelled by user.'
		}]);
		scrollToBottom();
	};

	// Get both projectId and uiId from URL params
	const { projectId, uiId } = useParams<{ projectId: string, uiId: string }>();

	const { data: uidata} = trpc.uisGetById.useQuery(
		{ id: uiId! },   // non-null assertion
		{ enabled: !!uiId } // only run query if uiId exists
	);

	// Add version query to fetch DSL if needed
	const getVersionQuery = trpc.versionsGetAll.useQuery(
		{ uiId: uiId }, // Pass uiId to get versions for this UI
		{ enabled: false } // Only run manually
	);

	// Load existing UI DSL on component mount
	useEffect(() => {
		const loadExistingUI = async () => {
			if (!uiId || !uidata?.ui) return;

			// Prevent re-loading if we've already loaded this UI
			if (loadedUiIdRef.current === uiId) {
				return;
			}

			setIsDSLLoading(true);
			try {
				console.log('Loading existing UI for projectId:', projectId, 'uiId:', uiId);
				loadedUiIdRef.current = uiId; // Mark as loaded

				if (uidata && uidata.ui) {
					const ui_version = uidata.ui.uiVersion;

					let dslToUse = null;

					try {
						const versionResult = await getVersionQuery.refetch();
						if (versionResult.data && versionResult.data.versions) {
							const versions = versionResult.data.versions;
							
							// Load conversations from all versions
							const conversations: Array<{ role: string, content: string }> = [];
							
							if (Array.isArray(versions)) {
								// Sort versions by creation date (assuming id is chronological or there's a createdAt field)
								const sortedVersions = [...versions].sort((a, b) => a.id - b.id);
								
								sortedVersions.forEach(version => {
									if (version.prompt && version.prompt.trim()) {
										// Add user message (the prompt)
										conversations.push({
											role: 'user',
											content: version.prompt
										});
										// Add assistant response
										conversations.push({
											role: 'assistant',
											content: 'UI generated successfully!'
										});
									}
								});
							}
							
							// Set conversations in messages state
							if (conversations.length > 0) {
								setMessages(conversations);
							}
							
							// Find the current version's DSL
							const versionData = Array.isArray(versions) ? 
								versions.find(v => v.id === ui_version) : null;
							if (versionData && versionData.dsl) {
								dslToUse = versionData.dsl;
							}
						}
					} catch (versionError) {
						console.error('Failed to fetch version data:', versionError);
					}

					// console.log('dsl to use', dslToUse);
						// Parse and set the DSL if we found it using new utilities
					if (dslToUse) {
						try {
							const uiComponent = parseDSLFromVersion(dslToUse);

							if (uiComponent) {
								console.log('Setting current schema from DSL:', uiComponent);
								setCurrentSchema(uiComponent);
							}

						} catch (parseError) {
							console.error('Failed to parse DSL:', parseError);
						}
					} else {
						console.error('No DSL found for this UI');
					}
				}
			} catch (error) {
				console.error('Failed to load existing UI:', error);
			} finally {
				setIsDSLLoading(false);
			}
		};
		loadExistingUI();
	}, [uiId, uidata]); // Run when uiId or uidata changes

	// Auto-scroll when messages or SSE events change
	useEffect(() => {
		scrollToBottom();
	}, [messages, sseEvents, isGenerating, isLlmStreaming, llmStream, isLlmAccordionOpen]);

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

	// Database operations using centralized utilities
	const { createVersionAndUpdateUI, isLoading: isSavingToDatabase } = DatabaseUtils.useCreateVersionAndUpdateUI()

	// SSE UI Generation Function
	const generateUIWithSSE = async (prompt: string, projectId: string, currentSchema: UIComponent) => {
		// Create new AbortController for this request
		abortControllerRef.current = new AbortController();

		setIsGenerating(true);
		setSSEEvents([]);
		setLlmStream('');
		setIsLlmStreaming(false);
		setIsLlmAccordionOpen(true); // Default to open for new generations

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
				}),
				signal: abortControllerRef.current.signal
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

							// Only add non-LLM streaming events to SSE events display
							if (eventData.type !== 'llm_stream' && eventData.type !== 'llm_complete') {
								setSSEEvents(prev => [...prev, sseEvent]);
							}

							// Handle LLM streaming events
							if (eventData.type === 'llm_stream') {
								setIsLlmStreaming(true);
								const llmContent = eventData.message.replace(/^🤖 /, ''); // Remove emoji prefix
								setLlmStream(prev => {
									const newStream = prev + llmContent;
									// Auto-scroll to bottom after state update
									setTimeout(() => {
										if (llmStreamRef.current) {
											llmStreamRef.current.scrollTop = llmStreamRef.current.scrollHeight;
										}
									}, 0);
									return newStream;
								});
							}

							// Handle LLM completion event
							if (eventData.type === 'llm_complete') {
								setIsLlmStreaming(false);
							}

							// Handle completion event
							if (eventData.type === 'complete' && eventData.data) {
								const response = eventData.data;
								if (response.success && response.data) {
									console.log('SSE UI generated:', response.data);
									const GenUI = response.data


									const p = UIComponentSchema.safeParse(GenUI);
									if (!p.success) {
										console.error('Failed to parse generated UI:', p.error);
										return;
									}

									const updated_ui = p.data;

									setCurrentSchema(updated_ui);

									// Create version using new database utilities
									createVersionAndUpdateUI({
										uiId: uiId!,
										uiComponent: updated_ui,
										prompt: prompt,
										operation: 'SSE Generation'
									}, uidata);

									setMessages(prev => [...prev, {
										role: 'assistant',
										content: 'UI generated successfully with SSE!'
									}]);

									// Clear loading states immediately on completion
									setIsGenerating(false);
									setIsLlmStreaming(false);

									scrollToBottom();
									setInput('')
								}
							}
						} catch (e) {
							console.error('Failed to parse SSE event:', e);
						}
					}
				}
			}
		} catch (error) {
			// Handle abort error differently from other errors
			if (error instanceof Error && error.name === 'AbortError') {
				console.log('Generation was cancelled');
				// Don't add error messages for cancelled requests
				return;
			}

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
			scrollToBottom();
		} finally {
			// Clean up abort controller
			abortControllerRef.current = null;

			// Always set generating to false and clear LLM states
			setIsGenerating(false);
			// Clear LLM stream after a delay to allow user to see the completion
			setTimeout(() => {
				setLlmStream('');
				setIsLlmStreaming(false);
			}, 3000);
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
		if (uiId) {
			try {
				createVersionAndUpdateUI({
					uiId: uiId,
					uiComponent: newSchema,
					prompt: `Schema updated via ${operation || 'copy/paste/cut/delete'}`,
					operation: operation || 'Schema Update'
				}, uidata, {
					onComplete: () => {
						console.log('✅ Schema update saved successfully')
					},
					onError: (error, step) => {
						console.error(`❌ Failed to save schema update at ${step}:`, error)
					}
				});
			} catch (error) {
				console.error('Failed to save schema update to database:', error)
			}
		} else {
			console.warn('Cannot save to database: missing uiId')
		}
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

	// Handle node selection
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

		if (!projectId) {
			console.error('ProjectId not available from URL');
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: 'Project ID is missing from the URL. Please ensure you access this page with a valid project ID.'
			}])
			return;
		}

		const currentInput = input

		// Save prompt to history
		savePromptToHistory(currentInput)

		setMessages([...messages, { role: 'user', content: input }])
		scrollToBottom(); // Scroll after adding user message

		// Use SSE UI generation - projectId now comes from URL params
		await generateUIWithSSE(currentInput, projectId, currentSchema || default_ui_schema);
	}


	return (
		<div className="flex h-screen bg-white overflow-hidden">
			{/* Left Side - Generated React Component */}
			<div className={`${editorModeStore.isPreview ? 'w-full' : 'flex-1'} bg-white bg-opacity-90 ${editorModeStore.isDev ? 'border-r border-gray-300' : ''} shadow-xl overflow-hidden relative`}>
				{/* Floating toggle button in preview mode */}
				{editorModeStore.isPreview && (
					<button
						onClick={() => editorModeStore.toggleMode()}
						className="absolute top-4 right-4 px-3 bg-white py-1.5 text-xs font-medium text-teal-700 hover:text-white hover:bg-teal-600 rounded-md transition-all duration-200 shadow-lg hover:shadow-xl z-20"
					>
						{editorModeStore.currentMode.toUpperCase()}
					</button>
				)}

				<div className="h-full flex flex-col">
					{/* Preview Content */}
					<div className="flex-1 relative overflow-y-auto">
						{(isDSLLoading || !currentSchema) ? (
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
						) : (
							<div className="">
								{memoizedRenderer}
							</div>
						)}
					</div>
				</div>
			</div>
			{/* bg-gradient-to-r from-teal-100 to-cyan-100 */}

			{/* Right Side - Chat Interface with SSE Logs (Dev mode only) */}
			{editorModeStore.isDev && (
				<div className="w-96 bg-gradient-to-b from-teal-50 to-cyan-50 flex flex-col shadow-2xl overflow-hidden">
					{/* Header with Mode Toggle */}
					<div className="px-4 py-3 bg-cyan-50 border-b border-teal-200">
						<div className="flex items-center justify-end">
							<button
								onClick={() => editorModeStore.toggleMode()}
								className="px-3 bg-white py-1.5 text-xs font-medium text-teal-700 hover:text-white hover:bg-teal-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
							>
								{editorModeStore.currentMode.toUpperCase()}
							</button>
						</div>
					</div>

					{/* Node Editor - Below header */}
					<NodeEditor
						selectedNodeId={selectedNodeId}
						onUpdate={(text: string, className: string) => {
							// Update the schema with new text and className
							if (currentSchema && window.SAEDITOR && window.SAEDITOR.nodeId) {
								const updatedSchema = updateNodeById(currentSchema, window.SAEDITOR.nodeId, text, className)
								if (updatedSchema) {
									setCurrentSchema(updatedSchema as UIComponent)
									// Save to database in background without toasts
									handleSchemaUpdateSilent(updatedSchema as UIComponent, 'node-edit')
								}
							}
						}}
					/>

					{/* Messages and SSE Logs */}
					<div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
						{messages.length === 0 && (
							<div className="text-center py-12">
								<div className="w-12 h-12 mx-auto bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center mb-3 shadow-sm">
									<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
								</div>
								<p className="text-teal-600 text-sm">Describe your UI to get started</p>
							</div>
						)}

						{messages.map((msg, i) => (
							<div key={i} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
								<div className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-sm shadow-sm ${msg.role === 'user'
									? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white'
									: 'bg-white border border-teal-200 text-teal-800'
									}`}>
									{msg.content}
								</div>
							</div>
						))}

						{/* SSE Live Logs with embedded LLM Streaming */}
						{isGenerating && (
							<div className="text-left">
								<div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-3 shadow-sm">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center space-x-2">
											<div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
											<span className="text-teal-700 text-xs font-medium">GENERATING</span>
										</div>
										<button
											onClick={cancelGeneration}
											className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
											title="Cancel generation"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
									<div className="space-y-1">
										{sseEvents.map((event, index) => {
											// Check if this is the "Generating UI" event to add accordion
											const isGeneratingUI = event.message.includes('🎨 Generating UI');

											return (
												<div key={index}>
													<div className="text-xs font-mono text-teal-700">
														<span className="text-teal-500">
															{event.timestamp.toLocaleTimeString()}
														</span>
														<span className={`ml-2 ${
															event.type === 'error' ? 'text-red-600' :
															event.type === 'complete' ? 'text-teal-600' :
															'text-blue-600'
														}`}>
															{event.message}
														</span>
														{isGeneratingUI && (isLlmStreaming || llmStream) && (
															<button
																onClick={() => setIsLlmAccordionOpen(!isLlmAccordionOpen)}
																className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
															>
																{isLlmAccordionOpen ? '▼' : '▶'}
															</button>
														)}
													</div>

													{/* LLM Streaming Accordion - appears right after "Generating UI" */}
													{isGeneratingUI && (isLlmStreaming || llmStream) && isLlmAccordionOpen && (
														<div className="mt-2 ml-4 border-l-2 border-teal-300 pl-3">
															<div className="bg-black rounded-md p-3 shadow-inner">
																<div className="flex items-center space-x-2 mb-2">
																	<div className={`w-1.5 h-1.5 ${isLlmStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-400'} rounded-full`}></div>
																	<span className="text-green-400 text-xs font-medium">
																		{isLlmStreaming ? 'AI_GENERATING' : 'AI_COMPLETE'}
																	</span>
																</div>
																<div
																	ref={llmStreamRef}
																	className="h-48 overflow-y-auto bg-gray-900 rounded border border-gray-700 p-2"
																>
																	<pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-words">
																		{llmStream}
																		{isLlmStreaming && <span className="inline-block w-1 h-3 bg-green-400 animate-pulse ml-1">|</span>}
																	</pre>
																</div>
															</div>
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Input Area */}
					<div className="border-t border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 p-3">
						<div className="relative">
							<textarea
								ref={(textarea) => {
									if (textarea) {
										// Auto-resize functionality
										textarea.style.height = 'auto'
										const scrollHeight = textarea.scrollHeight
										const maxHeight = 120 // max height in px (about 4-5 lines)
										textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px'
										textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
									}
								}}
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
								className="w-full pr-12 pl-3 py-3 bg-white border border-teal-300 text-teal-900 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm placeholder-teal-400 shadow-sm"
								placeholder="Describe your UI..."
								style={{ minHeight: '44px' }}
								disabled={isGenerating}
							/>
							<button
								onClick={handleSend}
								disabled={isGenerating || !input.trim()}
								className="absolute right-2 bottom-2 p-2 text-teal-500 hover:text-white hover:bg-gradient-to-r hover:from-teal-600 hover:to-teal-700 rounded-md disabled:text-teal-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
							>
								{isGenerating ? (
									<svg className="animate-spin w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24">
										<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25"></circle>
										<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
									</svg>
								) : (
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
									</svg>
								)}
							</button>
						</div>
						<div className="mt-2 text-xs text-teal-600">
							Enter to send • Shift+Enter for new line • ↑/↓ for history
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default observer(EditorSSE)