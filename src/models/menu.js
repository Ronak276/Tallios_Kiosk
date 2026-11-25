export const CATEGORIES = ['All', 'Favorites', 'Signatures', 'Coffee', 'Breakfast', 'Sandwiches', 'Surinamese', 'Refreshers']
export const SIZES = [
  { label: 'Regular (12 oz)', price: 0 },
  { label: 'Large (16 oz)', price: 100 },
]

export const MILKS = [
  { label: 'Whole milk', price: 0 },
  { label: 'Oat milk', price: 75 },
  { label: 'Almond milk', price: 75 },
]

const photos = {
  spiceLatte: 'menu-0.jpg',
  cappuccino: 'cappuccino.jpg',
  strawberry: 'strawberry-refresher.jpg',
  mango: 'mango-refresher.jpg',
  loxBagel: 'lox-bagel.jpg',
  bagel: 'cream-cheese-bagel.jpg',
  hamCroissant: 'ham-cheese-croissant.jpg',
  cookies: 'maizena-koekjes.jpg',
  cacao: 'surinamese-cacao.jpg',
  coffee: 'filter-coffee.jpg',
  coldBrew: 'menu-1.jpg',
  toast: 'menu-3.jpg',
  latte: 'cafe-latte.jpg',
  ginger: 'ginger-brew.jpg',
  bojo: 'bojo.jpg',
  croissant: 'menu-4.jpg',
  sandwich: 'menu-5.jpg',
  greenLatte: 'menu-2.jpg',
}

const catalog = [
  ['spice-latte', 'Paramaribo Spice Latte', 'Coffee', 700, 'spiceLatte', 'Espresso, milk, and house spices.', { milk: true, favorite: true, signature: true }],
  ['cold-brew', 'Paramaribo Cold Brew', 'Coffee', 700, 'coldBrew', 'Slow-steeped coffee served over ice.', { favorite: true, signature: true }],
  ['avocado', 'Avocado Toast', 'Breakfast', 1100, 'toast', 'Avocado on toasted bread.', { favorite: true }],
  ['cappuccino', 'Cappuccino', 'Coffee', 500, 'cappuccino', 'Espresso with steamed milk and foam.', { milk: true }],
  ['latte', 'Latte', 'Coffee', 600, 'latte', 'Espresso with steamed milk.', { milk: true, favorite: true }],
  ['kofi-kracht', 'Kofi Kracht', 'Coffee', 700, 'coldBrew', 'An iced house coffee specialty.', { signature: true }],
  ['ginger-brew', 'Ginger Brew', 'Refreshers', 600, 'ginger', 'A chilled ginger drink.', { signature: true }],
  ['croissant', 'Bacon, Egg & Cheese Croissant', 'Breakfast', 900, 'croissant', 'Bacon, egg, and cheese on a croissant.', { favorite: true }],
  ['lox-bagel', 'Lox Bagel', 'Breakfast', 1100, 'loxBagel', 'A bagel with lox and cream cheese.'],
  ['turkey', 'Turkey Cheese & Pesto', 'Sandwiches', 1200, 'sandwich', 'Turkey, cheese, and basil pesto.', { favorite: true }],
  ['turkey-avocado', 'Turkey Avocado', 'Sandwiches', 1200, 'sandwich', 'Turkey and avocado on grilled bread.'],
  ['chipotle-chicken-bacon', 'Chipotle Chicken & Bacon', 'Sandwiches', 1300, 'sandwich', 'Chicken, bacon, and chipotle.'],
  ['broodje-bakkeljauw', 'Broodje Bakkeljauw', 'Surinamese', 1200, 'sandwich', 'A Surinamese salt cod sandwich.'],
  ['bojo', 'Bojo', 'Surinamese', 500, 'bojo', 'Surinamese cassava and coconut cake.'],
  ['strawberry-refresher', 'Strawberry Refresher', 'Refreshers', 750, 'strawberry', 'A chilled strawberry refresher.'],
  ['strawberry-mango-refresher', 'Strawberry Mango Refresher', 'Refreshers', 750, 'strawberry', 'A chilled strawberry and mango refresher.'],
  ['watermelon-strawberry-mojito', 'Watermelon Strawberry Mojito', 'Refreshers', 800, 'strawberry', 'A watermelon and strawberry refresher.'],
  ['drip-coffee', 'Drip Coffee', 'Coffee', 425, 'coffee', 'Freshly brewed filter coffee.'],
  ['americano', 'Americano', 'Coffee', 475, 'coffee', 'Espresso and hot water.'],
  ['paramaribo-green-latte', 'Paramaribo Green Latte', 'Coffee', 700, 'greenLatte', 'The house green latte.', { milk: true, signature: true }],
  ['allens-cacao', 'Allen’s Surinamese Cacao', 'Surinamese', 600, 'cacao', 'A Surinamese cacao drink.', { milk: true, drink: true }],
  ['ham-cheese-croissant', 'Ham & Cheese Croissant', 'Breakfast', 700, 'hamCroissant', 'Ham and cheese on a buttery croissant.'],
  ['bacon-cream-cheese-bagel', 'Bacon Cream Cheese Bagel', 'Breakfast', 700, 'bagel', 'Bacon and cream cheese on a toasted bagel.'],
  ['bagel-cream-cheese', 'Bagel & Cream Cheese', 'Breakfast', 500, 'bagel', 'A toasted bagel with cream cheese.'],
  ['grilled-chicken-salad', 'Grilled Chicken Salad Sandwich', 'Sandwiches', 1200, 'sandwich', 'A sandwich filled with grilled chicken salad.'],
  ['tuna-melt', 'Tuna Melt', 'Sandwiches', 1200, 'sandwich', 'Tuna and melted cheese on grilled bread.'],
  ['egg-salad', 'Egg Salad Sandwich', 'Sandwiches', 1200, 'sandwich', 'Egg salad on toasted bread.'],
  ['maizena-koekjes', 'Maizena Koekjes', 'Surinamese', 400, 'cookies', 'Surinamese cornstarch cookies.'],
  ['mango-refresher', 'Mango Refresher', 'Refreshers', 750, 'mango', 'A chilled mango refresher.'],
  ['watermelon-green-tea', 'Fresh Watermelon Green Tea', 'Refreshers', 700, 'strawberry', 'Green tea with fresh watermelon.'],
  ['watermelon-apple-green-tea', 'Watermelon Apple Green Tea', 'Refreshers', 750, 'strawberry', 'Green tea with watermelon and apple.'],
]

export const MENU_ITEMS = catalog.map(([id, name, category, price, photo, description, options]) => ({
  id,
  name,
  category,
  price,
  image: photos[photo],
  description,
  ...options,
}))

export function isDrinkItem(item) {
  return item.category === 'Coffee' || item.category === 'Refreshers' || Boolean(item.drink)
}

export function getMenuByCategory(category) {
  if (category === 'All') return MENU_ITEMS
  if (category === 'Favorites') return MENU_ITEMS.filter((item) => item.favorite)
  if (category === 'Signatures') return MENU_ITEMS.filter((item) => item.signature)
  return MENU_ITEMS.filter((item) => item.category === category)
}
