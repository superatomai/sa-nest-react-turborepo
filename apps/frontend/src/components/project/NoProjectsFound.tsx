import AddNewProject from './AddNewProject'

type Props = {
    orgId: string
}

const NoProjectsFound = ({ orgId }: Props) => {
    return (
        <div className="flex flex-1 items-center justify-center h-full">
            <div className="flex flex-col items-center text-center justify-center h-full gap-12">
                {/* Text */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">No projects found</h2>
                    <p className="mt-1 text-gray-500">Get started by creating your first project.</p>
                </div>

                {/* Button */}
                <AddNewProject orgId={orgId} variant="transparentLarge" />
            </div>
        </div>
    )
}

export default NoProjectsFound
