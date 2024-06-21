import { NavBar } from "../../components/NavBar/NavBar.jsx"
import { Logo } from "../../components/Logo/Logo.jsx"
import { Link } from "react-router-dom";

import bgImg from "../../images/bg-home.avif"
import logo from "../../images/sv-logo.svg"

import "./Home.css"

export const Home = () => {
    return(
        <>
        <div className="h-[100vh] w-full relative overflow-hidden">
            <img src={bgImg} alt="" id="bg-home" />
            <NavBar />
            {/* <div className="flex justify-center items-center border">
                <svg
                    version="1.1"
                    id="svg-logo"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 200 200"
                    style={{ enableBackground: 'new 0 0 200 200' }}
                    xmlSpace="preserve"
                    className="w-[30%] relative"
                    >
                    <style type="text/css">
                        {`
                        .st0 { fill: none; stroke: #000; stroke-width: 5; stroke-miterlimit: 10; stroke-dasharray: 11.9494, 11.9494;}
                        .st1 { fill: none; stroke: #000; stroke-width: 5; stroke-miterlimit: 10;}
                        .st2 { fill: none; stroke: #000; stroke-miterlimit: 10;}
                        `}
                    </style>
                    <g id="XMLID_1_">
                        <g id="XMLID_3_">
                        <circle id="XMLID_16_" className="st0" cx="100" cy="100" r="79.9" />
                        </g>
                        <circle id="XMLID_2_" className="st1" cx="100.4" cy="99.6" r="75.9" />
                        <circle id="XMLID_4_" className="st2" cx="100.4" cy="99.6" r="69.6" />
                    </g>
                </svg>
                <span className="italic font-roboto font-extrabold text-[14rem] text-red absolute">SW</span>
                <span to="/productos" className="font-poppins font-medium text-white absolute top-[55vh]">Repuestos de Automóviles</span>
            </div> */}

            <div className="flex flex-col justify-center items-center leading-none relative top-[22vh]" id="home-title">
                <h1 className="italic font-roboto font-extrabold text-[14rem] text-red" id="home-title">SW</h1>
                <span to="/productos" className="font-poppins font-medium text-white text-xl">Repuestos de Automóviles</span>
            </div>
        </div>
        </>
    )
}