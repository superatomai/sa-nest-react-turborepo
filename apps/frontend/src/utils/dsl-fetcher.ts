import { UIComponent } from '../types/dsl'
import { parseDSLFromVersion } from './database'
import { API_URL } from '../config/api'

export interface FetchDSLOptions {
	projectId: string
	uiId: string
	uiVersion: number
	getCurrentVersionDSLQuery: any // tRPC query to fetch version DSL
}

export interface FetchDSLResult {
	dsl: UIComponent | null
	source: 'file' | 'database' | 'none'
	error?: string
}

/**
 * Fetches DSL from the project files first, then falls back to database if not found
 * Uses Promise.race to fetch from both sources simultaneously for faster loading
 * @param options - FetchDSLOptions containing projectId, uiId, uiVersion, and query function
 * @returns Promise<FetchDSLResult> - The DSL data with source information
 */
export async function fetchDSL(options: FetchDSLOptions): Promise<FetchDSLResult> {
	const { projectId, uiId, uiVersion, getCurrentVersionDSLQuery } = options

	console.log('🔍 Fetching DSL from both file system and database...')

	// Create both fetch promises
	const filePromise = fetchFromFile(projectId, uiId)
	const dbPromise = fetchFromDatabase(uiVersion, getCurrentVersionDSLQuery)

	// Race both promises - use whichever resolves first with valid data
	try {
		const result = await Promise.race([
			filePromise.then(dsl => dsl ? { dsl, source: 'file' as const } : null),
			dbPromise.then(dsl => dsl ? { dsl, source: 'database' as const } : null)
		])

		if (result) {
			console.log(`✅ DSL loaded from ${result.source}`)
			return result
		}

		// If race didn't get valid data, wait for both and try again
		console.log('⚠️ Race didn\'t return valid data, waiting for both sources...')
		const [fileDsl, dbDsl] = await Promise.all([filePromise, dbPromise])

		if (fileDsl) {
			console.log('✅ DSL loaded from file (fallback)')
			return { dsl: fileDsl, source: 'file' }
		}

		if (dbDsl) {
			console.log('✅ DSL loaded from database (fallback)')
			return { dsl: dbDsl, source: 'database' }
		}

		return {
			dsl: null,
			source: 'none',
			error: 'No DSL found in file or database'
		}
	} catch (error) {
		console.error('❌ Failed to fetch DSL:', error)
		return {
			dsl: null,
			source: 'none',
			error: error instanceof Error ? error.message : 'Unknown error'
		}
	}
}

/**
 * Fetch DSL from project files
 */
async function fetchFromFile(projectId: string, uiId: string): Promise<UIComponent | null> {
	try {
		const fileResponse = await fetch(`${API_URL}/projects/${projectId}/uis/${uiId}/dsl`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		})

		if (fileResponse.ok) {
			const fileData = await fileResponse.json()

			if (fileData.success && fileData.data) {
				const dsl = parseDSLFromVersion(JSON.stringify(fileData.data))
				return dsl
			}
		}
	} catch (error) {
		console.warn('⚠️ File fetch error:', error)
	}

	return null
}

/**
 * Fetch DSL from database
 */
async function fetchFromDatabase(uiVersion: number, getCurrentVersionDSLQuery: any): Promise<UIComponent | null> {
	try {
		const dslResult = await getCurrentVersionDSLQuery.refetch()

		if (dslResult.data && dslResult.data.versions) {
			const allVersions = dslResult.data.versions
			const versionData = Array.isArray(allVersions) ?
				allVersions.find((v: any) => v.id === uiVersion) : null

			if (versionData && versionData.dsl) {
				const dsl = parseDSLFromVersion(versionData.dsl)
				return dsl
			}
		}
	} catch (error) {
		console.warn('⚠️ Database fetch error:', error)
	}

	return null
}
