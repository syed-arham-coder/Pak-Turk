import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

// GET: /api/products - Fetch all products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get("company_id")

    let sql = `
      SELECT 
        p.*,
        c.name as company_name,
        CASE p.category_id
          WHEN 1 THEN 'Agriculture'
          WHEN 2 THEN 'Agriculture Technology'
          WHEN 3 THEN 'Arts'
          WHEN 4 THEN 'Aviation'
          WHEN 5 THEN 'Banking'
          WHEN 6 THEN 'Construction'
          WHEN 7 THEN 'Ecommerce'
          WHEN 8 THEN 'Educational Services'
          WHEN 9 THEN 'Energy'
          WHEN 10 THEN 'Finance'
          WHEN 11 THEN 'Healthcare'
          WHEN 12 THEN 'Information Technology'
          WHEN 13 THEN 'Logistics & Transport'
          WHEN 14 THEN 'Manufacturing'
          WHEN 15 THEN 'Mining'
          WHEN 16 THEN 'Pharmaceuticals'
          WHEN 17 THEN 'Public Services'
          WHEN 18 THEN 'Real Estate'
          WHEN 19 THEN 'Retail Trade'
          WHEN 20 THEN 'Utilities'
          WHEN 21 THEN 'Media & News'
          WHEN 22 THEN 'Telecommunication'
          WHEN 23 THEN 'Tourism'
          WHEN 24 THEN 'Hospitality'
          WHEN 25 THEN 'Food & Beverage'
          WHEN 26 THEN 'Entertainment'
          WHEN 27 THEN 'Fashion'
          WHEN 28 THEN 'BPO'
          ELSE 'Other'
        END as category_name,
        GROUP_CONCAT(CONCAT(ps.spec_key, ':', ps.spec_value) SEPARATOR '|') as specifications
      FROM products p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN product_specifications ps ON p.id = ps.product_id
    `

    const params: any[] = []

    if (companyId) {
      sql += ` WHERE p.company_id = ?`
      params.push(companyId)
    }

    sql += ` GROUP BY p.id ORDER BY p.created_at DESC`

    const products = (await query(sql, params)) as any[]

    // Fetch images for all products
    const productIds = products.map((p) => p.id)
    let images: any[] = []

    if (productIds.length > 0) {
      const placeholders = productIds.map(() => "?").join(",")
      const imagesSql = `
        SELECT product_id, image_data, is_primary, display_order, image_name, image_type
        FROM product_images 
        WHERE product_id IN (${placeholders})
        ORDER BY product_id, is_primary DESC, display_order ASC
      `
      console.log("Fetching images with SQL:", imagesSql, "for product IDs:", productIds)
      images = (await query(imagesSql, productIds)) as any[]
      console.log("Found images:", images.length)
    }

    // Process the results to format specifications and handle images
    const formattedProducts = products.map((product) => {
      const productImages = images
        .filter((img: any) => img.product_id === product.id)
        .map((img: any) => ({
          data: img.image_data
            ? `data:${img.image_type || "image/jpeg"};base64,${Buffer.from(img.image_data).toString("base64")}`
            : null,
          isPrimary: img.is_primary === 1,
          displayOrder: img.display_order || 0,
          name: img.image_name,
        }))
        .filter((img) => img.data !== null) // Filter out null images

      console.log(`Product ${product.id} has ${productImages.length} images`)

      // Handle video data - simplified approach for better compatibility
      let videoData = null
      if (product.video) {
        try {
          videoData = `data:video/mp4;base64,${Buffer.from(product.video).toString("base64")}`
          console.log(`Product ${product.id} has video data`)
        } catch (error) {
          console.error(`Error processing video for product ${product.id}:`, error)
        }
      }

      return {
        ...product,
        specifications: product.specifications
          ? product.specifications.split("|").map((spec: string) => {
              const [key, value] = spec.split(":")
              return { key, value }
            })
          : [],
        images: productImages,
        // Keep the primary image for backward compatibility
        image: productImages.find((img) => img.isPrimary)?.data || productImages[0]?.data || null,
        // Use processed video data
        video: videoData,
      }
    })

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    })
  } catch (err: any) {
    console.error("Error in GET /api/products:", err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch products",
      },
      { status: 500 },
    )
  }
}

// POST: /api/products - Create new product
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    // Extract form fields (keep existing code)
    const productData = {
      company_id: formData.get("company_id") as string,
      product_name: formData.get("product_name") as string,
      category_id: (formData.get("category_id") as string) || "1",
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
      iso_certified: formData.get("iso_certified") === "true" ? 1 : null,
      out_of_stock: formData.get("out_of_stock") === "true" ? 1 : null,
    }

    // Validate required fields
    if (!productData.company_id || !productData.product_name || !productData.product_description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: company_id, product_name, product_description",
        },
        { status: 400 },
      )
    }

    // Insert product into database (keep existing code)
    const result = (await query(
      `INSERT INTO products (
        company_id, product_name, category_id, product_description, product_overview,
        meta_title, meta_keyword, meta_description, minimum_units, maximum_units,
        role, product_unit, min_order_quantity, model_number, brand_name,
        hscode, port, shipping_option, production_capacity, brochure_url, warranty,
        iso_certified, out_of_stock, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        productData.company_id,
        productData.product_name,
        productData.category_id,
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
      ],
    )) as any

    const productId = result.insertId

    // Handle specifications (keep existing code)
    const specificationsJson = formData.get("specifications") as string
    if (specificationsJson) {
      try {
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
        console.error("Error parsing specifications:", specError)
      }
    }

    // Handle multiple image uploads
    const imageFiles = formData.getAll("images") as File[]
    if (imageFiles && imageFiles.length > 0) {
      console.log(`Uploading ${imageFiles.length} images for product ${productId}`)
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i]
        if (imageFile && imageFile.size > 0) {
          const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
          console.log(`Inserting image ${i + 1}: ${imageFile.name}, size: ${imageFile.size}, type: ${imageFile.type}`)
          await query(
            `INSERT INTO product_images (product_id, image_data, image_name, image_type, image_size, is_primary, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              imageBuffer,
              imageFile.name,
              imageFile.type,
              imageFile.size,
              i === 0 ? 1 : 0, // First image is primary
              i, // Display order
            ],
          )
        }
      }
    }

    // Handle other file uploads (keep existing code for 360, video, brochure)
    const image360File = formData.get("image_360") as File
    if (image360File && image360File.size > 0) {
      const image360Buffer = Buffer.from(await image360File.arrayBuffer())
      await query(`UPDATE products SET image_360 = ? WHERE id = ?`, [image360Buffer, productId])
    }

    const videoFile = formData.get("video") as File
    if (videoFile && videoFile.size > 0) {
      console.log(`Uploading video: ${videoFile.name}, size: ${videoFile.size}, type: ${videoFile.type}`)
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
      productId,
      message: "Product created successfully",
    })
  } catch (err: any) {
    console.error("Error in POST /api/products:", err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create product",
      },
      { status: 500 },
    )
  }
}

// PUT: /api/products - Update existing product
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData()
    const productId = formData.get("product_id") as string

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

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
      iso_certified: formData.get("iso_certified") === "true" ? 1 : null,
      out_of_stock: formData.get("out_of_stock") === "true" ? 1 : null,
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

    // Handle multiple image uploads for updates
    const imageFiles = formData.getAll("images") as File[]
    if (imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0) {
      console.log(`Updating with ${imageFiles.length} new images for product ${productId}`)

      // Delete existing images
      await query(`DELETE FROM product_images WHERE product_id = ?`, [productId])

      // Insert new images
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i]
        if (imageFile && imageFile.size > 0) {
          const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
          await query(
            `INSERT INTO product_images (product_id, image_data, image_name, image_type, image_size, is_primary, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              imageBuffer,
              imageFile.name,
              imageFile.type,
              imageFile.size,
              i === 0 ? 1 : 0, // First image is primary
              i, // Display order
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
      console.log(`Updating video: ${videoFile.name}, size: ${videoFile.size}, type: ${videoFile.type}`)
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
    console.error("Error in PUT /api/products:", err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update product",
      },
      { status: 500 },
    )
  }
}

// DELETE: /api/products - Delete product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("id")

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    console.log(`Deleting product with ID: ${productId}`)

    // First delete product specifications (foreign key constraint)
    await query(`DELETE FROM product_specifications WHERE product_id = ?`, [productId])
    console.log(`Deleted specifications for product ${productId}`)

    // Delete product images
    await query(`DELETE FROM product_images WHERE product_id = ?`, [productId])
    console.log(`Deleted images for product ${productId}`)

    // Delete the product
    const result = await query(`DELETE FROM products WHERE id = ?`, [productId])
    console.log(`Delete product result:`, result)

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (err: any) {
    console.error("Error in DELETE /api/products:", err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to delete product",
      },
      { status: 500 },
    )
  }
}
