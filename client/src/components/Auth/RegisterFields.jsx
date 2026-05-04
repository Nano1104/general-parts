
import { FormLocalidades } from "../FormLocalidades/FormLocalidades.jsx";
import { CUITInput } from "../CUITInput/CUITInput.jsx";

export default function RegisterFields({ register, errors, watch, showPassword, onTogglePassword, localidades }) {
    return (
        <>
            {/* NOMBRE Y APELLIDO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                    <input
                        type="text"
                        autoComplete="off"
                        className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                        placeholder="Ingrese su nombre"
                        {...register("nombre", {
                            required: "Campo incompleto",
                            validate: (value) => {
                                const val = value.trim().split(" ");
                                return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                            }
                        })}
                    />
                    {errors.nombre?.type && (
                        <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                            {errors.nombre.message}
                        </span>
                    )}
                </div>

                <div className="w-full">
                    <input
                        type="text"
                        autoComplete="off"
                        className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                        placeholder="Ingrese su apellido"
                        {...register("apellido", {
                            required: "Campo incompleto",
                            validate: (value) => {
                                const val = value.trim().split(" ");
                                return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                            }
                        })}
                    />
                    {errors.apellido?.type && (
                        <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                            {errors.apellido.message}
                        </span>
                    )}
                </div>
            </div>

            {/* EMAIL Y TELÉFONO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                    <input
                        type="email"
                        autoComplete="off"
                        className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                        placeholder="Ingrese su email"
                        {...register("email", {
                            required: "Campo incompleto",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email no válido"
                            }
                        })}
                    />
                    {errors.email?.type && (
                        <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                            {errors.email.message}
                        </span>
                    )}
                </div>

                <div className="w-full">
                    <input
                        type="text"
                        autoComplete="off"
                        className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                        border border-cBlack rounded-xl transition-all duration-200
                                                        focus:border-lightRed focus:border-2 focus:shadow-md
                                                        placeholder:text-gray-500"
                        placeholder="Ingrese su número de celular"
                        {...register("phone", {
                            required: "Campo incompleto",
                            /* validate: (value) => {
                                // eliminamos espacios, guiones y paréntesis
                                const cleanValue = value.replace(/[\s\-()]/g, "");

                                // debe contener solo números
                                if (!/^\d+$/.test(cleanValue)) {
                                    return "Solo se permiten números";
                                }

                                // si empieza con 15, lo eliminamos (prefijo local)
                                const normalized = cleanValue.startsWith("15")
                                    ? cleanValue.slice(2)
                                    : cleanValue;

                                // debe comenzar con 11 y tener exactamente 10 dígitos totales (número completo de CABA o AMBA)
                                if (!/^11\d{8}$/.test(normalized)) {
                                    return "Número de celular no válido";
                                }

                                return true;
                            }, */
                        })}
                    />
                    {errors.phone?.type && (
                        <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                            {errors.phone.message}
                        </span>
                    )}

                </div>
            </div>

            {/* DIRECCIÓN Y CIUDAD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="w-full">
                    <input
                        type="text"
                        autoComplete="off"
                        className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                        placeholder="Ingrese su dirección. Ej: Calle San Martín 567"
                        {...register("location")}
                    />
                </div>

                <div className="w-full">
                    <FormLocalidades
                        localidades={localidades}
                        register={register}
                        errors={errors}
                        name="city"
                    />
                </div>
            </div>

            {/* CUIT Y CONTRASEÑA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="w-full">
                    <CUITInput
                        register={register}
                        errors={errors}
                        name="cuit"
                    />
                </div>

                <div className="w-full relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="off"
                        className="w-full p-3 sm:p-4 pr-12 bg-transparent outline-none text-cBlack
                                                        border border-cBlack rounded-xl transition-all duration-200
                                                        focus:border-lightRed focus:border-2 focus:shadow-md
                                                        placeholder:text-gray-500"
                        placeholder="Ingrese su contraseña"
                        {...register("password", {
                            required: "La contraseña es obligatoria",
                            validate: {
                                minLength: v =>
                                    v.length >= 8 || "Debe tener al menos 8 caracteres",
                                maxLength: v =>
                                    v.length <= 15 || "Debe tener máximo 15 caracteres",
                                hasUppercase: v =>
                                    /[A-Z]/.test(v) || "Debe contener al menos una mayúscula",
                                hasLowercase: v =>
                                    /[a-z]/.test(v) || "Debe contener al menos una minúscula",
                                hasNumber: v =>
                                    /\d/.test(v) || "Debe contener al menos un número",
                                noSpaces: v =>
                                    !/\s/.test(v) || "No debe contener espacios"
                            }
                        })}
                    />
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 
                                                    text-gray-600 hover:text-cBlack transition-colors"
                    >
                        {showPassword ? (
                            // Ojo abierto
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        ) : (
                            // Ojo cerrado
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        )}
                    </button>
                    {errors.password && (
                        <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                            {errors.password.message}
                        </span>
                    )}
                </div>
            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div className="w-full max-w-md mx-auto">
                <input
                    type="password"
                    autoComplete="off"
                    className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                 border border-cBlack rounded-xl transition-all duration-200
                                                 focus:border-lightRed focus:border-2 focus:shadow-md
                                                 placeholder:text-gray-500"
                    placeholder="Confirmar contraseña"
                    {...register("confirmPassword", {
                        required: "Campo incompleto",
                        validate: (value) => {
                            return value === watch("password") || "Las contraseñas no coinciden";
                        }
                    })}
                />
                {errors.confirmPassword?.type && (
                    <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                        {errors.confirmPassword.message}
                    </span>
                )}
            </div>
        </>
    )
}