import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { trpc } from '../utils/trpc';
export default function Home() {
    const hello = trpc.hello.useQuery({ name: 'World' });
    if (hello.isLoading)
        return _jsx("p", { className: "text-blue-500", children: "Loading..." });
    if (hello.error)
        return _jsx("p", { className: "text-red-500", children: hello.error.message });
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsxs("div", { className: "text-center space-y-8 p-8", children: [_jsx("h1", { className: "text-6xl font-bold text-gray-800 mb-4", children: hello.data?.greeting }), _jsx("p", { className: "text-xl text-gray-600 max-w-2xl", children: "Create dynamic UIs using natural language with AI-powered generation" }), _jsxs("div", { className: "space-y-4", children: [_jsx(Link, { to: "/editor", className: "inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105", children: "\uD83D\uDE80 Launch Editor" }), _jsxs("div", { className: "flex justify-center space-x-4 text-sm text-gray-500", children: [_jsx("span", { className: "bg-white px-3 py-1 rounded-full", children: "\u2728 AI-Powered" }), _jsx("span", { className: "bg-white px-3 py-1 rounded-full", children: "\u26A1 Real-time" }), _jsx("span", { className: "bg-white px-3 py-1 rounded-full", children: "\uD83C\uDFAF Type-safe" })] })] })] }) }));
}
