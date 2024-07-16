import { Link } from "react-router-dom"
import bgContact from "../../images/bg-contact.avif"
import "./contact.css"

import { FaArrowRight } from "react-icons/fa6";

export const Contact = () => {
    return(
        <>
        <div id="contact-container" className="flex">            
            <div className="basis-[60%] ml-8 relative">
                <h1 className="text-7xl mt-10 text-white font-semibold relative inline-block" id="contact-title">Déjanos tu<br />consulta</h1>
                <div className="absolute top-0 right-0 m-5 text-white" id="btn-back">
                    <Link to="/">HOME<FaArrowRight className="inline-block" id="icon-back"/></Link>
                </div>
                <form action="" className="flex flex-col gap-7 m-5 mt-[11vh]" id="contact-form">
                    <input className="p-2" type="text" placeholder="Nombre y apellido" />
                    <input className="p-2" type="text" placeholder="Teléfono" />
                    <input className="p-2" type="text" placeholder="Email" />
                    <textarea className="text-white resize-none" name="" id="" placeholder="Envia tu mensaje"></textarea>
                    <button className="bg-orange w-[18%] rounded-md py-1 text-black font-medium font-poppins" type="submit">ENVIAR MENSAJE</button>
                </form>
                <div className="flex justify-around text-center mt-[11vh] text-white" id="labels">
                    <div className="flex flex-col gap-2 relative">
                        {/* <span className="point-label absolute left-0"></span> */}
                        <h3 className="text-xl font-semibold">- Gabriel Periale</h3>
                        <span>+911 50382817</span>
                    </div>
                    <div className="flex flex-col gap-2 relative">
                        {/* <span className="point-label absolute left-0"></span> */}
                        <ul>
                            <li>
                                <h3 className="text-xl font-semibold">- Juan Pugliese</h3>
                            </li>
                        </ul>
                        <span>+911 50382817</span>
                    </div>
                </div>
            </div>
            <div className="basis-[40%]">
                <img src={bgContact} alt="" className="w-full h-[100vh]" />
            </div>
        </div>
        </>
    )
}