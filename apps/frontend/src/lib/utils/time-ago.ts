import parseDate from "./parse-date";

export const getTimeAgo = (date: Date | string | null | undefined) => {

    const parsedDate = parseDate(date);

    if (!parsedDate) return null;

    try {
        const now = new Date();
        const diffInMs = now.getTime() - parsedDate.getTime();

        // Convert to different time units
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        // Handle very recent times (less than 1 minute)
        if (diffInSeconds < 60) {
            if (diffInSeconds < 5) return 'Just now';
            return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
        }

        // Handle minutes (1-59 minutes)
        if (diffInMinutes < 60) {
            return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
        }

        // Handle hours (1-23 hours)
        if (diffInHours < 24) {
            return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`;
        }

        // Handle days
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;

        // Handle weeks
        if (diffInWeeks === 1) return '1 week ago';
        if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;

        // Handle months
        if (diffInMonths === 1) return '1 month ago';
        if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;

        // Handle years
        if (diffInYears === 1) return '1 year ago';
        return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;

    } catch (error) {
        console.error("Error calculating time ago:", error);
        return null;
    }
};