

// Logo Component - Mejorado y Responsivo
export const Logo = () => {
    return (
        <div className="font-poppins font-bold flex items-baseline justify-center lg:justify-start mb-12 sm:mb-24">
            <h1 className="flex items-baseline">
                <span className="text-lightRed tracking-tighter italic
                               text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]">
                    SW
                </span>
                <span className="text-cBlack lg:text-white tracking-tight italic
                               text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]
                               ml-1 sm:ml-2">
                    Parts
                </span>
            </h1>
        </div>
    )
}

