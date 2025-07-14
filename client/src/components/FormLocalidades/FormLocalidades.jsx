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
                className="p-2 bg-transparent w-full outline-0 text-[#C0C0C0] focus:text-black
                        border-[1px] border-white rounded-xl
                        focus:border-dotted"
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
                <span className="text-orange font-custom font-medium text-xs mt-2">
                    {errors[name].message}
                </span>
            )}
        </div>
    );
}
