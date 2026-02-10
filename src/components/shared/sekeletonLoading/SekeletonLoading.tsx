"use client"

const SkeletonLoading = () => {
    return (
        <div className="w-full h-full p-8 overflow-hidden bg-slate-50/50 relative min-h-[calc(100vh-80px)]">
            <div className="max-w-7xl mx-auto space-y-10 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-3">
                        <div className="h-10 bg-gray-200 rounded-xl w-64"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-full max-w-md"></div>
                    </div>
                    <div className="h-12 bg-orange-100 rounded-xl w-40 border border-orange-200/50 flex-shrink-0"></div>
                </div>

                {/* Action Bar Skeleton */}
                <div className="h-16 bg-white rounded-2xl shadow-sm border border-gray-100 w-full flex items-center px-6 space-x-4">
                    <div className="h-8 bg-gray-100 rounded-lg flex-1"></div>
                    <div className="h-8 bg-gray-100 rounded-lg w-10 md:w-32"></div>
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5"
                        >
                            <div className="h-44 bg-slate-100/50 rounded-2xl animate-pulse"></div>
                            <div className="space-y-3">
                                <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded-md w-full"></div>
                                <div className="h-4 bg-gray-100 rounded-md w-1/2"></div>
                            </div>
                            <div className="pt-4 flex justify-between items-center border-t border-gray-50">
                                <div className="h-7 bg-orange-50 rounded-full w-24"></div>
                                <div className="h-5 bg-gray-100 rounded-md w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative Brand Glows */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-orange-100/30 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>


        </div>
    );
};

export default SkeletonLoading;