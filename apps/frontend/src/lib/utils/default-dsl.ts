import { nanoid } from "nanoid";

export const default_dsl = {
    id: nanoid(6),
    type: "div",
    props: {
        className: "min-h-screen flex flex-col  bg-gray-100 p-8",
    },
    children: [
        {
            id: nanoid(6),
            type: "h1",
            props: {
                className: "text-3xl font-bold mb-4",
            },
            children: ["Welcome to SuperAtom Editor"],
        },
        {
            id: nanoid(6),
            type: "p",
            props: {
                className: "text-gray-600 mb-6 text-center",
            },
            children: [
                "This is a default UI generated from your schema. You can edit or extend it using the editor.",
            ],
        },
        {
            id: nanoid(6),
            type: "button",
            props: {
                className:
                    "bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition",
                onClick: "handleButtonClick",
            },
            children: ["Get Started"],
        },
    ],
};