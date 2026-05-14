'use client'

import { useState } from 'react'
import AddAccountabilityPeriodModal from '@/app/components/AddAccountabilityPeriodModal'

export default function AddPeriodAction({ candidateId }: { candidateId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        className="btn btn-secondary btn-sm" 
        onClick={() => setIsModalOpen(true)}
        style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
      >
        + Add Period
      </button>
      
      <AddAccountabilityPeriodModal 
        candidateId={candidateId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
