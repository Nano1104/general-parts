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
      const { value: formValues } = await Swal.fire({
        title: 'Destacar producto',
        html:
          '<input id="swal-input1" class="swal2-input" placeholder="Código del producto" required>' +
          '<input id="swal-input2" class="swal2-input" placeholder="Días a destacar" type="number" min="1" required>',
        focusConfirm: false,
        confirmButtonColor: "#DC5F00",
        showCancelButton: true,
        preConfirm: () => {
          const codigo = document.getElementById('swal-input1').value;
          const dias = document.getElementById('swal-input2').value;
          
          if (!codigo.trim() || !dias.trim()) {
            Swal.showValidationMessage('Ambos campos son obligatorios');
            return false;
          }
          
          if (isNaN(dias) || parseInt(dias) <= 0) {
            Swal.showValidationMessage('Los días deben ser un número positivo');
            return false;
          }
          
          return [codigo, parseInt(dias)];
        },
        allowOutsideClick: () => !Swal.isLoading()
      });
    
      if (formValues) {         //manejo de repuestas en el front, realizacion de la solicitud
        const [codigo, dias] = formValues;
                
        try {
          const response = await axios.put(`${API_URL}/api/products/highlight-product/${codigo}`, { days: dias });
          const data = response.data
          console.log("🚀 ~ pedirCodigoProducto ~ response:", response)

          setProdsDestacados(prev => [...prev, data.product]);     //agrega el producto destacdo a la lista de destacados para ser renderizado
          Swal.fire({ text: `Producto destcado por ${dias} días`, icon: "success", confirmButtonColor: "#DC5F00" });

        } catch (err) {
          if (err.response?.status === 404) {     //En caso de que no exista el producto con el codigo ingresado
            Swal.fire({ text: "No existe el producto con el código ingresado", icon: "info", confirmButtonColor: "#DC5F00" });
          } 
          else if (err.response?.status === 409) {    //En caso de que ya se encuentre destacado
            Swal.fire({ text: "El producto ya se encuentra destacado", icon: "info", confirmButtonColor: "#DC5F00" });
          }
          else {
            console.error("Error al destacar producto:", err);
            Swal.fire("Error", "Ocurrió un error al procesar la solicitud", "error");
          }
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
                  prodsDestacados && prodsDestacados.length > 0
                    ? prodsDestacados.map(prod => (
                        <Product key={prod.codpro} data={prod} params={[prod.desc_rubro, prod.desc_subrub]} />
                      ))
                    : <span className="col-span-full italic text-2xl px-4 py-2 text-gray">No hay productos destacados</span>
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