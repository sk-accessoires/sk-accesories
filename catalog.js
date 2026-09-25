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
      images: ["6.jpeg", "2.jpeg", "7.jpeg"],
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
      id: "collier-emeraude",
      name: "Collier Émeraude",
      price: 35,
      priceLabel: "35 DT",
      material: "Acier inoxydable",
      mainImage: "4.jpeg",
      images: ["4.jpeg"],
      alt: "Collier en acier inoxydable avec motif vert émeraude",
      description:
        "Un collier en acier inoxydable orné d'un motif vert émeraude, élégant et raffiné.",
      collection: true,
    },
    {
      id: "collier-jardin-colore",
      name: "Collier Jardin Coloré",
      price: 25,
      priceLabel: "25 DT",
      material: "Acier inoxydable",
      mainImage: "9.jpeg",
      images: ["9.jpeg"],
      alt: "Collier doré à motifs roses et perles colorées en acier inoxydable",
      description:
        "Un collier en acier inoxydable ponctué de roses dorées et de perles colorées, pour une allure lumineuse et délicate.",
      collection: true,
    },
    {
      id: "perles-grande",
      name: "Perles pour bracelets - Grande taille",
      price: 6,
      priceLabel: "6 DT",
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
