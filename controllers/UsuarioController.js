const { pool } = require('../config/mysql')
const { encriptar, comparar } = require('../helper/password')

const getUsers = async (req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM view_usuarios_gestor;')
        console.table(result)

        return res.status(200).json({
            status : "success",
            mensaje: "Listado de usuarios",
            usuarios: result
        })
    } catch (error) {
        console.error('Error la ejecutar la consulta', error)
    }
}

const saveUser = async (req, res) => {
    try {
        
       const { type_document, document, last_name, name, pass, date, adress, genero} = req.body
       
       const [rows] = await pool.query('CALL spBuscarUsuarioPorDocumento(?)', [document])
        console.log(rows[0].length) //Numero de registro
        if(rows[0].length > 0){
            return res.status(400).json(
                {
                status: 'error',
                mensaje: 'Ya existe el usuario'
                }
            )
        }
       
       
       const p = await encriptar(pass) 
       
       const result = await pool.query('CALL spRegistrarUsuario(?,?,?,?,?,?,?,?)',[type_document, document, last_name, name, p, date, adress, genero]) 
       
       console.log(result)

        return res.status(201).json({
            status : 'Success',
            mensagge: 'Usuario registrado con éxito'
       })
    } catch (error) {
        console.error('Error la ejecutar la consulta', error)
    }
}

const updateUser = async (req, res) => {
    try {
        const { id, type_document, document, last_name, name, pass, date, adress, gender } = req.body
        console.log(id, type_document, document, last_name, name, pass, date, adress, gender)
        const result = await pool.query('CALL spActualizarUsuario(?,?,?,?,?,?,?,?,?)',[id, type_document, document, last_name, name, pass, date, adress, gender])
        
        if( result[0].affectedRows === 0){ //En caso que no exista el ID
            return res.status(400).json(
                {
                    status: 'error',
                    mensaje: 'No existe el registro'
                }
            )
        }

        return res.status(201).json({
            status : 'Success',
            mensagge: 'Los dato del usuario fueron actualizado con éxito'
       })

    } catch (error) {
        console.error('Error la ejecutar la consulta', error)
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.body
        console.log(id)
        const result = await pool.query('CALL spEliminarUsuario(?)', [id])
        
        if(result[0].affectedRows === 0){
            return res.status(404).json({
                status: "Error",
                mensaje: "No existe el registro"
            })
        }

        return res.status(204).json({
            status: "success",
            mensaje: "Registro eliminado"
        })

    } catch (error) {
        console.error('Error la ejecutar la consulta', error)
    }
}

const loginUser = async (req , res) => {
    try {
        const {document, password} = req.body
        
        console.log(document, password)

        const [rows] = await pool.query('CALL spValidarUsuario(?)',[document])
        console.table(rows[0].length) //Muestrar los registros encontrados

        if(rows[0].length === 0){ //Si no encuentra el registro
           return res.status(404).json({
                status: "Error",
                mensaje: "Usuario no encontrado"
            })
        }

        const user = rows[0]
        console.log(user[0].nro_documento)
        console.log(user[0].pass_word)

       const validar = await comparar(password, user[0].pass_word)
       console.log(validar)

        return res.status(200).json({ //Cuando encuentra el registro
            status: 'success',
            message: 'Login exitoso'
        });

    } catch (error) {
        console.error('Error la ejecutar la consulta', error)
    }
}

module.exports = { saveUser, getUsers, updateUser, deleteUser, loginUser }