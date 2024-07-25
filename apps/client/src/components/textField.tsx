
export const Textfield = ({placeholder,  onChangeFnc} : {placeholder: string,  onChangeFnc:any}) => {
    return (
        <>
            <input className="text-white text-center border border-white  w-[100%] bg-transparent  rounded-full p-3 outline-none placeholder:text-white placeholder:text-center" placeholder={placeholder}></input>
        </>
    )
}