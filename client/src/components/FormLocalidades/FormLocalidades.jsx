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
                className="p-2 bg-transparent w-full outline-0 text-cBlack focus:text-black
                        border-[1px] border-cBlack rounded-xl
                        focus:border-dotted placeholder-cBlack"
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
                <span className="text-red font-custom font-medium text-xs mt-2">
                    {errors[name].message}
                </span>
            )}
        </div>
    );
}


/* text-[#C0C0C0]  - color de texto que estaba antes de hacer el cambio de paleta de colores */