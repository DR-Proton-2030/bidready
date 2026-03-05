import BluePrintDetection from '@/components/pages/bluePrintDetection/BluePrintDetection'
import React, { use } from 'react'

const page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  return (
    <div>
      <BluePrintDetection id={id} />
    </div>
  )
}

export default page
