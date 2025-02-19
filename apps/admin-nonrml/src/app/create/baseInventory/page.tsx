import { CreateBaseInventory } from "@/components/create/createBaseInventory"

export default () => {
    return (
        <>
            <section className="flex flex-col w-screen h-screen  ">
                <h1 className="bg-stone-700 text-white p-3">ADD BASE INVENTORY ITEM</h1>
                <CreateBaseInventory />
            </section>
        </>
    )   
}