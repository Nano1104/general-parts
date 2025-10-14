import { useAuthContext } from "../../context/AuthContext.jsx";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
//components
import { AdminNavBar } from "../../components/AdminNavBar/AdminNavBar.jsx"
import { UserManage } from "../../components/userManage/userManage.jsx"
import { ProductsManage } from "../../components/productsManage/productsManage.jsx"
import { ListManage } from "../../components/listManage/listManage.jsx"

export const AdminPage = () => {
    const { manage } = useParams();
    const { authUser } = useAuthContext();

    useEffect(() => { }, [manage])

    return (
        <>
            <div className="w-full h-screen md:w-[98%] lg:w-[95%] md:h-[98vh] lg:h-[95vh] md:rounded-2xl lg:rounded-3xl bg-gray flex flex-col md:flex-row
            md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2">
                <AdminNavBar />
                <div className="flex-1 md:basis-[85%] flex flex-col items-center h-full overflow-y-auto pt-16 md:pt-0">
                    <h1 className="text-center text-2xl md:text-3xl font-montserrat font-medium mt-5 px-4">
                        Hola {authUser.first_name}!
                    </h1>
                    <hr className="border-[1.5px] border-cBlack w-[50%] md:w-[40%] lg:w-[30%] rounded-sm mt-2" />
                    <div className="h-full w-full font-poppins mt-10 md:mt-16 lg:mt-20 pb-6">
                        {
                            manage === "users" ? (
                                <UserManage />
                            ) :
                                manage === "products" ? (
                                    <ProductsManage />
                                ) :
                                    manage === "orders" ? (
                                        <ListManage />
                                    ) : <></>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}