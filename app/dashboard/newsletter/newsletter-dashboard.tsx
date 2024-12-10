'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { MoreHorizontal, Download, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { AddSubscriberDialog } from './add-subscriber-dialog'
import { useSubscribers } from './use-subscribers'
import { EditSubscriberDialog } from './edit-subscriber-dialog'
import { Subscriber } from '@/types/subscriber'

export function NewsletterDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const {
    subscribers,
    isLoading,
    error,
    deleteSubscriber,
    exportSubscribers,
    refresh,
  } = useSubscribers()

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterVerified === null || subscriber.isVerified === filterVerified
    return matchesSearch && matchesFilter
  })

  const handleExport = async () => {
    try {
      await exportSubscribers()
      toast({
        title: 'Success',
        description: 'Subscribers exported successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export subscribers',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriber(id)
      toast({
        title: 'Success',
        description: 'Subscriber deleted successfully',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber',
        variant: 'destructive',
      })
    }
  }

  if (error) {
    return <div>Error loading subscribers: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Filter: {filterVerified === null ? 'All' : filterVerified ? 'Verified' : 'Unverified'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterVerified(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterVerified(true)}>
                Verified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterVerified(false)}>
                Unverified
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subscriber
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription Date</TableHead>
              <TableHead>Verified Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>{subscriber.email}</TableCell>
                <TableCell>
                  <Badge variant={subscriber.isVerified ? 'default' : 'secondary'}>
                    {subscriber.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(subscriber.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {subscriber.verifiedAt
                    ? format(new Date(subscriber.verifiedAt), 'MMM d, yyyy')
                    : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedSubscriber(subscriber)
                          setShowEditDialog(true)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(subscriber.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddSubscriberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          refresh()
          setShowAddDialog(false)
        }}
      />

      <EditSubscriberDialog
        subscriber={selectedSubscriber}
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) {
            setSelectedSubscriber(null)
            refresh()
          }
        }}
      />
    </div>
  )
} 