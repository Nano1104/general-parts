import "./login.css"

export const Login = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
    }
    
    return(
        <>
        <div className="h-[100vh] w-full overflow-hidden" id="login-container">
            <form action="post" id="form" className="" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-center gap-3 mt-5">
                    <input type="text" className="w-[20%] rounded-md py-1 px-2" placeholder="Escribe tu nombre y apellido" required/>
                    <input type="email" className="w-[20%] rounded-md py-1 px-2" placeholder="Escribe tu email" required/>
                    <button type="submit" className="py-2 px-4 m-4 bg-red text-center text-white rounded-md w-[8%]">LOGIN</button>
                </div>
            </form>
        </div>
        </>
    )
}