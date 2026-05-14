'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { db } from '@/lib/firebase-client'
import { doc, updateDoc } from 'firebase/firestore'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  isInitialSetup?: boolean
}

export default function ProfileModal({ isOpen, onClose, isInitialSetup = false }: ProfileModalProps) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      alert('Display name is required.')
      return
    }

    setIsSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { 
        displayName,
        hasCompletedSetup: true 
      })
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <h2 className="modal-title">
          {isInitialSetup ? 'Complete Your Profile' : 'Edit Profile'}
        </h2>
        <p className="modal-description text-secondary" style={{ marginBottom: '1.5rem' }}>
          {isInitialSetup 
            ? 'Welcome! Please set your display name to get started.' 
            : 'Update your display name for the community.'}
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <img
              src={user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
              alt={user.displayName}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            />
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              Profile picture is synced with your Google account.
            </div>
          </div>

          <div>
            <label className="label">Display Name</label>
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your public name"
              maxLength={50}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {!isInitialSetup && (
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ flex: 1 }}>
              {isSaving ? 'Saving...' : (isInitialSetup ? 'Get Started' : 'Save Changes')}
            </button>
          </div>
        </form>

        {isInitialSetup && (
          <div className="modal-footer text-muted">
            By continuing, you agree to our community guidelines.
          </div>
        )}
      </div>
    </div>
  )
}
