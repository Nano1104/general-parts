import { useState } from "react"

export const ItemCount = ({handleQuantity}) => {
    const { quantity, amount, setAmount } = handleQuantity

    const handlePlus = () => {
        if(amount == quantity) {
            return
        } else {
            setAmount(amount + 1)
        }
    }

    const handleLess = () => {
        if(amount == 0) {
            return
        } else {
            setAmount(amount - 1)
        }
    }

    return(
        <>
            <div id="item-count-container" className="text-xl flex justify-start border border-[#373A40] rounded-2xl w-[30%]">
                <button className="flex-grow basis-0 rounded-tl-xl rounded-bl-xl py-1 pl-3 pr-2" onClick={handlePlus}>+</button>
                <input type="text" value={amount} className="w-[40%] text-center bg-transparent" />
                <button className="flex-grow basis-0 rounded-tr-xl rounded-br-xl py-1 pl-2 pr-3" onClick={handleLess}>-</button>
            </div>
        </>
    )
}