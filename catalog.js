(function initCatalog(root) {
  const catalog = [
    {
      id: "cristal-aura",
      name: "Cristal Aura",
      price: 20,
      priceLabel: "20 DT",
      material: "Acier inoxydable",
      mainImage: "8.jpg",
      images: ["8.jpg", "1.jpeg", "3.jpeg"],
      alt: "Pendentifs cristal colorés SK Accessoires",
      description:
        "Un pendentif cristal lumineux en acier inoxydable, proposé en nuances délicates pour apporter une touche d'éclat au quotidien.",
      collection: true,
    },
    {
      id: "bracelet-horloge",
      name: "Bracelet Horloge",
      price: 30,
      priceLabel: "30 DT",
      material: "Acier inoxydable",
      mainImage: "6.jpeg",
      images: ["6.jpeg", "2.jpeg"],
      alt: "Bracelet Horloge en acier inoxydable",
      description:
        "Un bracelet horloge en acier inoxydable, élégant et délicat, pensé comme un bijou à porter au quotidien.",
      collection: true,
    },
    {
      id: "bracelet-roses",
      name: "Bracelet Roses Dorées",
      price: 15,
      priceLabel: "15 DT",
      material: "Acier inoxydable",
      mainImage: "5.jpeg",
      images: ["5.jpeg"],
      alt: "Bracelet doré avec roses et perles colorées",
      description:
        "Un bracelet en acier inoxydable, féminin et coloré, rythmé par de fines roses et des touches lumineuses.",
      collection: true,
    },
    {
      id: "bracelet-emeraude",
      name: "Bracelet Émeraude",
      price: 35,
      priceLabel: "35 DT",
      material: "Acier inoxydable",
      mainImage: "4.jpeg",
      images: ["4.jpeg"],
      alt: "Bracelet en acier inoxydable avec motif vert émeraude",
      description:
        "Un bracelet en acier inoxydable orné d'un motif vert émeraude, pour une touche élégante et raffinée.",
      collection: true,
    },
    {
      id: "perles-grande",
      name: "Perles pour bracelets - Grande taille",
      price: 5,
      priceLabel: "5 DT",
      material: "Acier inoxydable",
      mainImage: "perle/1.jpeg",
      images: ["perle/1.jpeg"],
      alt: "Bracelets de perles SK Accessoires",
      description: "Perles pour bracelets en acier inoxydable SK Accessoires.",
      collection: false,
    },
    {
      id: "perles-moyenne",
      name: "Perles pour bracelets - Taille moyenne",
      price: 5,
      priceLabel: "5 DT",
      material: "Acier inoxydable",
      mainImage: "perle/1.jpeg",
      images: ["perle/1.jpeg"],
      alt: "Bracelets de perles SK Accessoires",
      description: "Perles pour bracelets en acier inoxydable SK Accessoires.",
      collection: false,
    },
    {
      id: "perles-petite",
      name: "Perles pour bracelets - Petite taille",
      price: 4,
      priceLabel: "4 DT",
      material: "Acier inoxydable",
      mainImage: "perle/1.jpeg",
      images: ["perle/1.jpeg"],
      alt: "Bracelets de perles SK Accessoires",
      description: "Perles pour bracelets en acier inoxydable SK Accessoires.",
      collection: false,
    },
  ];

  if (typeof module !== "undefined" && module.exports) {
    module.exports = catalog;
  }
  if (root) {
    root.SK_CATALOG = catalog;
  }
})(typeof window !== "undefined" ? window : null);
