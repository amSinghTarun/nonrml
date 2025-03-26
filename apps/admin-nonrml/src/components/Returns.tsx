import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { redirect } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { RouterOutput } from '@/app/_trpc/client';

type Returns = RouterOutput["viewer"]["return"]["getAllReturns"]["data"]

const ReturnsList = ({ returns}: {returns: Returns}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Returns</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Return ID</TableHead>
              <TableHead className='bg-red-200'>Order ID</TableHead>
              <TableHead>Receive Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Replacement ID</TableHead>
              <TableHead>Replacement Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns?.map((returnItem) => (
              <TableRow key={returnItem.id}>
                <TableCell>{returnItem.id}</TableCell>
                <TableCell className='cursor-pointer' onClick={()=> {redirect(`/orders/${returnItem.orderId}`)}}>{returnItem.orderId}</TableCell>
                <TableCell>{returnItem.returnReceiveDate?.toDateString()}</TableCell>
                <TableCell>{returnItem.returnStatus}</TableCell>
                <TableCell>{returnItem.ReplacementOrder?.id ?? 'N/A'}</TableCell>
                <TableCell>{returnItem.ReplacementOrder?.status ?? 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReturnsList;