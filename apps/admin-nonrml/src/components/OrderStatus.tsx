import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { prismaEnums, prismaTypes } from "@nonrml/prisma"

export const OrderStatus = ({onClick} : {onClick: (status:prismaTypes.OrderStatus) => void}) => (
    <Select onValueChange={(value) => onClick(value as prismaTypes.OrderStatus)}>
        <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Order status" />
        </SelectTrigger>
        <SelectContent>
            {
                Object.keys(prismaEnums.OrderStatus).map( status => (
                    <SelectItem key={status.length} value={status}>{status}</SelectItem>
                ))
            }
        </SelectContent>
    </Select>
)