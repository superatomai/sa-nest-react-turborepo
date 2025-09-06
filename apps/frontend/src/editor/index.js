'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import FLOWUIRenderer from './components/ui-renderer';
import { trpc } from '../utils/trpc';
const StudioTestPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [currentSchema, setCurrentSchema] = useState();
    const [data, setData] = useState(null);
    const projectId = '55'; // Using string as expected by API
    // tRPC mutation for generating UI
    const generateUIMutation = trpc.generateUI.useMutation({
        onSuccess: (data) => {
            console.log('Generate UI success:', data);
            if (data.success && data.data) {
                const ui_schema = data.data.ui;
                const ui_data = data.data.data;
                console.log('ui_schema', ui_schema);
                console.log('ui_data', ui_data);
                setCurrentSchema(ui_schema);
                // Get the data using the query id if it exists
                const typedSchema = ui_schema;
                if (typedSchema.query?.id && ui_data && typedSchema.query.id in ui_data) {
                    // setData(ui_data[typedSchema.query.id])
                }
                setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: 'UI generated successfully!'
                    }]);
            }
            else {
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: 'Failed to generate UI. Please try again.'
                    }
                ]);
            }
        },
        onError: (error) => {
            console.error('Generate UI error:', error);
            setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'An error occurred. Please try again.'
                }]);
        }
    });
    // Health check query (optional - to test tRPC connection)
    const healthQuery = trpc.health.useQuery(undefined, {
        refetchInterval: false, // Don't auto-refetch
        retry: false
    });
    useEffect(() => {
        // Optional: Log health check result
        if (healthQuery.data) {
            console.log('tRPC Health check:', healthQuery.data);
        }
        if (healthQuery.error) {
            console.error('tRPC connection error:', healthQuery.error);
        }
    }, [healthQuery.data, healthQuery.error]);
    // Define handlers that can be used in generated UI
    const handlers = {
        handleClick: () => alert('Button clicked!'),
        handleSubmit: (e) => {
            e.preventDefault();
        }
    };
    const handleSend = async () => {
        if (!input.trim())
            return;
        setMessages([...messages, { role: 'user', content: input }]);
        setInput('');
        // Use tRPC mutation to generate UI
        generateUIMutation.mutate({
            prompt: input,
            projectId: projectId,
            currentSchema: currentSchema
        });
    };
    return (_jsxs("div", { className: "flex h-screen bg-blue-50", children: [_jsx("div", { className: "flex-1 bg-white bg-opacity-90 border-r border-gray-300 shadow-xl", children: _jsxs("div", { className: "h-full flex flex-col", children: [_jsx("div", { className: "px-6 py-4 bg-blue-500 text-white", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 bg-green-400 rounded-full animate-pulse" }), _jsx("h2", { className: "text-lg font-semibold", children: "Live Preview" }), _jsx("div", { className: "ml-auto text-sm bg-blue-600 px-3 py-1 rounded-full", children: currentSchema ? 'Active' : 'Waiting...' })] }) }), _jsx("div", { className: "flex-1 overflow-auto p-6", children: currentSchema ? (_jsx("div", { className: "min-h-full bg-white rounded-xl shadow-lg border border-slate-200 p-6", children: _jsx(FLOWUIRenderer, { schema: currentSchema, data: data, handlers: handlers }) })) : (_jsx("div", { className: "min-h-full flex items-center justify-center", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center", children: _jsx("svg", { className: "w-12 h-12 text-indigo-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) }) }), _jsx("h3", { className: "text-xl font-semibold text-slate-700", children: "Ready to Create" }), _jsx("p", { className: "text-slate-500 max-w-sm", children: "Describe what you want to build and watch it come to life" })] }) })) }), currentSchema && (_jsx("div", { className: "absolute bottom-6 left-6 max-w-md", children: _jsxs("details", { className: "bg-slate-900/95 backdrop-blur-sm text-emerald-400 p-3 rounded-xl text-xs shadow-2xl border border-slate-700", children: [_jsx("summary", { className: "cursor-pointer font-medium hover:text-emerald-300 transition-colors", children: "\uD83D\uDD0D View Schema" }), _jsx("pre", { className: "mt-3 overflow-auto max-h-48 text-slate-300 bg-slate-800/50 p-3 rounded-lg", children: JSON.stringify(currentSchema, null, 2) })] }) }))] }) }), _jsxs("div", { className: "w-96 bg-white flex flex-col shadow-2xl", children: [_jsx("div", { className: "px-6 py-4 bg-purple-500 text-white", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center", children: _jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.11 3.89 21 5 21H11V19H5V3H13V9H21Z" }) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold", children: "AI Assistant" }), _jsx("p", { className: "text-sm text-white/70", children: "Your UI Generation Partner" })] })] }) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50", children: [messages.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "w-16 h-16 mx-auto bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-violet-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsx("p", { className: "text-slate-500 text-sm", children: "Start a conversation to generate your UI" })] })), messages.map((msg, i) => (_jsx("div", { className: `${msg.role === 'user' ? 'text-right' : 'text-left'}`, children: _jsx("div", { className: `inline-block p-4 rounded-2xl max-w-[85%] shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white border border-gray-200 text-gray-800 shadow-md'}`, children: _jsx("p", { className: "text-sm leading-relaxed", children: msg.content }) }) }, i))), generateUIMutation.isPending && (_jsx("div", { className: "text-left", children: _jsx("div", { className: "inline-block p-4 rounded-2xl bg-white border border-slate-200 shadow-md", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-2 h-2 bg-violet-500 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-purple-500 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-2 h-2 bg-indigo-500 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }), _jsx("span", { className: "text-sm text-slate-600", children: "Generating your UI..." })] }) }) }))] }), _jsx("div", { className: "border-t border-slate-200/60 bg-white/80 backdrop-blur-sm p-6", children: _jsxs("div", { className: "space-y-3", children: [_jsx("textarea", { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }, className: "w-full p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm placeholder-slate-400", placeholder: "Describe your UI... (e.g., 'Create a login form with email and password')", rows: 3, disabled: generateUIMutation.isPending }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("p", { className: "text-xs text-slate-500", children: "Press Enter to send, Shift+Enter for new line" }), _jsx("button", { onClick: handleSend, disabled: generateUIMutation.isPending || !input.trim(), className: "px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none", children: generateUIMutation.isPending ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("svg", { className: "animate-spin w-4 h-4", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", className: "opacity-25" }), _jsx("path", { fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", className: "opacity-75" })] }), _jsx("span", { children: "Generating..." })] })) : (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: "Generate" }), _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) })] })) })] })] }) })] })] }));
};
export default StudioTestPage;
