import ProductDetailView from "@/components/products/product-detail";
import { getProductBySlug } from "@/lib/queries/product-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetailView product={product} />;
}
