import { Link } from "react-router-dom"

export const NoMatchRoute = () => {
    return(
        <>
            <div className="w-[500px] h-[500px] bg-slate-600">
                <h1 className="text-3xl text-red font-semibold">No Match Route!</h1>
                <Link to="/">VOLVER</Link>
            </div>
        </>
    )
}