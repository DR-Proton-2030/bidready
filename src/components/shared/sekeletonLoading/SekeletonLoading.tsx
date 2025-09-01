const SkeletonLoading = () => {
    return (
        <div className="p-4 h-[600px]">
            <div className="animate-pulse space-y-4">
                <div className="h-[600px] bg-gray-100 rounded w-full"></div>
            </div>
        </div>
    );
};

export default SkeletonLoading;