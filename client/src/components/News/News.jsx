import axios from "axios";
import { useState, useEffect } from "react"
import { Product } from "../Product/Product"
import { BsPlusSquare } from "react-icons/bs";
import Swal from 'sweetalert2';
import { API_URL } from "../../utils/api_url.js";
import { useAuthContext } from "../../context/AuthContext.jsx";


export const News = () => {
    const { isAdmin } = useAuthContext()

    const [prodsDestacados, setProdsDestacados] = useState([])
    const [loading, setLoading] = useState(false)

    const pedirCodigoProducto = async () => {
      const { value: codigo } = await Swal.fire({
        title: 'Ingrese el código del producto',
        input: 'text',
        inputPlaceholder: 'Código',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return '¡Debes ingresar un código!';
          }
        }
      });
    
      if (codigo) {
        console.log('Código ingresado:', codigo);
        // Aquí puedes llamar una función para buscar el producto, etc.
        try {
          const response = await axios.put(`${API_URL}/api/products/highlight-product/${codigo}`) 
          console.log("🚀 ~ pedirCodigoProducto ~ response:", response)
          const data = response.data
          setProdsDestacados(prev => [...prev, data.productUpdated]);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            Swal.fire("No existe el producto con el código ingresado");
          }
          console.log("Error al querer destacar producto: ", err)
        }
      }
    };
    
    const agregarOCrear = () => {
        Swal.fire({
          text: 'Puedes agregar un producto existente o crear uno nuevo',
          showCancelButton: true,
          confirmButtonText: 'Agregar',
          confirmButtonColor: "#DC5F00",
          cancelButtonText: 'Crear nuevo',
          cancelButtonColor: "#61677A",
        }).then((result) => {
          if (result.isConfirmed) {
            // Lógica para agregar producto
            pedirCodigoProducto()
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Lógica para crear nuevo producto
            console.log("crear nuevo")
          }
        });
    };

    const handleNewProductFeat = async () => {
        agregarOCrear()
    } 

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_URL}/api/products/highlight/products`);
          setProdsDestacados(response.data.products); // Actualiza el estado con los productos
        } catch (err) {
          console.error("Error en la petición:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData()
    }, [])

    if (loading) return <p>Cargando productos...</p>;

    return(
        <>
        <div className="mt-6">
            <div className="grid justify-items-center gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-8">
                {
                  prodsDestacados.map(prod => <Product key={prod.codpro} data={prod} params={[prod.desc_rubro, prod.desc_subrub]} />)
                }

                {
                  isAdmin
                  ?
                  <div className="w-[85%] h-[65vh] mobile:h-[60vh] lg:w-[19em] xl:w-[22em] 2xl:w-[25em] 2xl:h-[55vh]
                        font-poppins border-2 border-gray text-gray rounded-xl relative my-3
                        flex justify-center items-center cursor-pointer"
                        onClick={handleNewProductFeat}>
                    <BsPlusSquare className="text-5xl" />
                  </div>
                  : <></>
                }

                
            </div>
        </div>
        </>
    )
}