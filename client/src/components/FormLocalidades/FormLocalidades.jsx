export const FormLocalidades = ({
    localidades,
    register,
    errors,
    name = "city" // Nombre del campo por defecto
}) => {
    return (
        <div className="w-full flex flex-col items-center relative">
            <select
                id="localidades"
                className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                            border border-cBlack rounded-xl transition-all duration-200
                            focus:border-lightRed focus:border-2 focus:shadow-md
                            placeholder:text-gray-500"
                {...register(name, {
                    required: "Debe seleccionar una localidad"
                })}
            >
                <option value="">Seleccione una localidad</option>
                {localidades.map((localidad) => (
                    <option key={localidad.id} value={localidad.nombre}>
                        {localidad.nombre}
                    </option>
                ))}
            </select>
            {errors?.[name]?.message && (
                <span className="text-lightRed font-custom font-medium text-xs mt-2">
                    {errors[name].message}
                </span>
            )}
        </div>
    );
}


/* text-[#C0C0C0]  - color de texto que estaba antes de hacer el cambio de paleta de colores */