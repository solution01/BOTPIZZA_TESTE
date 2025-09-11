const pizzasSalgadas = [
  {
    title: 'Calabresa R$ 45,00',
    description: 'Calabresa, cebola e mussarela',
    img: 'https://i.ibb.co/SDVQCS5J/calabresa.png',
    rowId: 'sabor calabresa',
    frase: 'A clássica que nunca decepciona!',
    preco: 45.0,
    tipoPizza: 'salgada',
  },
  {
    title: 'Frango com Catupiry R$ 47,00',
    description: 'Frango desfiado com catupiry',
    img: 'https://i.ibb.co/RT8f1BRj/blog-receita-frango-catupiry.jpg',
    rowId: 'sabor frango',
    frase: 'Cremosa e irresistível!',
    preco: 47.0,
    tipoPizza: 'salgada',
  },
  {
    title: 'Portuguesa R$ 49,00',
    description: 'Presunto, ovo, cebola e azeitona',
    img: 'https://i.ibb.co/rKf9jX0V/portuguesa.jpg',
    rowId: 'sabor portuguesa',
    frase: 'Uma explosão de sabores tradicionais!',
    preco: 49.0,
    tipoPizza: 'salgada',
  },
];

const pizzasDoces = [
  {
    title: 'Chocolate com Morango R$ 52,00',
    description: 'Chocolate ao leite e morango',
    img: 'https://i.ibb.co/cSqjQqhm/chocolatemorango.webp',
    rowId: 'sabor chocolatemorango',
    frase: 'A união perfeita do doce com o azedinho do morango!',
    preco: 52.0,
    tipoPizza: 'doce',
  },
  {
    title: 'Prestígio R$ 50,00',
    description: 'Chocolate e coco',
    img: 'https://i.ibb.co/JRxG3fY4/prestigio.jpg',
    rowId: 'sabor prestigio',
    frase: 'Para quem ama coco e chocolate juntos!',
    preco: 50.0,
    tipoPizza: 'doce',
  },
];

const bebidas = [
  {
    title: 'Refrigerante 2L Coca-Cola R$ 10,00',
    description: 'Refrigerante 2L Coca-Cola',
    img: 'https://i.ibb.co/xS0fPWfV/coca.png',
    rowId: 'bebida refri2l coca',
    frase: 'Clássica e gelada para acompanhar sua pizza!',
    preco: 10.0,
  },
  {
    title: 'Refrigerante 2L Pepsi R$ 9,50',
    description: 'Refrigerante 2L Pepsi',
    img: 'https://i.ibb.co/0RYQwf3G/pepsi.webp',
    rowId: 'bebida refri2l Pepsi',
    frase: 'Refrescância garantida!',
    preco: 9.5,
  },
  {
    title: 'Refrigerante 2L Guaraná Antártica R$ 9,00',
    description: 'Refrigerante 2L Guaraná Antártica',
    img: 'https://i.ibb.co/GvpsDfXp/guarana.jpg',
    rowId: 'bebida refri2l Guaraná Antártica',
    frase: 'O sabor brasileiro que não pode faltar!',
    preco: 9.0,
  },
  {
    title: 'Suco Natural Laranja R$ 8,00',
    description: 'Laranja, Uva, Maracujá',
    img: 'https://i.ibb.co/s9bSw0nZ/sucolaranja.webp',
    rowId: 'bebida suco laranja',
    frase: 'Natural e cheio de vitamina C!',
    preco: 8.0,
  },
  {
    title: 'Suco Natural Uva R$ 8,00',
    description: 'Laranja, Uva, Maracujá',
    img: 'https://i.ibb.co/xych8st/sucouva.webp',
    rowId: 'bebida suco uva',
    frase: 'O sabor da uva direto para sua mesa!',
    preco: 8.0,
  },
  {
    title: 'Suco Natural Maracujá R$ 8,00',
    description: 'Laranja, Uva, Maracujá',
    img: 'https://i.ibb.co/9mkXHDQ3/sucomaracuja.webp',
    rowId: 'bebida suco maracuja',
    frase: 'Refrescante e levemente azedinho!',
    preco: 8.0,
  },
  {
    title: 'Não quero bebida',
    description: 'Sem bebida',
    img: 'https://i.ibb.co/zWmMVrb0/sem-bebida.png',
    rowId: 'bebida nenhum',
    frase: 'Prefere sem bebida? Sem problemas!',
    preco: 0.0,
  },
];

const allPizzas = [...pizzasSalgadas, ...pizzasDoces];

module.exports = {
  pizzasSalgadas,
  pizzasDoces,
  bebidas,
  allPizzas,
};
