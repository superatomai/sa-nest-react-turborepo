/**
 * Utility to clean TypeScript syntax from function strings
 * Converts TS to valid JavaScript for runtime execution
 */
export function cleanTypeScriptSyntax(fnString: string): string {
    let cleaned = fnString;

    // Unescape escaped quotes from JSON conversion: \\' -> ' and \\" -> "
    cleaned = cleaned.replace(/\\'/g, "'");
    cleaned = cleaned.replace(/\\"/g, '"');

    // Remove TypeScript type casting: (variable as Type) -> variable
    cleaned = cleaned.replace(/\(\s*(\w+)\s+as\s+\w+\s*\)/g, '$1');

    // Remove type annotations from variable declarations ONLY after var/let/const
    // Match: const/let/var name: Type = ... -> const/let/var name = ...
    // But DON'T match ternary operators: condition ? value : otherValue
    cleaned = cleaned.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[\w<>[\]|&]+\s*=/g, '$1 $2 =');

    return cleaned;
}
