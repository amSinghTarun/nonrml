-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "creditNoteId" INTEGER;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "CreditNotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
