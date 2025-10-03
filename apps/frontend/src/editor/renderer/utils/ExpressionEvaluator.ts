/**
 * Advanced Expression Evaluator
 * Safely evaluates JavaScript expressions with controlled context
 */
export class ExpressionEvaluator {
    private createSafeContext(data: any): Record<string, any> {
        const context: Record<string, any> = {
            Math, Date, String, Number, Boolean, Array, Object, JSON,
            filter: Array.prototype.filter,
            map: Array.prototype.map,
            reduce: Array.prototype.reduce,
            find: Array.prototype.find,
            some: Array.prototype.some,
            every: Array.prototype.every,
            sort: Array.prototype.sort,
            slice: Array.prototype.slice,
            parseInt, parseFloat, isNaN, isFinite,
            data: data || {}
        };

        if (data && typeof data === 'object') {
            this.flattenDataToContext(data, context);
        }

        return context;
    }

    private flattenDataToContext(obj: any, context: Record<string, any>, prefix = ''): void {
        if (!obj || typeof obj !== 'object') return;

        const skipKeys = ['Math', 'Date', 'String', 'Number', 'Boolean', 'Array', 'Object', 'JSON',
            'filter', 'map', 'reduce', 'find', 'some', 'every', 'sort', 'slice',
            'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'console', 'window',
            'setState', 'data'];

        for (const [key, value] of Object.entries(obj)) {
            if (!prefix && skipKeys.includes(key)) continue;

            const contextKey = prefix ? `${prefix}_${key}` : key;
            context[contextKey] = value;

            if (!prefix) context[key] = value;

            if (value && typeof value === 'object' && !Array.isArray(value) && !this.isDateOrSpecialObject(value)) {
                this.flattenDataToContext(value, context, contextKey);
            }
        }
    }

    private isDateOrSpecialObject(obj: any): boolean {
        return obj instanceof Date || obj instanceof RegExp || obj instanceof Error || typeof obj === 'function';
    }

    evaluate(expression: string, data: any): any {
        if (!expression || typeof expression !== 'string') return expression;

        try {
            const context = this.createSafeContext(data);
            const paramNames = Object.keys(context);
            const paramValues = Object.values(context);

            const func = new Function(...paramNames, `
                "use strict";
                try {
                    return (${expression});
                } catch (e) {
                    console.warn('Expression evaluation error:', e.message, 'for expression:', ${JSON.stringify(expression)});
                    return undefined;
                }
            `);

            return func(...paramValues);
        } catch (error) {
            console.warn('Failed to evaluate expression:', expression, error);
            return undefined;
        }
    }

    resolveDataPath(path: string, data: any): any {
        if (!path || !data) return undefined;

        try {
            return path.split('.').reduce((current, key) => {
                if (current === null || current === undefined) return undefined;
                if (!isNaN(Number(key))) {
                    const index = parseInt(key, 10);
                    return Array.isArray(current) ? current[index] : current;
                }
                return current[key];
            }, data);
        } catch (error) {
            console.warn('Error resolving data path:', path, error);
            return undefined;
        }
    }
}
