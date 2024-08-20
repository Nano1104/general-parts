import { useState } from "react"
//icons
import { IoCartOutline } from "react-icons/io5";
import { CiWarning } from "react-icons/ci";
import { LuClipboardList } from "react-icons/lu";

export const Reserves = () => {
    const [reserves, setReserves] = useState([])

    return (
        <>
            <div className="w-[90%] h-[95vh] bg-deepGray
                    absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-3xl text-center">
                        <div className="bg-lightGray w-full h-[40%] flex justify-center items-center rounded-tl-3xl rounded-tr-3xl">
                            <div className="flex relative">
                                <LuClipboardList className="inline-block text-[14rem]" />
                                <CiWarning className="text-[8rem] text-red absolute top-0 right-0 z-50" />
                            </div>
                        </div>
                        <div className="h-[60%]">
                            <h1 className="text-[4rem] font-semibold tracking-tighter font-montserrat">No hay reservas realizadas por el momento!</h1>
                        </div>
                    </div>
        </>
    )
}