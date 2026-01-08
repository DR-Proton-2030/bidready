import CreateBlueprint from '@/components/pages/createBlueprint/CreateBluePrint'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div>
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
        <CreateBlueprint />
      </Suspense>
    </div>
  )
}

export default page