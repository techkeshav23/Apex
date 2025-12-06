// Shared utility for generating product images
export const getProductImage = (product) => {
  // Create a large pool of unique fashion images - 50+ unique URLs
  const allImages = [
    // Ethnic/Indian Wear
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c',
    'https://images.unsplash.com/photo-1583391733975-5e3e1e9bb8ba',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80',
    'https://images.unsplash.com/photo-1583391265775-4efc1d0ac1f5',
    'https://images.unsplash.com/photo-1605763240000-39926870a050',
    // Western Wear
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b',
    'https://images.unsplash.com/photo-1558769132-cb1aea588c87',
    // Dresses
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
    // Men's Fashion
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2',
    'https://images.unsplash.com/photo-1617137968427-85924c800a22',
    'https://images.unsplash.com/photo-1564859228273-274232fdb516',
    'https://images.unsplash.com/photo-1594938291221-94f18cbb5660',
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc',
    // Shirts
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10',
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e',
    // Jeans/Denim
    'https://images.unsplash.com/photo-1542272604-787c3835535d',
    'https://images.unsplash.com/photo-1475178626620-a4d074967452',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c',
    'https://images.unsplash.com/photo-1598522325074-042db73aa4e6',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4',
    // Kids Wear
    'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2',
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea',
    'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8',
    'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6',
    'https://images.unsplash.com/photo-1520423465871-0dd8f86f01ba',
    // Jackets/Outerwear
    'https://images.unsplash.com/photo-1551028719-00167b16eac5',
    'https://images.unsplash.com/photo-1578932750294-f5075e85f44a',
    'https://images.unsplash.com/photo-1544923246-77f81e32fc9b',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e',
    'https://images.unsplash.com/photo-1548126032-79d935d76a1b',
    // More Fashion
    'https://images.unsplash.com/photo-1445205170230-053b83016050',
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
    'https://images.unsplash.com/photo-1596783074918-c84cb06531ca',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1',
    'https://images.unsplash.com/photo-1598808503491-a42b3ac382e8'
  ];

  // Use product SKU hash to get unique index
  const sku = product.sku || product.id || '';
  let hash = 0;
  for (let i = 0; i < sku.length; i++) {
    hash = ((hash << 5) - hash) + sku.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % allImages.length;
  
  // Add Unsplash parameters for proper sizing
  return `${allImages[index]}?w=400&h=500&fit=crop&auto=format`;
};
