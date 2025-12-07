// Shared utility for generating product images
export const getProductImage = (product) => {
  // Use the image_url from the product if available
  if (product && product.image_url) {
    return product.image_url;
  }
  
  // Fallback: generate placeholder based on product name
  const productName = product?.name || 'Product';
  const encodedName = encodeURIComponent(productName);
  
  // Generate a color based on product SKU for variety
  const colors = [
    'FF69B4', '9370DB', '4169E1', 'FF6347', '32CD32', 
    'FFD700', 'FF8C00', '8B4513', '000080', '2F4F4F'
  ];
  
  const sku = product?.sku || product?.id || '';
  let hash = 0;
  for (let i = 0; i < sku.length; i++) {
    hash = ((hash << 5) - hash) + sku.charCodeAt(i);
    hash = hash & hash;
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const bgColor = colors[colorIndex];
  
  return `https://via.placeholder.com/400x500/${bgColor}/FFFFFF?text=${encodedName}`;
};

