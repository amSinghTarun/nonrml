"use client"
import { trpc } from "@/app/_trpc/client"
import { CreditNotes } from "@/components/CreditNotes"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ListFilter } from "lucide-react"

const CreditNotesPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const userIdParam = searchParams.get('userId')
  const orderIdParam = searchParams.get('orderId')
  const creditNoteCodeParam = searchParams.get('creditNoteCode')
  
  const [searchId, setSearchId] = useState(creditNoteCodeParam || "")
  
  useEffect(() => {
    setSearchId(creditNoteCodeParam || "")
  }, [creditNoteCodeParam])

  const creditNotes = trpc.viewer.creditNotes.getCreditNotes.useQuery({
    ...( userIdParam && { userId: +userIdParam } ),
    ...( orderIdParam && { orderId: +orderIdParam } ),
    ...( creditNoteCodeParam && { creditNoteCode: creditNoteCodeParam } )
  }, {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams)
    
    if (searchId.trim()) {
      newParams.set('creditNoteCode', searchId.trim())
    } else {
      newParams.delete('creditNoteCode')
    }
    
    router.push(`?${newParams.toString()}`)
  }

  const handleClear = () => {
    setSearchId("")
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('creditNoteCode')
    router.push(`?${newParams.toString()}`)
  }

  const handleShowAll = () => {
    setSearchId("")
    router.push("/") // This removes all URL parameters
  }

  return (
    <section className="flex flex-col w-screen h-screen text-black">
      <div className="p-5 bg-stone-600 flex flex-row gap-5 items-center">
        <h1 className="text-left flex text-white font-bold items-center">Credit Notes</h1>
        <div className="flex flex-row bg-white rounded-md">
          <Input
            type="text"
            placeholder="Search by Credit Note Code"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-xs border-0 rounded-r-none placeholder:text-sm text-sm"
          />
          <Button onClick={handleSearch} variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {creditNoteCodeParam && (
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="text-white hover:text-stone-600"
          >
            Clear Search
          </Button>
        )}
        <Button 
            variant="default"
            onClick={handleShowAll}
            className="bg-white text-stone-600 hover:bg-gray-100"
        >
            <ListFilter className="h-4 w-4 mr-2" />
            Show All
        </Button>
      </div>
      
      <CreditNotes creditNotes={creditNotes}/>
      {creditNotes.isLoading && <div className="p-4">Loading...</div>}
      {creditNotes.error && <div className="p-4 text-red-500">Error: {creditNotes.error.message}</div>}
    </section>
  )
}

export default CreditNotesPage;