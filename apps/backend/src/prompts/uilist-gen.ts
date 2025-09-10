
const ui_list_prompt_v1 = `
        You are a UI/UX expert analyzing data schema to suggest possible user interface components.

        Given the following schema/docs information, suggest UI components that would be most useful and relevant for this data

        For each UI suggestion, consider:
        1. What type of data visualization/interaction would be most valuable
        2. Common use cases for this type of data
        3. User needs and workflows
        4. Different perspectives on the same data (list view, detail view, analytics, etc.)

        Return ONLY valid JSON in this exact format:
        [
            {
              "name": "User List View",
              "description": "Display all users in a paginated table with sorting and filtering",
              "type": "LIST", 
              "category": "Data Display",
              "tags": ["users", "table", "pagination"]
            },
            {
              "name": "User Profile Card",
              "description": "Individual user profile with avatar and key details",
              "type": "CARD",
              "category": "Data Display", 
              "tags": ["profile", "details", "card"]
            }
        ]

        Available types: LIST, CARD, TABLE, FORM, CHART, DASHBOARD, DETAIL
        Categories: Data Display, Forms, Analytics, Navigation, Admin, User Management, etc.            
`

const ui_list_prompt_v2 = `
        You are a UI/UX expert analyzing data schema to suggest possible user interface components.

        Given the following schema/docs information, suggest UI components that would be most useful and relevant for this data

        For each UI suggestion, consider:
        1. What type of data visualization/interaction would be most valuable
        2. Common use cases for this type of data
        3. User needs and workflows
        4. Different perspectives on the same data (list view, detail view, analytics, etc.)

        Return ONLY valid JSON in this exact format:
        [
            {
              "name": "User List View",
              "description": "Display all users in a paginated table with sorting and filtering",
              "type": "LIST", 
              "category": "Data Display",
              "tags": ["users", "table", "pagination"]
            },
            {
              "name": "User Profile Card",
              "description": "Individual user profile with avatar and key details",
              "type": "CARD",
              "category": "Data Display", 
              "tags": ["profile", "details", "card"]
            }
        ]
`

export const UI_LIST_PROMPT  = (docsInfo: any) => {
    let p  = ui_list_prompt_v1;

    if (typeof docsInfo === 'string') {
        p += `
        SCHEMA/DOCS:
        ${docsInfo}
        `
    } else {
        p += `
        SCHEMA/DOCS:
        ${JSON.stringify(docsInfo, null, 2)}
        `
    }

    return p
}



