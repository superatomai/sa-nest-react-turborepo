import parseDate from "./parse-date";

export const formatDate = (date: Date | string | null | undefined) => {
    const parsedDate = parseDate(date);
    if (!parsedDate) return 'Unknown';

    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(parsedDate);
    } catch (error) {
        return 'Invalid date';
    }
};