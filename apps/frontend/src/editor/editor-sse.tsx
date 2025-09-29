import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { UIComponent, UIComponentSchema } from '../types/dsl'
import { trpc } from '../utils/trpc'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import SelectableUIRenderer from './renderer/SelectableUIRenderer'
import { DatabaseUtils, parseDSLFromVersion } from '../utils/database'
import { createDefaultDSL } from '../lib/utils/default-dsl'
import NodeEditor from './renderer/NodeEditor'
import { findNodeById, updateNodeById } from './utils/node-operations'
import { COMPLEX_DSL } from '@/gen-dsls/complex-dsl'
import { editorModeStore } from '../stores/mobx_editor_mode_store'
import { COMPONENT_DSL } from '@/gen-dsls/componet-dsl'
import { duckdb_dashboard_dsl } from '@/gen-dsls/duckdb-dashboard'
import { supplier_risks_dsl } from '@/gen-dsls/supplier-risks'
import {API_URL as API_BASE_URL} from '../config/api'
import KeyboardShortcutsDialog from '../components/KeyboardShortcutsDialog'
import DuckDBFileUpload from '../duckdb/components/DuckDBFileUpload'
import toast from 'react-hot-toast'

const API_URL = API_BASE_URL; // points to backend api
const default_ui_schema: UIComponent = createDefaultDSL()
		
const EditorSSE = () => {
	const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
	const [input, setInput] = useState('')

	// Pagination state for conversations
	const [conversationPage, setConversationPage] = useState<number>(0)
	const [hasMoreConversations, setHasMoreConversations] = useState<boolean>(false)
	const [isLoadingMoreConversations, setIsLoadingMoreConversations] = useState<boolean>(false)

	const [currentSchema, setCurrentSchema] = useState<UIComponent | null>()
	const [isDSLLoading, setIsDSLLoading] = useState<boolean>(false);
	const [selectedNodeId, setSelectedNodeId] = useState<string>('');

	const [leftPanelWidth, setLeftPanelWidth] = useState<number>(80); // Percentage
	const [isResizing, setIsResizing] = useState<boolean>(false);

	// SSE specific states
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [sseEvents, setSSEEvents] = useState<Array<{ type: string, message: string, data?: any, timestamp: Date }>>([]);
	const [llmStream, setLlmStream] = useState<string>('');
	const [isLlmStreaming, setIsLlmStreaming] = useState<boolean>(false);
	const [isLlmAccordionOpen, setIsLlmAccordionOpen] = useState<boolean>(true);
	const [currentProvider, setCurrentProvider] = useState<string>('');
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
		setCurrentProvider('');
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

	// Mutation for updating UI publish status
	const updateUiMutation = trpc.uisUpdate.useMutation({
		onSuccess: () => {
			console.log('UI publish status updated successfully');
			toast.success('UI published successfully! 🚀', {
				duration: 3000,
				position: 'top-center',
			});
		},
		onError: (error) => {
			console.error('Failed to update UI publish status:', error);
			toast.error('Failed to publish UI. Please try again.', {
				duration: 4000,
				position: 'top-center',
			});
		}
	});

	// Handle publish - only sets to true once
	const handlePublish = async () => {
		if (!uidata?.ui || !uiId ) return;

		try {
			await updateUiMutation.mutateAsync({
				id: uidata.ui.id,
				published: true
			});
			// The query will automatically refetch due to optimistic updates
		} catch (error) {
			console.error('Error updating publish status:', error);
		}
	};

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
						// Load conversations from first page
						const conversationResult = await getVersionQuery.refetch();
						if (conversationResult.data && conversationResult.data.versions) {
							const versions = conversationResult.data.versions;

							// Load conversations from first page (already sorted by orderBy in query)
							const conversations: Array<{ role: string, content: string }> = [];

							if (Array.isArray(versions)) {
								versions.forEach((version: any) => {
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

							// Set initial conversations and pagination state
							if (conversations.length > 0) {
								setMessages(conversations);
								setConversationPage(0); // Reset to first page
								// Check if there are more conversations to load
								setHasMoreConversations(versions.length === CONVERSATIONS_PER_PAGE);
							}
						}

						// Load DSL from current UI version (separate query to get all versions)
						const dslResult = await getCurrentVersionDSLQuery.refetch();
						if (dslResult.data && dslResult.data.versions) {
							const allVersions = dslResult.data.versions;
							// Find the current version's DSL
							const versionData = Array.isArray(allVersions) ?
								allVersions.find((v: any) => v.id === ui_version) : null;
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

	// Handle resizing
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		setIsResizing(true);
		e.preventDefault();
	}, []);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isResizing) return;

		const containerWidth = window.innerWidth;
		const newLeftWidth = (e.clientX / containerWidth) * 100;

		// Constrain between 20% and 80%
		const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
		setLeftPanelWidth(constrainedWidth);
	}, [isResizing]);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
	}, []);

	useEffect(() => {
		if (isResizing) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
		} else {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};
	}, [isResizing, handleMouseMove, handleMouseUp]);

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


	// Add version query to fetch DSL if needed with pagination
	const CONVERSATIONS_PER_PAGE = 10
	const getVersionQuery = trpc.versionsGetAll.useQuery(
		{
			uiId: uiId,
			limit: CONVERSATIONS_PER_PAGE,
			skip: conversationPage * CONVERSATIONS_PER_PAGE,
			orderBy: { id: 'asc' } // Order by ID to maintain consistent order
		},
		{ enabled: false } // Only run manually
	);

	// Separate query to get the current UI version DSL (get all versions to find the specific one)
	const getCurrentVersionDSLQuery = trpc.versionsGetAll.useQuery(
		{
			uiId: uiId,
			// No limit/skip for DSL - we need to find the specific version
		},
		{ enabled: false } // Only run manually
	);

	// Database operations using centralized utilities
	const { createVersionAndUpdateUI, isLoading: isSavingToDatabase } = DatabaseUtils.useCreateVersionAndUpdateUI()

	// Create a separate query for loading more conversations
	const loadMoreVersionsQuery = trpc.versionsGetAll.useQuery(
		{
			uiId: uiId,
			limit: CONVERSATIONS_PER_PAGE,
			skip: (conversationPage + 1) * CONVERSATIONS_PER_PAGE,
			orderBy: { id: 'asc' }
		},
		{ enabled: false } // Only run manually
	);

	// Function to load more conversations (older ones)
	const loadMoreConversations = useCallback(async () => {
		if (isLoadingMoreConversations || !hasMoreConversations) return

		setIsLoadingMoreConversations(true)

		// Store current scroll position
		const currentScrollHeight = messagesContainerRef.current?.scrollHeight || 0

		try {
			const result = await loadMoreVersionsQuery.refetch()

			if (result.data && result.data.versions && Array.isArray(result.data.versions)) {
				const newConversations: Array<{ role: string, content: string }> = []

				result.data.versions.forEach((version: any) => {
					if (version.prompt && version.prompt.trim()) {
						newConversations.push({
							role: 'user',
							content: version.prompt
						})
						newConversations.push({
							role: 'assistant',
							content: 'UI generated successfully!'
						})
					}
				})

				if (newConversations.length > 0) {
					// Prepend older conversations to the beginning
					setMessages(prev => [...newConversations, ...prev])
					setConversationPage(prev => prev + 1)

					// Maintain scroll position after adding content at the top
					setTimeout(() => {
						if (messagesContainerRef.current) {
							const newScrollHeight = messagesContainerRef.current.scrollHeight
							const scrollDiff = newScrollHeight - currentScrollHeight
							messagesContainerRef.current.scrollTop += scrollDiff
						}
					}, 0)
				}

				// Check if there are more conversations to load
				setHasMoreConversations(result.data.versions.length === CONVERSATIONS_PER_PAGE)
			}
		} catch (error) {
			console.error('Failed to load more conversations:', error)
		} finally {
			setIsLoadingMoreConversations(false)
		}
	}, [loadMoreVersionsQuery, isLoadingMoreConversations, hasMoreConversations])

	// SSE UI Generation Function
	const generateUIWithSSE = async (prompt: string, projectId: string, currentSchema: UIComponent) => {
		// Create new AbortController for this request
		abortControllerRef.current = new AbortController();

		setIsGenerating(true);
		setSSEEvents([]);
		setLlmStream('');
		setIsLlmStreaming(false);
		setCurrentProvider('');
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

							// Handle provider switching - clear LLM stream for fresh start
							if (eventData.type === 'status' && (
								eventData.message.includes('🚀 Attempting UI generation with') ||
								eventData.message.includes('🔄 Switching to')
							)) {
								// Completely reset LLM streaming state when switching providers
								setLlmStream('');
								setIsLlmStreaming(false);

								// Extract provider name from message
								if (eventData.message.includes('🚀 Attempting UI generation with')) {
									const providerMatch = eventData.message.match(/🚀 Attempting UI generation with (\w+)/);
									if (providerMatch) {
										setCurrentProvider(providerMatch[1]);
									}
								}
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

		const currentInput = input.trim()

		// Check if the prompt is /duckdb
		if (currentInput === '/duckdb') {
			// Save prompt to history
			savePromptToHistory(currentInput)

			setMessages([...messages, { role: 'user', content: input }])
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: 'duckdb_component' // Special marker for rendering DuckDB component
			}])

			setInput('')
			scrollToBottom()
			return
		}

		if (!projectId) {
			console.error('ProjectId not available from URL');
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: 'Project ID is missing from the URL. Please ensure you access this page with a valid project ID.'
			}])
			return;
		}

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
			<div
				className={`${editorModeStore.isPreview ? 'w-full' : ''} bg-white bg-opacity-90 shadow-xl overflow-hidden relative`}
				style={{
					width: editorModeStore.isPreview ? '100%' : `${leftPanelWidth}%`
				}}
			>
				{/* Floating toggle button in preview mode */}
				{editorModeStore.isPreview && (
					<div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
						<button
							onClick={() => editorModeStore.toggleMode()}
							className="px-3 bg-white py-1.5 text-xs font-medium text-teal-700 hover:text-white hover:bg-teal-600 rounded-md transition-all duration-200 shadow-lg hover:shadow-xl"
						>
							{editorModeStore.currentMode.toUpperCase()}
						</button>
					</div>
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

			{/* Resizer Bar - Only visible in dev mode */}
			{editorModeStore.isDev && !editorModeStore.isPreview && (
				<div
					className={`w-1 bg-gray-300 hover:bg-teal-400 cursor-col-resize transition-colors duration-200 ${isResizing ? 'bg-teal-500' : ''}`}
					onMouseDown={handleMouseDown}
				></div>
			)}

			{/* Right Side - Chat Interface with SSE Logs (Dev mode only) */}
			{editorModeStore.isDev && (
				<div
					className="bg-gradient-to-b from-teal-50 to-cyan-50 flex flex-col shadow-2xl overflow-hidden"
					style={{
						width: `${100 - leftPanelWidth}%`
					}}
				>
					{/* Header with Mode Toggle and Help */}
					<div className="px-4 py-2 bg-cyan-50 border-b border-teal-200">
						<div className="flex items-center justify-between">
							<div className='flex jsutify-center'>
								<button
									onClick={() => editorModeStore.toggleMode()}
									className="px-3 bg-white py-1.5 text-xs font-medium text-teal-700 hover:text-white hover:bg-teal-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
								>
									{editorModeStore.currentMode.toUpperCase()}
								</button>
							</div>

							<div className='flex justify-center gap-4 items-center'>
								<button
									onClick={handlePublish}
									disabled={updateUiMutation.isPending}
									className="px-3 bg-white py-1.5 text-xs font-medium text-teal-700 hover:text-white hover:bg-teal-600 rounded-md transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{updateUiMutation.isPending ? 'PUBLISHING...' : 'PUBLISH'}
								</button>
								{/* Keyboard shortcuts only visible in dev mode */}
								{editorModeStore.isDev && <KeyboardShortcutsDialog />}
							</div>
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
						{/* Load More Conversations Button - At top for scrolling up to load older conversations */}
						{hasMoreConversations && !isGenerating && messages.length > 0 && (
							<div className="text-center py-3">
								<button
									onClick={loadMoreConversations}
									disabled={isLoadingMoreConversations}
									className="px-4 py-2 bg-white border border-teal-300 text-teal-700 text-sm rounded-lg hover:bg-teal-50 hover:border-teal-400 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
								>
									{isLoadingMoreConversations ? (
										<>
											<svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
												<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25"></circle>
												<path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
											</svg>
											<span>Loading older...</span>
										</>
									) : (
										<>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
											<span>Load Older</span>
										</>
									)}
								</button>
							</div>
						)}

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
								{msg.content === 'duckdb_component' ? (
									<div className="w-full">
										<div className="bg-white border border-teal-200 rounded-lg p-4 shadow-sm">
											<div className="flex items-center justify-between mb-4">
												<h3 className="text-lg font-semibold text-teal-800">DuckDB Interface</h3>
											</div>
											<DuckDBFileUpload
												onFileLoaded={(filename, size) => {
													console.log(`DuckDB file loaded: ${filename} (${size} bytes)`)
												}}
												onError={(error) => {
													console.error('DuckDB error:', error)
												}}
											/>
										</div>
									</div>
								) : (
									<div className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-sm shadow-sm ${msg.role === 'user'
										? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white'
										: 'bg-white border border-teal-200 text-teal-800'
										}`}>
										{msg.content}
									</div>
								)}
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
											// Check if this is any UI generation attempt to add accordion
											const isGeneratingUI = event.message.includes('🎨 Generating UI') ||
											                      event.message.includes('🚀 Attempting UI generation');

											// Only show LLM accordion for the most recent provider attempt
											const isCurrentProviderAttempt = isGeneratingUI &&
												currentProvider &&
												event.message.includes(`🚀 Attempting UI generation with ${currentProvider.toUpperCase()}`);

											// Show accordion if this is the current provider attempt or the initial generating UI message
											const shouldShowAccordion = (isCurrentProviderAttempt ||
												(event.message.includes('🎨 Generating UI') && !currentProvider)) &&
												(isLlmStreaming || llmStream);

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
														{shouldShowAccordion && (
															<button
																onClick={() => setIsLlmAccordionOpen(!isLlmAccordionOpen)}
																className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
															>
																{isLlmAccordionOpen ? '▼' : '▶'}
															</button>
														)}
													</div>

													{/* LLM Streaming Accordion - only show for current provider */}
													{shouldShowAccordion && isLlmAccordionOpen && (
														<div className="mt-2 ml-4 border-l-2 border-teal-300 pl-3">
															<div className="bg-black rounded-md p-3 shadow-inner">
																<div className="flex items-center space-x-2 mb-2">
																	<div className={`w-1.5 h-1.5 ${isLlmStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-400'} rounded-full`}></div>
																	<span className="text-green-400 text-xs font-medium">
																		{isLlmStreaming ?
																			`${currentProvider ? currentProvider.toUpperCase() + '_' : ''}AI_GENERATING` :
																			`${currentProvider ? currentProvider.toUpperCase() + '_' : ''}AI_COMPLETE`
																		}
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