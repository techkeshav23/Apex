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
    'https://images.unsplash.com/photo-1504198458649-3128b932f49e',
    'https://images.unsplash.com/photo-1505022610485-0249ba5b3675',
    'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd',
    'https://images.unsplash.com/photo-1512353087810-25dfcd100962',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908',
    // Accessories
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    'https://images.unsplash.com/photo-1509941943102-10c232535736',
    'https://images.unsplash.com/photo-1511556820780-d912e42b4980',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f',
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e',
    'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd',
    'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
    'https://images.unsplash.com/photo-1580906853203-f493cea99d83',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
    'https://images.unsplash.com/photo-1560769629-975e13f0c470',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990',
    'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
    'https://images.unsplash.com/photo-1609587312208-cea54be969e7',
    'https://images.unsplash.com/photo-1617114919297-3c8ddb01f599',
    'https://images.unsplash.com/photo-1594223274512-ad4803739b7c',
    'https://images.unsplash.com/photo-1559563458-527698bf5295',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d',
    'https://images.unsplash.com/photo-1620799140408-ed5341cd2431',
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
    'https://images.unsplash.com/photo-1564859228273-274232fdb516',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
    'https://images.unsplash.com/photo-1544441893-675973e31985',
    'https://images.unsplash.com/photo-1550614000-4b9519e02d48',
    'https://images.unsplash.com/photo-1562183241-b937e95585b6',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae',
    'https://images.unsplash.com/photo-1551488852-0801751ac194',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8',
    'https://images.unsplash.com/photo-1571513722275-4b41940f54b8',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2',
    'https://images.unsplash.com/photo-1550614000-4b9519e02d48',
    'https://images.unsplash.com/photo-1562183241-b937e95585b6',
    'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae',
    'https://images.unsplash.com/photo-1551488852-0801751ac194',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8',
    'https://images.unsplash.com/photo-1571513722275-4b41940f54b8',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2'
  ];

  // Use a simple hash of the product ID or name to consistently select an image
  const hashString = (str) => {
    let hash = 0;
    if (!str) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const identifier = product.sku || product.id || product.name || 'default';
  const index = hashString(identifier) % allImages.length;
  
  return allImages[index];
};
