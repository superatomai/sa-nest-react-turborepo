export interface ConversationMessage {
	role: string
	content: string
}

export interface FetchConversationsOptions {
	getVersionQuery: any // tRPC query to fetch versions
	conversationsPerPage: number
}

export interface FetchConversationsResult {
	conversations: ConversationMessage[]
	hasMore: boolean
	error?: string
}

/**
 * Fetches conversation history from version data
 * @param options - FetchConversationsOptions containing query function and pagination settings
 * @returns Promise<FetchConversationsResult> - The conversation data with pagination info
 */
export async function fetchConversations(options: FetchConversationsOptions): Promise<FetchConversationsResult> {
	const { getVersionQuery, conversationsPerPage } = options

	try {
		console.log('🔍 Fetching conversation history...')
		const conversationResult = await getVersionQuery.refetch()

		if (conversationResult.data && conversationResult.data.versions) {
			const versions = conversationResult.data.versions

			// Load conversations from first page (already sorted by orderBy in query)
			const conversations: ConversationMessage[] = []

			if (Array.isArray(versions)) {
				versions.forEach((version: any) => {
					if (version.prompt && version.prompt.trim()) {
						// Add user message (the prompt)
						conversations.push({
							role: 'user',
							content: version.prompt
						})
						// Add assistant response
						conversations.push({
							role: 'assistant',
							content: 'UI generated successfully!'
						})
					}
				})
			}

			console.log(`✅ Loaded ${conversations.length} conversation messages`)

			return {
				conversations,
				hasMore: versions.length === conversationsPerPage
			}
		}

		return {
			conversations: [],
			hasMore: false
		}
	} catch (error) {
		console.error('❌ Failed to fetch conversations:', error)
		return {
			conversations: [],
			hasMore: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		}
	}
}
