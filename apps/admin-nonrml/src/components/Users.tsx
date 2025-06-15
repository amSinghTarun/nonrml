"use client"

import React, { useState } from "react"
import { RouterOutput, trpc } from "@/app/_trpc/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel
} from '@/components/ui/form-shadcn'
import { UseTRPCQueryResult } from "@trpc/react-query/shared"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type Users = UseTRPCQueryResult<RouterOutput["viewer"]["user"]["getUsersInfo"], unknown>

export const Users = ({users}: {users: Users}) => {
    const router = useRouter()
    const [isCreditNoteDialogOpen, setIsCreditNoteDialogOpen] = useState(false)
    
    const changeRole = trpc.viewer.user.changeRole.useMutation({
        onSuccess: () => {
            users.refetch();
        }
    });

    const createCreditNote = trpc.viewer.creditNotes.createCreditNote.useMutation({
        onSuccess: () => {
            users.refetch()
            setIsCreditNoteDialogOpen(false)
        }
    })

    const handleCreditNoteSubmit = async (data: {userId: number, amount: number}) => {
        await createCreditNote.mutateAsync({
          userId: data.userId,
          value: +data.amount,
        })
    }

    const creditNoteForm = useForm({
        defaultValues: {
            amount: 0,
            userId: 0
        }
    })

    return (
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="bg-orange-400 text-white cursor-pointer">Id</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>First Signin</TableHead>
            <TableHead>Last signin</TableHead>
            </TableRow>
        </TableHeader>
        
        <TableBody>
        { 
            users.status == "success" 
            ? users.data.data.map( user => (
                <TableRow key={user.id} className={`${user.role != "USER" && "bg-orange-700 text-white hover:bg-red-300"}`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <TableCell onClick={() => router.push(`/users/${user.id}`)} className="hover:bg-orange-400 cursor-pointer">{user.id}</TableCell>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-stone-700 text-white">
                            <DropdownMenuItem onClick={() => router.push(`/address?userId=${user.id}`)}>View Address</DropdownMenuItem>
                    
                            { user._count.order > 0 && <DropdownMenuItem onClick={() => router.push(`/orders?userId=${user.id}`)}>View Orders</DropdownMenuItem>}
                            { user._count.creditNotes > 0 && <DropdownMenuItem onClick={() => router.push(`/creditNotes?userId=${user.id}`)}>View Credit notes</DropdownMenuItem>}
                            <DropdownMenuItem onClick={() => setIsCreditNoteDialogOpen(true)}>Gift Credit note</DropdownMenuItem>
                            <DropdownMenuItem onClick={ async () => await changeRole.mutateAsync({userId: user.id, role: user.role == "ADMIN" ? "USER" : "ADMIN"})}>{user.role == "ADMIN" ? "REMOVE ADMIN" : "MAKE ADMIN"}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                <TableCell>{`${user.contactNumber}`}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user._count.order}</TableCell>
                <TableCell>{user.createdAt.toDateString()}</TableCell>
                <TableCell>{user.updatedAt.toDateString()}</TableCell>
                {/* Credit Note Dialog */}
                <Dialog open={isCreditNoteDialogOpen} onOpenChange={setIsCreditNoteDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Issue Credit Note</DialogTitle>
                    </DialogHeader>
                    <Form {...creditNoteForm}>
                        <form onSubmit={creditNoteForm.handleSubmit((e) => handleCreditNoteSubmit({userId: user.id, amount: e.amount}))} className="space-y-4">
                        <h2>User Mobile : {user.contactNumber}</h2>
                        <FormField
                            control={creditNoteForm.control}
                            name="amount"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                            </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Issue Credit Note</Button>
                        </DialogFooter>
                        </form>
                    </Form>
                    </DialogContent>
                </Dialog>
            </TableRow>
            ))
            : <></> 
        }
        </TableBody>
        </Table>
    )
} 