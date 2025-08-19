interface ProductPageProps {
  params: {
    productId: string;
  };
}

export default function DynamicProductPage({ params }: ProductPageProps) {
  const { productId } = params;

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-16 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
        Product Details for: {productId}
      </h1>
      <p className="text-base sm:text-lg text-gray-600">
        This page would display detailed information about the product.
      </p>

      {/* Example: Product details section */}
      <section className="mt-8 flex flex-col md:flex-row gap-6">
        {/* Placeholder image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-lg bg-gray-100">
            {/* Replace with your actual Image component */}
            <img
              src="/placeholder-product.png"
              alt={`Product ${productId}`}
              className="object-contain w-full h-full rounded-lg"
            />
          </div>
        </div>

        {/* Product info */}
        <div className="w-full md:w-1/2">
          <p className="text-gray-700 mb-4">
            Here you can add detailed information about the product. On mobile, this text will stack below the image, and on desktop, it will remain side-by-side.
          </p>
          <button className="bg-[#7856BF] text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors">
            Get Yours Today
          </button>
        </div>
      </section>
    </div>
  );
}
