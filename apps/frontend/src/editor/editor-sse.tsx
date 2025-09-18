import { useEffect, useState, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { UIComponent } from '../types/dsl'
import FLOWUIRenderer from './components/ui-renderer'
import { trpc, trpcClient } from '../utils/trpc'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import SelectableUIRenderer from './components/SelectableUIRenderer'
import { DatabaseUtils, parseDSLFromVersion } from '../utils/database'
import { createDefaultDSL } from '../lib/utils/default-dsl'
import { TEST_DSL } from '@/test/dsl'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const default_ui_schema: UIComponent = createDefaultDSL()
		
const EditorSSE = () => {
	const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
	const [input, setInput] = useState('')

	const [currentSchema, setCurrentSchema] = useState<UIComponent>(TEST_DSL)
	const [projectId, setProjectId] = useState<string>("");
	const [isDSLLoading, setIsDSLLoading] = useState<boolean>(false);
	
	// SSE specific states
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [sseEvents, setSSEEvents] = useState<Array<{ type: string, message: string, data?: any, timestamp: Date }>>([]);
	
	const { uiId } = useParams<{ uiId: string }>();

	const { data: uidata} = trpc.uisGetById.useQuery(
		{ id: uiId! },   // non-null assertion
		{ enabled: !!uiId } // only run query if uiId exists
	);


	// New state for storing UI suggestions and project docs
	const [uiSuggestions, setUiSuggestions] = useState<any[]>([]);
	const [projectDocs, setProjectDocs] = useState<any>(null);

	// tRPC mutation for creating UI list

	const createUiListMutation = trpc.createUiList.useMutation({
		onSuccess: (response) => {
			console.log('✅ UI suggestions stored in database:', response);
			setSSEEvents(prev => [...prev, {
				type: 'success',
				message: 'UI suggestions saved to database',
				timestamp: new Date()
			}]);
		},
		onError: (error) => {
			console.error('❌ Failed to store UI suggestions:', error);
			setSSEEvents(prev => [...prev, {
				type: 'warning',
				message: 'Generated UI suggestions but failed to save to database',
				timestamp: new Date()
			}]);
		}
	});

	const createDocsMutation = trpc.createDocs.useMutation({
		onSuccess: (response) => {
			console.log('✅ Docs created successfully:', response);
		},
		onError: (error) => {
			console.error('❌ Failed to store docs:', error);
		}
	});	

	// useEffect(() => {
	// 	//initialising the project using tRPC services
	// 	(async () => {
	// 		if (!projectId || projectId === "") return;

	// 		console.log('🚀 Initializing project: ', projectId);

	// 		try {
	// 			// 1. Check if data agent is connected to the project (still via HTTP since it's WebSocket related)
	// 			console.log('📡 Checking data agent connection...');
	// 			const agentStatusResponse = await fetch(`${API_URL}/agent-status/${projectId}`);
	// 			const agentStatusData = await agentStatusResponse.json();
				
	// 			if (!agentStatusData.success || !agentStatusData.data.hasAgent) {
	// 				console.warn('⚠️ No data agent connected to project', projectId);
	// 				return ;
	// 			} 

	// 			console.log('✅ Data agent connected:', agentStatusData.data);

	// 			// 2. Get project with docs and UI list using tRPC
	// 			console.log('📚 Fetching project, docs and UI list via tRPC...');

	// 			const projectResult = await trpcClient.projectWithDocsAndUi.query({ projId: parseInt(projectId) });
	// 			let docsData = null;
	// 			let existingUiList = null;

	// 			if (projectResult && projectResult.project && projectResult.project.length > 0) {
	// 				const project = projectResult.project[0];
	// 				console.log('✅ Project data loaded:', project);
					
	// 				// 3. Load docs if project has docs reference  
	// 				if (project.docs) {
	// 					console.log('📖 Loading documentation from database...');
	// 					try {
	// 						// Use trpcClient for direct calls instead of hooks
	// 						const dbDocsData = await trpcClient.getDocs.query({ id: project.docs });
	// 						if (dbDocsData) {
	// 							docsData = dbDocsData;
	// 							setProjectDocs(docsData);
	// 							console.log('✅ Documentation loaded from database');
	// 						}
	// 					} catch (docsError) {
	// 						console.warn('⚠️ Failed to load docs from database:', docsError);
	// 						return;
	// 					}
	// 				} else {
	// 					console.warn('⚠️ No docs found');
	// 				}
					
	// 				// Fallback to WebSocket docs if not loaded from database
	// 				if (!docsData) {
	// 					console.log('📡 Fetching documentation from WebSocket...');
	// 					const docsResponse = await fetch(`${API_URL}/init-docs?projectId=${projectId}`);
	// 					if (docsResponse.ok) {
	// 						docsData = await docsResponse.json();
	// 						setProjectDocs(docsData);
	// 						console.log('✅ Docs fetched from WebSocket');


	// 						//save the docs to the database
	// 						if (docsData.success) {
	// 							console.log('💾 Saving docs to database...');
	// 							createDocsMutation.mutate({
	// 								projId: parseInt(projectId),
	// 								docs: docsData.data
	// 							})
	// 						}
	// 					} else {
	// 						console.warn('⚠️ Failed to fetch docs from WebSocket');
	// 						return;
	// 					}
	// 				}

	// 				// 4. Load existing UI list if project has one
	// 				if (project.uiList) {
	// 					console.log('🎨 Loading existing UI suggestions from database...');
	// 					try {
	// 						const uiListData = await trpcClient.getUiList.query({ id: project.uiList });
	// 						if (uiListData && (uiListData as any).uiList && (uiListData as any).uiList.length > 0) {
	// 							const dbUiList = (uiListData as any).uiList[0];
	// 							if (dbUiList && dbUiList.uiList) {
	// 								existingUiList = dbUiList.uiList;
	// 								setUiSuggestions(existingUiList);
	// 								console.log('✅ Existing UI suggestions loaded:', existingUiList);
	// 							}
	// 						}
	// 					} catch (uiListError) {
	// 						console.warn('⚠️ Failed to load UI suggestions from database:', uiListError);
	// 						return;
	// 					}
	// 				}
	// 			}  else {
	// 				console.warn('⚠️ No project data found');
	// 				return;
	// 			}

	// 			// 5. Generate new UI suggestions if we don't have them and have docs
	// 			if (!existingUiList && docsData && agentStatusData.data.hasAgent) {
	// 				console.log('🤖 Generating new UI suggestions from docs...');

	// 				try {
	// 					const suggestionsResponse = await fetch(`${API_URL}/init-ui`, {
	// 						method: 'POST',
	// 						headers: {
	// 							'Content-Type': 'application/json',
	// 						},
	// 						body: JSON.stringify({
	// 							docsInfo: docsData.data || docsData,
	// 							projectId: projectId
	// 						})
	// 					});

	// 					if (suggestionsResponse.ok) {
	// 						const suggestionsData = await suggestionsResponse.json();
	// 						const suggestions = suggestionsData.data || [];
	// 						setUiSuggestions(suggestions);
	// 						console.log('✅ UI suggestions generated:', suggestions);

	// 						// 6. Save suggestions to database using tRPC
	// 						if (suggestions.length > 0) {
	// 							console.log('💾 Saving UI suggestions to database...');
	// 							createUiListMutation.mutate({
	// 								projId: parseInt(projectId),
	// 								uiList: suggestions
	// 							})
	// 						}
	// 					} else {
	// 						console.warn('⚠️ Failed to generate UI suggestions:', suggestionsResponse.statusText);
	// 						return;
	// 					}
	// 				} catch (error) {
	// 					console.error('❌ Error generating UI suggestions:', error);
	// 					return;
	// 				}
	// 			}

	// 			console.log('✅ Project initialization complete');


	// 		} catch (error) {
	// 			console.error('❌ Error during project initialization:', error);
	// 			return;
	// 		}
	// 	})();

	// }, [projectId])

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

	// 	// Health check query (optional - to test tRPC connection)
	// const healthQuery = trpc.health.useQuery(undefined, {
	// 	refetchInterval: false, // Don't auto-refetch
	// 	retry: false
	// })

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

	// useEffect(() => {
	// 	// Optional: Log health check result
	// 	if (healthQuery.data) {
	// 		console.log('tRPC Health check:', healthQuery.data)
	// 	}
	// 	if (healthQuery.error) {
	// 		console.error('tRPC connection error:', healthQuery.error)
	// 	}
	// }, [healthQuery.data, healthQuery.error])

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
						toast.error(`Failed to save ${operation || 'changes'}`)
					}
				});
			} catch (error) {
				console.error('Failed to save schema update to database:', error)
				toast.error(`Failed to save ${operation || 'changes'} to database`)
			}
		} else {
			console.warn('Cannot save to database: missing uiId')
			toast.error('Cannot save changes: missing UI ID')
		}
	}, [uiId, uidata, createVersionAndUpdateUI])

	// Memoize the renderer to prevent unnecessary re-renders
	const memoizedRenderer = useMemo(() => {
		if (!currentSchema) return null
		return (
			<SelectableUIRenderer
				uiComponent={currentSchema}
				handlers={handlers}
				enableSelection={true} // Set to false to disable selection
				onSchemaUpdate={handleSchemaUpdate}
			/>
		)
	}, [currentSchema, handlers, handleSchemaUpdate])

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
		<div className="flex h-screen bg-white">
			{/* Left Side - Generated React Component */}
			<div className="flex-1 bg-white bg-opacity-90 border-r border-gray-300 shadow-xl">
				<div className="h-full flex flex-col">					
					{/* Preview Content */}
					<div className="flex-1 overflow-auto relative">
						{isDSLLoading ? (
							<div className="min-h-full flex items-center justify-center bg-white rounded-xl shadow-lg border border-slate-200">
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
							<div className="min-h-full bg-white rounded-xl shadow-lg border border-slate-200">
								{memoizedRenderer}
							</div>
						) : (
							<div className="min-h-full flex items-center justify-center">
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

					{/* Debug Information */}
					<div className="absolute bottom-6 left-6 max-w-md space-y-2">
						{/* Schema Preview */}
						{currentSchema && (
							<details className="bg-slate-900/95 backdrop-blur-sm text-emerald-400 p-3 rounded-xl text-xs shadow-2xl border border-slate-700">
								<summary className="cursor-pointer font-medium hover:text-emerald-300 transition-colors">
									🔍 View Schema
								</summary>
								<pre className="mt-3 overflow-auto max-h-48 text-slate-300 bg-slate-800/50 p-3 rounded-lg">
									{JSON.stringify(currentSchema, null, 2)}
								</pre>
							</details>
						)}
						
						{/* UI Suggestions Preview */}
						{uiSuggestions.length > 0 && (
							<details className="bg-blue-900/95 backdrop-blur-sm text-blue-300 p-3 rounded-xl text-xs shadow-2xl border border-blue-700">
								<summary className="cursor-pointer font-medium hover:text-blue-200 transition-colors">
									💡 UI Suggestions ({uiSuggestions.length})
								</summary>
								<div className="mt-3 overflow-auto max-h-48 space-y-2">
									{uiSuggestions.map((suggestion, idx) => (
										<div key={idx} className="text-slate-300 bg-slate-800/50 p-2 rounded text-xs">
											<div className="font-medium text-blue-300">{suggestion.name}</div>
											<div className="text-xs text-slate-400">{suggestion.description}</div>
										</div>
									))}
								</div>
							</details>
						)}
						
						{/* Project Docs Info */}
						{projectDocs && (
							<details className="bg-purple-900/95 backdrop-blur-sm text-purple-300 p-3 rounded-xl text-xs shadow-2xl border border-purple-700">
								<summary className="cursor-pointer font-medium hover:text-purple-200 transition-colors">
									📚 Project Docs
								</summary>
								<div className="mt-3 text-slate-300 bg-slate-800/50 p-3 rounded-lg text-xs">
									Docs loaded: {projectDocs.success ? '✅' : '❌'}
								</div>
							</details>
						)}
					</div>
				</div>
			</div>

			{/* Right Side - Chat Interface with SSE Logs */}
			<div className="w-96 bg-slate-200 flex flex-col shadow-2xl">
				{/* Chat Header */}
				<div className="px-6 py-4 bg-purple-500 text-white">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.11 3.89 21 5 21H11V19H5V3H13V9H21Z" />
							</svg>
						</div>
						<div>
							<h2 className="text-lg font-semibold">SA AI Assistant</h2>
							<p className="text-sm text-white/70">UI Generation with Live Logs</p>
						</div>
					</div>
				</div>

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