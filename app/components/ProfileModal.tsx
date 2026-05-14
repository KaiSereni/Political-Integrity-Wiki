'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { db, storage } from '@/lib/firebase-client'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  isInitialSetup?: boolean
}

export default function ProfileModal({ isOpen, onClose, isInitialSetup = false }: ProfileModalProps) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setPhotoURL(user.photoURL || '')
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB.')
      return
    }

    setIsUploading(true)
    try {
      const storageRef = ref(storage, `users/${user.uid}/profile_${Date.now()}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setPhotoURL(url)
      
      // Update immediately in Firestore for better UX
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { photoURL: url })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image.')
    } finally {
      setIsUploading(false)
    }
  }

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
            ? 'Welcome! Please set your display name and profile picture.' 
            : 'Update your display name and profile picture.'}
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                alt="Profile Preview"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--accent-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: -10,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                }}
              >
                {isUploading ? '...' : 'Edit'}
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              style={{ display: 'none' }}
              accept="image/*"
            />
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
            <button type="submit" className="btn btn-primary" disabled={isSaving || isUploading} style={{ flex: 1 }}>
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
