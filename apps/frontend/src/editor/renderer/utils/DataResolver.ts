import { ExpressionEvaluator } from './ExpressionEvaluator';

/**
 * Universal Data Resolver
 * Handles all types of data resolution: expressions, bindings, interpolation
 */
export class DataResolver {
    private evaluator: ExpressionEvaluator;

    constructor() {
        this.evaluator = new ExpressionEvaluator();
    }

    resolveValue(value: any, localContext: Record<string, any> = {}): any {
        if (!value) return value;

        // Handle Expression objects ($exp)
        if (typeof value === 'object' && value.$exp) {
            return this.evaluator.evaluate(value.$exp, localContext);
        }

        // Handle Binding objects ($bind)
        if (typeof value === 'object' && value.$bind) {
            return this.resolveBinding(value.$bind, localContext, value.$transform);
        }

        // Handle string interpolation
        if (typeof value === 'string' && (value.includes('${') || value.includes('{{'))) {
            return this.interpolateString(value, localContext);
        }

        return value;
    }

    private resolveBinding(path: string, context: Record<string, any>, transforms?: any[]): any {
        const pathParts = path.split('.');
        let value = context;

        for (const part of pathParts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                return undefined;
            }
        }

        // TODO: implement transforms properly
        if (transforms && Array.isArray(transforms)) {
            // console.log('Transforms not fully implemented yet:', transforms);
        }

        return value;
    }

    private interpolateString(template: string, context: Record<string, any>): string {
        let result = template;

        // Handle ${} syntax
        result = result.replace(/\$\{(.*?)\}/g, (_match, expr) => {
            const trimmed = expr.trim();
            try {
                const value = this.resolveBinding(trimmed, context);
                return value !== undefined ? String(value) : '';
            } catch (e) {
                console.error('String interpolation error (${} syntax):', e);
                return '';
            }
        });

        // Handle {{}} syntax
        result = result.replace(/\{\{(.*?)\}\}/g, (_match, expr) => {
            const trimmed = expr.trim();
            try {
                const value = this.evaluator.evaluate(trimmed, context);
                return value !== undefined ? String(value) : '';
            } catch (e) {
                try {
                    const value = this.resolveBinding(trimmed, context);
                    return value !== undefined ? String(value) : '';
                } catch (e2) {
                    console.error('String interpolation error ({{}} syntax):', e2);
                    return '';
                }
            }
        });

        return result;
    }

    getRawValue(path: string, data: any): any {
        return this.evaluator.resolveDataPath(path, data);
    }

    evaluateExpression(expression: string, data: any): any {
        return this.evaluator.evaluate(expression, data);
    }

    resolve(text: string, data: any): string {
        if (!text || typeof text !== 'string') {
            return String(text || '');
        }
        return this.interpolateString(text, data);
    }
}
