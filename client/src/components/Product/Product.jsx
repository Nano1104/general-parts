
export const Product = ({data}) => {
    const { NUMERO_DE_ARTICULO, CATEGORIA, DESCRIPCION_DE_REPUESTO, MARCA, PRECIO } = data;

    return(
        <>
        <div className="flex flex-col gap-2 justify-center items-center border border-gray p-6 h-[150px] w-[150px] font-roboto">
            <strong>{NUMERO_DE_ARTICULO}</strong>
            <h3>{CATEGORIA}</h3>
            <span>{DESCRIPCION_DE_REPUESTO}</span>
            <span>{MARCA}</span>
            <span>{PRECIO}</span>
        </div>
        </>
    )
}