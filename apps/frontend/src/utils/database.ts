import React, { useEffect } from 'react'
import { trpc } from './trpc'
import { UIComponent } from '../types/dsl'
import toast from 'react-hot-toast'

// Types for database operations
export interface VersionData {
	uiId: string
	dsl: string
	prompt: string
}

export interface UIUpdateData {
	id: number
	uiVersion: number
}

export interface CreateVersionWithUIComponentParams {
	uiId: string
	uiComponent: UIComponent
	prompt: string
	operation?: string
}

export interface DatabaseCallbacks {
	onSuccess?: (response: any) => void
	onError?: (error: any) => void
	showToast?: boolean
}

export interface QueryCallbacks extends DatabaseCallbacks {
	onLoading?: (isLoading: boolean) => void
}

// Data truncation utility - limits arrays to max 10 items
export const truncateDataArrays = (data: any, maxItems: number = 10): any => {
	if (data === null || data === undefined) {
		return data
	}

	if (Array.isArray(data)) {
		// If it's an array, truncate to maxItems
		return data.slice(0, maxItems).map(item => truncateDataArrays(item, maxItems))
	}

	if (typeof data === 'object') {
		// If it's an object, recursively truncate all its properties
		const truncated: any = {}
		for (const [key, value] of Object.entries(data)) {
			truncated[key] = truncateDataArrays(value, maxItems)
		}
		return truncated
	}

	// For primitive types, return as-is
	return data
}

// Create version data in the new UIComponent schema format
export const createVersionData = (
	uiComponent: UIComponent,
	truncateArrays: boolean = true
): UIComponent => {
	// If the UIComponent has data property, truncate arrays in it
	if (uiComponent.data && truncateArrays) {
		return {
			...uiComponent,
			data: truncateDataArrays(uiComponent.data)
		}
	}

	return uiComponent
}

// Database operation: Create Version
export const useCreateVersion = (callbacks?: DatabaseCallbacks) => {
	return trpc.versionsCreate.useMutation({
		onSuccess: (response) => {
			// console.log('✅ Version created successfully:', response)
			if (callbacks?.showToast !== false) {
				toast.success('Version created successfully')
			}
			callbacks?.onSuccess?.(response)
		},
		onError: (error) => {
			console.error('❌ Create version error:', error)
			if (callbacks?.showToast !== false) {
				toast.error('Failed to create version')
			}
			callbacks?.onError?.(error)
		}
	})
}

// Database operation: Update UI
export const useUpdateUI = (callbacks?: DatabaseCallbacks) => {
	return trpc.uisUpdate.useMutation({
		onSuccess: (response) => {
			// console.log('✅ UI updated successfully:', response)
			if (callbacks?.showToast !== false) {
				toast.success('UI updated successfully')
			}
			callbacks?.onSuccess?.(response)
		},
		onError: (error) => {
			console.error('❌ Update UI error:', error)
			if (callbacks?.showToast !== false) {
				toast.error('Failed to update UI')
			}
			callbacks?.onError?.(error)
		}
	})
}

// High-level function: Create version and update UI in sequence
export const useCreateVersionAndUpdateUI = () => {
	const createVersionMutation = useCreateVersion({ showToast: false })
	const updateUiMutation = useUpdateUI({ showToast: false })

	const createVersionAndUpdateUI = async (
		params: CreateVersionWithUIComponentParams,
		uidata: any,
		callbacks?: {
			onVersionCreated?: (versionResponse: any) => void
			onUIUpdated?: (uiResponse: any) => void
			onComplete?: () => void
			onError?: (error: any, step: 'version' | 'ui') => void
			showToast?: boolean
		}
	) => {
		try {
			// Step 1: Create version data with truncated arrays (directly store UIComponent)
			const versionData = createVersionData(params.uiComponent, true)

			// Step 2: Create version in database
			const versionPayload: VersionData = {
				uiId: params.uiId,
				dsl: JSON.stringify(versionData),
				prompt: params.prompt
			}

			// console.log(`💾 Creating version for ${params.operation || 'operation'}:`, params.prompt)
			console.log("creating version with this dsl data:", JSON.stringify(versionData))
			// Create version
			createVersionMutation.mutate(versionPayload, {
				onSuccess: async (versionResponse) => {
					// console.log('✅ Version created:', versionResponse)
					callbacks?.onVersionCreated?.(versionResponse)

					// Step 3: Update UI with new version ID
					if (uidata?.ui?.id && versionResponse?.version?.id) {
						const uiUpdatePayload: UIUpdateData = {
							id: uidata.ui.id,
							uiVersion: versionResponse.version.id
						}

						updateUiMutation.mutate(uiUpdatePayload, {
							onSuccess: (uiResponse) => {
								// console.log('✅ UI updated with new version:', uiResponse)
								// toast.success(`${params.operation || 'Operation'} saved successfully!`)
								callbacks?.onUIUpdated?.(uiResponse)
								callbacks?.onComplete?.()
							},
							onError: (error) => {
								console.error('❌ Failed to update UI:', error)
								// toast.error('Failed to update UI with new version')
								callbacks?.onError?.(error, 'ui')
							}
						})
					} else {
						const errorMsg = 'Missing UI data or version ID'
						console.error('❌', errorMsg, { uidata, versionResponse })
						toast.error('Failed to link version to UI')
						callbacks?.onError?.(new Error(errorMsg), 'ui')
					}
				},
				onError: (error) => {
					console.error('❌ Failed to create version:', error)
					toast.error(`Failed to save ${params.operation || 'changes'}`)
					callbacks?.onError?.(error, 'version')
				}
			})
		} catch (error) {
			console.error('❌ Error in createVersionAndUpdateUI:', error)
			toast.error('An unexpected error occurred')
			callbacks?.onError?.(error as any, 'version')
		}
	}

	return {
		createVersionAndUpdateUI,
		isCreatingVersion: createVersionMutation.isPending,
		isUpdatingUI: updateUiMutation.isPending,
		isLoading: createVersionMutation.isPending || updateUiMutation.isPending
	}
}

// Utility function for loading existing UI versions
export const useLoadVersions = () => {
	return trpc.versionsGetAll.useQuery
}

// Utility function for loading UI data
export const useLoadUI = () => {
	return trpc.uisGetById.useQuery
}

// Utility function for loading project by ID
export const useGetProjectById = (projectId: number, orgId: string, callbacks?: QueryCallbacks) => {
	const result = trpc.projectsGetById.useQuery(
		{ id: Number(projectId), orgId: orgId },
		{
			enabled: !!projectId && !!orgId, // Only run query if both exist
		}
	)

	// Handle callbacks using useEffect
	useEffect(() => {
		if (result.isSuccess && result.data) {
			callbacks?.onSuccess?.(result.data)
		}
	}, [result.isSuccess, result.data, callbacks])

	useEffect(() => {
		if (result.isError) {
			console.error('❌ Failed to load project:', result.error)
			if (callbacks?.showToast !== false) {
				toast.error('Failed to load project details')
			}
			callbacks?.onError?.(result.error)
		}
	}, [result.isError, result.error, callbacks])

	useEffect(() => {
		callbacks?.onLoading?.(result.isLoading)
	}, [result.isLoading, callbacks])

	return result
}

// Utility function for updating project (including design notes)
export const useUpdateProject = (callbacks?: DatabaseCallbacks) => {
	return trpc.projectsUpdate.useMutation({
		onSuccess: (response) => {
			if (callbacks?.showToast !== false) {
				toast.success('Project updated successfully')
			}
			callbacks?.onSuccess?.(response)
		},
		onError: (error) => {
			console.error('❌ Update project error:', error)
			if (callbacks?.showToast !== false) {
				toast.error('Failed to update project')
			}
			callbacks?.onError?.(error)
		}
	})
}

// Helper function to parse DSL from version data (returns UIComponent directly)
export const parseDSLFromVersion = (dslString: string): UIComponent | null => {
	try {
		const parsedDSL = JSON.parse(dslString)

		// Check if it's the old format {ui, data} and migrate
		if (parsedDSL.ui && typeof parsedDSL.ui === 'object') {
			console.warn('⚠️ Found old format DSL, migrating to new format')
			const migratedComponent: UIComponent = {
				...parsedDSL.ui,
				data: parsedDSL.data || parsedDSL.ui.data || {}
			}
			return migratedComponent
		}

		// New format - direct UIComponent
		if (parsedDSL.id && parsedDSL.render) {
			return parsedDSL as UIComponent
		}

		console.error('❌ Invalid DSL format:', parsedDSL)
		return null
	} catch (error) {
		console.error('❌ Failed to parse DSL:', error)
		return null
	}
}

// Helper function to extract data for rendering from UIComponent
export const extractDataFromUIComponent = (uiComponent: UIComponent): any => {
	// Return the data stored in the UIComponent itself
	return uiComponent.data || {}
}

// Export default utilities object for convenience
export const DatabaseUtils = {
	truncateDataArrays,
	createVersionData,
	parseDSLFromVersion,
	extractDataFromUIComponent,
	useCreateVersion,
	useUpdateUI,
	useCreateVersionAndUpdateUI,
	useLoadVersions,
	useLoadUI,
	useGetProjectById
}

export default DatabaseUtils