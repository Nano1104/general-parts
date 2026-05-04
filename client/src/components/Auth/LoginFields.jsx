export default function LoginFields({ register, errors }) {
    return (
        <div className="space-y-4">
            <div className="w-full">
                <input
                    type="email"
                    autoComplete="off"
                    className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                               border border-cBlack rounded-xl transition-all duration-200
                               focus:border-lightRed focus:border-2 focus:shadow-md
                               placeholder:text-gray-500"
                    placeholder="Ingrese su email"
                    {...register("emailLogin", {
                        required: "Campo incompleto"
                    })}
                />
                {errors.emailLogin && (
                    <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                        {errors.emailLogin.message}
                    </span>
                )}
            </div>

            <div className="w-full">
                <input
                    type="password"
                    autoComplete="off"
                    className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                               border border-cBlack rounded-xl transition-all duration-200
                               focus:border-lightRed focus:border-2 focus:shadow-md
                               placeholder:text-gray-500"
                    placeholder="Ingrese su contraseña"
                    {...register("passwordLogin", {
                        required: "Campo incompleto"
                    })}
                />
                {errors.passwordLogin && (
                    <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                        {errors.passwordLogin.message}
                    </span>
                )}
            </div>
        </div>
    );
}