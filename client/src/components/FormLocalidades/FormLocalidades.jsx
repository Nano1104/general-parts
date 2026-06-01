export const FormLocalidades = ({
    localidades,
    register,
    errors,
    name = "city",
    labelClass,
    inputBase,
    errorClass
}) => {
    return (
        <div className="w-full flex flex-col relative">
            <label htmlFor="password" className={labelClass}>Localidad</label>
            <select
                id="localidades"
                className={inputBase + " " + (errors?.[name]?.message ? errorClass : "")}
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