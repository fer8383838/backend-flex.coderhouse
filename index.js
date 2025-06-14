// =====================================
// PASO 1: Importamos los módulos necesarios
// =====================================

const express = require("express")
// Framework para crear el servidor y manejar rutas

const fs = require("fs")
// Módulo para trabajar con archivos (leer y escribir)

const path = require("path")
// Módulo para construir rutas de archivos compatibles con cualquier sistema



// =====================================
// PASO 2: Inicializamos la app de Express
// =====================================

const app = express()
// Creamos una aplicación Express

app.use(express.json())
// Permite que la app acepte JSON en el cuerpo de las peticiones (body)



// =====================================
// PASO 3: Definimos las rutas de los archivos JSON
// =====================================

const productsFile = path.join(__dirname, "./products.json")
// Ruta al archivo de productos

const cartsFile = path.join(__dirname, "./carts.json")
// Ruta al archivo de carritos



// =====================================
// PASO 4: Función para leer contenido desde un archivo JSON
// =====================================

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return []
  // Si el archivo no existe, devolvemos un array vacío

  const data = fs.readFileSync(filePath, "utf-8")
  // Leemos el contenido del archivo como texto

  return JSON.parse(data || "[]")
  // Parseamos el texto JSON a objeto JS
}



// =====================================
// PASO 5: Función para escribir contenido a un archivo JSON
// =====================================

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  // Escribimos el objeto como texto con formato legible
}



// =====================================
// RUTAS DE PRODUCTOS
// =====================================

// GET /api/products → Listar todos los productos
app.get("/api/products", (req, res) => {
  const products = readJSON(productsFile)
  // Leemos todos los productos desde el archivo

  res.json(products)
  // Devolvemos la lista completa
})



// GET /api/products/:pid → Obtener un producto por su ID
app.get("/api/products/:pid", (req, res) => {
  const { pid } = req.params
  // Obtenemos el ID de la URL

  const products = readJSON(productsFile)
  const product = products.find(p => p.id == pid)
  // Buscamos el producto con el ID indicado

  if (!product) return res.status(404).json({ error: "Producto no encontrado" })
  // Si no se encuentra, devolvemos error

  res.json(product)
  // Devolvemos el producto encontrado
})



// POST /api/products → Crear un nuevo producto
app.post("/api/products", (req, res) => {
  const products = readJSON(productsFile)
  // Cargamos los productos actuales desde archivo

  const { title, description, code, price, status, stock, category, thumbnails } = req.body
  // Obtenemos los campos del cuerpo del request

  const newID = products.length > 0 ? products[products.length - 1].id + 1 : 1
  // Generamos un ID secuencial: último ID + 1, o 1 si es el primero

  const newProduct = {
    id: newID,
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails
  }
  // Creamos el nuevo producto con los campos y el ID generado

  products.push(newProduct)
  // Lo agregamos al array de productos

  writeJSON(productsFile, products)
  // Guardamos el nuevo array al archivo

  res.status(201).json(newProduct)
  // Devolvemos el producto creado
})



// PUT /api/products/:pid → Actualizar un producto
app.put("/api/products/:pid", (req, res) => {
  const { pid } = req.params
  const products = readJSON(productsFile)

  const index = products.findIndex(p => p.id == pid)
  // Buscamos el índice del producto a actualizar

  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" })
  // Si no existe, devolvemos error

  const updatedProduct = { ...products[index], ...req.body, id: products[index].id }
  // Mezclamos datos actuales con nuevos, pero mantenemos el mismo ID

  products[index] = updatedProduct
  writeJSON(productsFile, products)

  res.json(updatedProduct)
  // Respondemos con el producto actualizado
})



// DELETE /api/products/:pid → Eliminar un producto
app.delete("/api/products/:pid", (req, res) => {
  const { pid } = req.params
  const products = readJSON(productsFile)

  const index = products.findIndex(p => p.id == pid)
  // Buscamos el índice del producto por ID

  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" })
  // Si no existe, devolvemos error

  products.splice(index, 1)
  // Eliminamos el producto del array

  writeJSON(productsFile, products)
  res.json({ mensaje: "Producto eliminado" })
})



// =====================================
// RUTAS DE CARRITOS
// =====================================

// POST /api/carts → Crear un nuevo carrito vacío
app.post("/api/carts", (req, res) => {
  const carts = readJSON(cartsFile)
  // Leemos el archivo actual de carritos

  const newID = carts.length > 0 ? parseInt(carts[carts.length - 1].id) + 1 : 1
  // Generamos un nuevo ID secuencial (como string)

  const newCart = {
    id: newID.toString(),
    products: []
  }
  // Creamos un nuevo carrito vacío

  carts.push(newCart)
  writeJSON(cartsFile, carts)

  res.status(201).json(newCart)
})



// GET /api/carts/:cid → Obtener productos de un carrito
app.get("/api/carts/:cid", (req, res) => {
  const { cid } = req.params
  const carts = readJSON(cartsFile)

  const cart = carts.find(c => c.id == cid)
  // Buscamos el carrito con el ID

  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" })

  res.json(cart.products)
  // Devolvemos la lista de productos del carrito
})



// POST /api/carts/:cid/product/:pid → Agregar un producto al carrito
app.post("/api/carts/:cid/product/:pid", (req, res) => {
  const { cid, pid } = req.params
  const carts = readJSON(cartsFile)

  const cart = carts.find(c => c.id == cid)
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" })

  const existing = cart.products.find(p => p.product == pid)
  // Verificamos si el producto ya está en el carrito

  if (existing) {
    existing.quantity += 1
    // Si ya existe, aumentamos la cantidad
  } else {
    cart.products.push({ product: pid, quantity: 1 })
    // Si no existe, lo agregamos
  }

  writeJSON(cartsFile, carts)
  res.json(cart)
})



// =====================================
// INICIAR EL SERVIDOR EN EL PUERTO 3000
// =====================================

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})