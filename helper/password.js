const bcrypt = require('bcryptjs')

const encriptar = async (textoPlanPass) => {
   
    return await bcrypt.hash(textoPlanPass,10)

}

const comparar = async (textoPlanPass, hashPass) => {
    return await bcrypt.compare(textoPlanPass, hashPass)
}

module.exports = { encriptar , comparar }


