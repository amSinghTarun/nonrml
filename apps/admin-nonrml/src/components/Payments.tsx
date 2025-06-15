"use client"

import React, { useState } from 'react';
import { trpc } from '@/app/_trpc/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { prismaEnums, prismaTypes } from '@nonrml/prisma';
import { RefundDetailsDialog } from './dialogs/RefundDetailsDialog';
import { redirect } from 'next/navigation';

const PaymentsDashboard = () => {
  const initialFilters = {
    search: "",
    paymentStatus: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 0
  };

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  // State for filters
  const [filters, setFilters] = useState<{
    search: string | undefined,
    paymentStatus: prismaTypes.PaymentStatus | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined,
    page: number
  }>(initialFilters);

  // Function to clear all filters
  const clearFilters = () => {
    setFilters(initialFilters);
  };

  // TRPC Query with filters
  const paymentsQuery = trpc.viewer.payment.getAllPayments.useQuery({
    search: filters.search,
    paymentStatus: filters.paymentStatus,
    startDate: filters.startDate,
    endDate: filters.endDate,
    page: filters.page
  });

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Clear Filters
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID, Payment ID..."
                className="pl-8"
                value={filters.search || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 0 }))}
              />
            </div>
            <Select
              value={filters.paymentStatus || ""}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                paymentStatus: value as keyof typeof prismaTypes.PaymentStatus,
                page: 0
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, 'PPP') : 'Start Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date, page: 0 }))}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, 'PPP') : 'End Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date, page: 0 }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payments</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='bg-orange-400'>Order ID</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Refunds</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsQuery.isLoading && <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>}
              {paymentsQuery.data?.data?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className='bg-orange-300 cursor-pointer' onClick={() => redirect(`/orders/${payment.orderId}`)}>{payment.orderId}</TableCell>
                  <TableCell>{payment.rzpPaymentId || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.paymentStatus == prismaEnums.PaymentStatus.captured 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>{payment.paymentService}</TableCell>
                  <TableCell>{+payment.Orders.totalAmount}</TableCell>
                  <TableCell> {payment.rzpPaymentId && payment.RefundTransactions.length
                    ? <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedPaymentId(payment.rzpPaymentId)}
                      >
                        {`View ${payment.RefundTransactions.length} Details`}
                      </Button>
                    : <X size={16}/>
                  } </TableCell>
                  <TableCell>{format(new Date(payment.createdAt), 'PPP')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <RefundDetailsDialog
            paymentId={selectedPaymentId || ''}
            open={!!selectedPaymentId}
            onOpenChange={(open) => {
              if (!open) setSelectedPaymentId(null);
            }}
          />

          {/* Pagination */}
          {paymentsQuery.data?.pagination && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {filters.page * 20 + 1}-
                {Math.min((filters.page + 1) * 20, paymentsQuery.data.pagination.total)} of{' '}
                {paymentsQuery.data.pagination.total} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  Page {filters.page + 1} of {paymentsQuery.data.pagination.pageCount}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= paymentsQuery.data.pagination.pageCount - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsDashboard;