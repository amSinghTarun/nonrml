import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { RouterOutput } from "@/app/_trpc/client"
  import { UseTRPCQueryResult } from "@trpc/react-query/shared"
  
  type Addresses = UseTRPCQueryResult<RouterOutput["viewer"]["address"]["getUserAddress"], unknown>
  
  export const Addresses = ({addresses}:{addresses: Addresses}) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Pincode</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
            {
              addresses.data?.data.map( address => (
                <TableRow key={address.id}>
                  <TableCell className="font-medium">{address.id}</TableCell>
                  <TableCell className="font-medium">{address.contactName}</TableCell>
                  <TableCell className="font-medium">{address.location}</TableCell>
                  <TableCell className="font-medium">{address.pincode}</TableCell>
                  <TableCell className="font-medium">{address.city}</TableCell>
                  <TableCell className="font-medium">{address.state}</TableCell>
                  <TableCell className="font-medium">{address.contactNumber}</TableCell>
                  <TableCell className="font-medium">{address.createdAt.toDateString()}</TableCell>
                </TableRow>
              ))
            }
  
        </TableBody>
      </Table>
    )
  } 