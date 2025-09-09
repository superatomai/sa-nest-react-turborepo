
const ToolTip = ({ description }: { description: string }) => {
    return (
        <>
            <div className="absolute z-50 top-full left-0 mt-2 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl max-w-[200px] break-words border border-gray-700">
                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
                {description}
            </div>
        </>
    )
}

export default ToolTip
