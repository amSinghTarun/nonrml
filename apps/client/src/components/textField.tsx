
export const Textfield = ({placeholder} : {placeholder: string}) => {
    return (
        <>
            <input className="text-white text-center border border-white font-mono w-[100%] bg-black rounded-full p-3 outline-none placeholder:text-white placeholder:text-center" placeholder={placeholder}></input>
        </>
    )
}