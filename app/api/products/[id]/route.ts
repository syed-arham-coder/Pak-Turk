import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// PUT: /api/products/[id] - Update product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const formData = await req.formData()

    // Extract form fields
    const productData = {
      product_name: formData.get("product_name") as string,
      product_description: formData.get("product_description") as string,
      product_overview: (formData.get("product_overview") as string) || "",
      meta_title: (formData.get("meta_title") as string) || "",
      meta_keyword: (formData.get("meta_keyword") as string) || "",
      meta_description: (formData.get("meta_description") as string) || "",
      minimum_units: Number.parseInt(formData.get("minimum_units") as string) || 0,
      maximum_units: Number.parseInt(formData.get("maximum_units") as string) || 0,
      role: (formData.get("role") as string) || "Saler",
      product_unit: (formData.get("product_unit") as string) || "",
      min_order_quantity: Number.parseInt(formData.get("min_order_quantity") as string) || 0,
      model_number: (formData.get("model_number") as string) || "",
      brand_name: (formData.get("brand_name") as string) || "",
      hscode: (formData.get("hscode") as string) || "",
      port: (formData.get("port") as string) || "",
      shipping_option: (formData.get("shipping_option") as string) || "",
      production_capacity: (formData.get("production_capacity") as string) || "",
      brochure_url: (formData.get("brochure_url") as string) || "",
      warranty: (formData.get("warranty") as string) || "",
      iso_certified: formData.get("iso_certified") === "true" ? 1 : 0,
      out_of_stock: formData.get("out_of_stock") === "true" ? 1 : 0,
    }

    // Validate required fields
    if (!productData.product_name || !productData.product_description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: product_name, product_description",
        },
        { status: 400 },
      )
    }

    // Update product in database
    await query(
      `UPDATE products SET 
        product_name = ?, product_description = ?, product_overview = ?,
        meta_title = ?, meta_keyword = ?, meta_description = ?, 
        minimum_units = ?, maximum_units = ?, role = ?, 
        product_unit = ?, min_order_quantity = ?, model_number = ?, 
        brand_name = ?, hscode = ?, port = ?, shipping_option = ?, 
        production_capacity = ?, brochure_url = ?, warranty = ?, 
        iso_certified = ?, out_of_stock = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        productData.product_name,
        productData.product_description,
        productData.product_overview,
        productData.meta_title,
        productData.meta_keyword,
        productData.meta_description,
        productData.minimum_units,
        productData.maximum_units,
        productData.role,
        productData.product_unit,
        productData.min_order_quantity,
        productData.model_number,
        productData.brand_name,
        productData.hscode,
        productData.port,
        productData.shipping_option,
        productData.production_capacity,
        productData.brochure_url,
        productData.warranty,
        productData.iso_certified,
        productData.out_of_stock,
        productId,
      ],
    )

    // Update specifications
    const specificationsJson = formData.get("specifications") as string
    if (specificationsJson) {
      try {
        // Delete existing specifications
        await query(`DELETE FROM product_specifications WHERE product_id = ?`, [productId])

        // Insert new specifications
        const specifications = JSON.parse(specificationsJson)
        for (const spec of specifications) {
          if (spec.key && spec.value) {
            await query(`INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES (?, ?, ?)`, [
              productId,
              spec.key,
              spec.value,
            ])
          }
        }
      } catch (specError) {
        console.error("Error updating specifications:", specError)
      }
    }

    // Handle new image uploads
    const imageFiles = formData.getAll("images") as File[]
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i]
        if (imageFile && imageFile.size > 0) {
          const imageBuffer = Buffer.from(await imageFile.arrayBuffer())

          // Get current max display order
          const maxOrderResult = (await query(
            `SELECT COALESCE(MAX(display_order), -1) as max_order FROM product_images WHERE product_id = ?`,
            [productId],
          )) as any[]

          const nextOrder = (maxOrderResult[0]?.max_order || -1) + 1

          await query(
            `INSERT INTO product_images (product_id, image_data, image_name, image_type, image_size, is_primary, display_order) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              imageBuffer,
              imageFile.name,
              imageFile.type,
              imageFile.size,
              0, 
              nextOrder,
            ],
          )
        }
      }
    }

    const image360File = formData.get("image_360") as File
    if (image360File && image360File.size > 0) {
      const image360Buffer = Buffer.from(await image360File.arrayBuffer())
      await query(`UPDATE products SET image_360 = ? WHERE id = ?`, [image360Buffer, productId])
    }

    const videoFile = formData.get("video") as File
    if (videoFile && videoFile.size > 0) {
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
      await query(`UPDATE products SET video = ? WHERE id = ?`, [videoBuffer, productId])
    }

    const brochureFile = formData.get("brochure") as File
    if (brochureFile && brochureFile.size > 0) {
      const brochureBuffer = Buffer.from(await brochureFile.arrayBuffer())
      await query(`UPDATE products SET brochure = ? WHERE id = ?`, [brochureBuffer, productId])
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    })
  } catch (err: any) {
    console.error("Error in PUT /api/products/[id]:", err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update product",
      },
      { status: 500 },
    )
  }
}

// DELETE: /api/products/[id] - Delete product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Delete product specifications first (foreign key constraint)
    await query(`DELETE FROM product_specifications WHERE product_id = ?`, [productId])

    // Delete product images
    await query(`DELETE FROM product_images WHERE product_id = ?`, [productId])

    // Delete the product
    const result = await query(`DELETE FROM products WHERE id = ?`, [productId])

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (err: any) {
    console.error("Error in DELETE /api/products/[id]:", err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to delete product",
      },
      { status: 500 },
    )
  }
}
