import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { prismaEnums } from "@nonrml/prisma"

export const OrderStatus = ({onClick} : {onClick: (status:any) => void}) => (
    <Select onValueChange={(value) => onClick(value)}>
        <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Order status" />
        </SelectTrigger>
        <SelectContent>
            {
                Object.keys(prismaEnums.OrderStatus).map( status => (
                    <SelectItem value={status}>{status}</SelectItem>
                ))
            }
        </SelectContent>
    </Select>
)