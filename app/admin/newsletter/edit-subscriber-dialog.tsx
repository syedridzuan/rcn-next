'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'

interface Subscriber {
  id: string
  email: string
  isVerified: boolean
}

interface EditSubscriberDialogProps {
  subscriber: Subscriber | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSubscriberDialog({ 
  subscriber, 
  open, 
  onOpenChange 
}: EditSubscriberDialogProps) {
  const [email, setEmail] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Update form when subscriber changes or dialog opens
  useEffect(() => {
    if (subscriber && open) {
      setEmail(subscriber.email)
      setIsVerified(subscriber.isVerified)
    } else if (!open) {
      // Reset form when dialog closes
      setEmail('')
      setIsVerified(false)
    }
  }, [subscriber, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscriber) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/newsletter/${subscriber.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isVerified }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update subscriber')
      }

      toast({
        title: 'Success',
        description: 'Subscriber updated successfully',
      })
      
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update subscriber',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subscriber</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={isVerified}
                onCheckedChange={(checked: boolean | 'indeterminate') => 
                  setIsVerified(checked === true)
                }
              />
              <Label htmlFor="verified">Verified</Label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Subscriber'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 