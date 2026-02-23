const prisma = require("../utils/prisma");

const Producto = {
  // List all products
  all: async function (filters = {}) {
    try {
      const where = {};
      if (filters.activo !== undefined) where.activo = filters.activo;
      if (filters.categoria) where.categoria = { contains: filters.categoria, mode: "insensitive" };
      if (filters.search) {
        where.OR = [
          { nombre: { contains: filters.search, mode: "insensitive" } },
          { descripcion: { contains: filters.search, mode: "insensitive" } },
          { categoria: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      return await prisma.productos.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit || 100,
        skip: filters.skip || 0,
      });
    } catch (error) {
      console.error("FAILED TO FETCH PRODUCTOS.", error.message);
      throw error;
    }
  },

  // Get product by ID
  get: async function (id) {
    try {
      return await prisma.productos.findUnique({ where: { id } });
    } catch (error) {
      console.error("FAILED TO FETCH PRODUCTO.", error.message);
      return null;
    }
  },

  // Create product
  create: async function ({ nombre, descripcion, precio, categoria }) {
    try {
      const producto = await prisma.productos.create({
        data: {
          nombre: String(nombre).trim(),
          descripcion: descripcion || null,
          precio: precio ? parseFloat(precio) : null,
          categoria: categoria || null,
        },
      });
      return { producto, error: null };
    } catch (error) {
      console.error("FAILED TO CREATE PRODUCTO.", error.message);
      return { producto: null, error: error.message };
    }
  },

  // Update product
  update: async function (id, updates) {
    try {
      const data = {};
      if (updates.nombre !== undefined) data.nombre = String(updates.nombre).trim();
      if (updates.descripcion !== undefined) data.descripcion = updates.descripcion;
      if (updates.precio !== undefined) data.precio = updates.precio ? parseFloat(updates.precio) : null;
      if (updates.categoria !== undefined) data.categoria = updates.categoria;
      if (updates.activo !== undefined) data.activo = Boolean(updates.activo);

      const producto = await prisma.productos.update({
        where: { id },
        data,
      });
      return { producto, error: null };
    } catch (error) {
      console.error("FAILED TO UPDATE PRODUCTO.", error.message);
      return { producto: null, error: error.message };
    }
  },

  // Delete product (soft delete)
  deactivate: async function (id) {
    try {
      await prisma.productos.update({
        where: { id },
        data: { activo: false },
      });
      return true;
    } catch (error) {
      console.error("FAILED TO DEACTIVATE PRODUCTO.", error.message);
      return false;
    }
  },

  // Categories list
  categories: async function () {
    try {
      const results = await prisma.productos.groupBy({
        by: ["categoria"],
        _count: { id: true },
        where: { activo: true },
      });
      return results.map((r) => ({
        categoria: r.categoria || "Sin categoría",
        count: r._count.id,
      }));
    } catch (error) {
      return [];
    }
  },
};

module.exports = { Producto };

