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

    useEffect(() => {}, [manage])

    return(
        <>
            <div className="w-[95%] h-[95vh] rounded-3xl bg-gray flex
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <AdminNavBar />
                <div className="basis-[85%] flex flex-col items-center h-full overflow-y-auto">
                    <h1 className="text-center text-3xl font-montserrat font-medium mt-5">Hola {authUser.first_name}!</h1>
                    <hr className="border-[1.5px] border-cBlack w-[30%] rounded-sm mt-2" />
                    <div className="h-full w-full font-poppins mt-20">
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