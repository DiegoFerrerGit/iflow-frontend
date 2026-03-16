export interface IconCategory {
  name: string;
  label: string;
  icons: { name: string; tags: string[] }[];
}

export const ICON_LIBRARY: IconCategory[] = [
  {
    name: 'finance',
    label: 'Finanzas & Mercado',
    icons: [
      { name: 'account_balance', tags: ['banco', 'market', 'bolsa', 'institucion'] },
      { name: 'trending_up', tags: ['subida', 'crecimiento', 'acciones', 'market'] },
      { name: 'monitoring', tags: ['analisis', 'datos', 'grafico', 'market'] },
      { name: 'show_chart', tags: ['grafico', 'acciones', 'tendencia'] },
      { name: 'candlestick_chart', tags: ['trading', 'velas', 'market', 'acciones'] },
      { name: 'legend_toggle', tags: ['grafico', 'analisis', 'datos'] },
      { name: 'query_stats', tags: ['estadisticas', 'datos'] },
      { name: 'analytics', tags: ['datos', 'reporte'] },
      { name: 'finance_chip', tags: ['tarjeta', 'pago', 'tecnologia'] },
      { name: 'payments', tags: ['pagos', 'dinero', 'efectivo'] },
      { name: 'currency_exchange', tags: ['cambio', 'moneda', 'dolar', 'euro'] },
      { name: 'account_balance_wallet', tags: ['billetera', 'cartera', 'dinero'] },
      { name: 'savings', tags: ['ahorro', 'chanchito', 'alcancia'] },
      { name: 'paid', tags: ['pago', 'completado', 'dolar'] },
      { name: 'credit_card', tags: ['tarjeta', 'visa', 'debito'] },
      { name: 'receipt', tags: ['factura', 'ticket', 'gasto'] },
      { name: 'account_tree', tags: ['jerarquia', 'categorias', 'organizacion'] },
      { name: 'calculate', tags: ['calculadora', 'matematicas', 'contabilidad'] },
      { name: 'monetization_on', tags: ['moneda', 'dolar', 'dinero'] }
    ]
  },
  {
    name: 'crypto',
    label: 'Cripto & Web3',
    icons: [
      { name: 'currency_bitcoin', tags: ['btc', 'crypto', 'bitcoin'] },
      { name: 'monetization_on', tags: ['moneda', 'dolar', 'crypto', 'cripto'] },
      { name: 'toll', tags: ['token', 'crypto', 'blockchain', 'node'] },
      { name: 'currency_exchange', tags: ['exchange', 'trade', 'crypto'] },
      { name: 'token', tags: ['coin', 'crypto', 'cripto', 'nft'] },
      { name: 'generating_tokens', tags: ['mint', 'crypto', 'generar'] },
      { name: 'stars', tags: ['favorito', 'coin', 'crypto'] },
      { name: 'database', tags: ['datos', 'blockchain', 'servidor'] },
      { name: 'hub', tags: ['red', 'conexion', 'blockchain'] },
      { name: 'webhook', tags: ['node', 'dev', 'crypto'] },
      { name: 'key', tags: ['llave', 'seguridad', 'password'] },
      { name: 'security', tags: ['seguridad', 'escudo'] },
      { name: 'shield', tags: ['escudo', 'proteccion'] },
      { name: 'lock', tags: ['candado', 'bloqueado'] },
      { name: 'link', tags: ['blockchain', 'enlace', 'conexion'] }
    ]
  },
  {
    name: 'assets',
    label: 'Activos & Propiedades',
    icons: [
      { name: 'home', tags: ['casa', 'hogar', 'vivienda'] },
      { name: 'apartment', tags: ['departamento', 'edificio', 'piso'] },
      { name: 'cottage', tags: ['quinta', 'campo', 'cabaña'] },
      { name: 'house', tags: ['casa', 'hogar'] },
      { name: 'villa', tags: ['mansion', 'lujo', 'casa'] },
      { name: 'chalet', tags: ['cabana', 'montaña', 'vacaciones'] },
      { name: 'real_estate_agent', tags: ['inmobiliaria', 'venta'] },
      { name: 'garage', tags: ['cochera', 'estacionamiento'] },
      { name: 'directions_car', tags: ['auto', 'vehiculo', 'carro'] },
      { name: 'electric_car', tags: ['auto', 'tesla', 'electrico'] },
      { name: 'motorcycle', tags: ['moto', 'vehiculo'] },
      { name: 'rv_hookup', tags: ['motorhome', 'trailer', 'viaje'] },
      { name: 'commute', tags: ['transporte', 'viaje'] },
      { name: 'pedal_bike', tags: ['bici', 'bicicleta', 'ejercicio'] },
      { name: 'watch', tags: ['reloj', 'lujo', 'accesorio', 'rolex'] },
      { name: 'precision_manufacturing', tags: ['reloj', 'maquina', 'lujo'] },
      { name: 'diamond', tags: ['diamante', 'joya', 'riqueza'] },
      { name: 'inventory_2', tags: ['caja', 'stock', 'deposito'] },
      { name: 'storefront', tags: ['local', 'tienda', 'negocio'] }
    ]
  },
  {
    name: 'beauty_health',
    label: 'Salud & Belleza',
    icons: [
      { name: 'spa', tags: ['belleza', 'estetica', 'flowers'] },
      { name: 'back_hand', tags: ['mano', 'uñas', 'manicure', 'nails'] },
      { name: 'brush', tags: ['pintura', 'uñas', 'pincel', 'maquillaje'] },
      { name: 'face_retouching_natural', tags: ['estetica', 'skincare', 'belleza'] },
      { name: 'content_cut', tags: ['peluqueria', 'tijeras', 'corte'] },
      { name: 'styler', tags: ['pelo', 'peinado', 'belleza'] },
      { name: 'face', tags: ['estetica', 'belleza', 'rostro'] },
      { name: 'health_and_safety', tags: ['salud', 'medico', 'seguro'] },
      { name: 'medical_services', tags: ['medico', 'doctor', 'hospital'] },
      { name: 'vaccines', tags: ['vacuna', 'salud'] },
      { name: 'fitness_center', tags: ['gym', 'gimnasio', 'deporte'] },
      { name: 'self_improvement', tags: ['yoga', 'meditacion', 'paz'] },
      { name: 'sanitizer', tags: ['limpieza', 'salud'] },
      { name: 'favorite', tags: ['corazon', 'amor', 'salud'] }
    ]
  },
  {
    name: 'lifestyle',
    label: 'Estilo de Vida',
    icons: [
      { name: 'shopping_cart', tags: ['compras', 'supermercado', 'carrito'] },
      { name: 'restaurant', tags: ['comida', 'restaurante', 'cena'] },
      { name: 'local_pizza', tags: ['comida', 'pizza', 'delivery'] },
      { name: 'bakery_dining', tags: ['panaderia', 'cafe', 'desayuno'] },
      { name: 'lunch_dining', tags: ['almuerzo', 'hamburguesa'] },
      { name: 'coffee', tags: ['cafe', 'starbucks', 'desayuno'] },
      { name: 'flight', tags: ['viaje', 'avion', 'vacaciones'] },
      { name: 'hotel', tags: ['hotel', 'hospedaje', 'viaje'] },
      { name: 'school', tags: ['universidad', 'estudio', 'curso'] },
      { name: 'pets', tags: ['mascota', 'perro', 'gato'] },
      { name: 'redeem', tags: ['regalo', 'gift', 'premio'] },
      { name: 'local_mall', tags: ['shopping', 'bolsas', 'compras'] },
      { name: 'sports_esports', tags: ['juegos', 'gaming', 'play'] },
      { name: 'movie', tags: ['cine', 'netflix', 'pelicula'] },
      { name: 'music_note', tags: ['musica', 'spotify', 'sonido'] },
      { name: 'park', tags: ['parque', 'aire', 'libre'] },
      { name: 'bolt', tags: ['luz', 'energia', 'electricidad'] },
      { name: 'local_gas_station', tags: ['nafta', 'combustible', 'gasolina'] },
      { name: 'sports_soccer', tags: ['futbol', 'deporte', 'pelota'] }
    ]
  },
  {
    name: 'professional',
    label: 'Profesional & Tech',
    icons: [
      { name: 'work', tags: ['trabajo', 'oficina', 'empleo'] },
      { name: 'business_center', tags: ['maletin', 'negocios'] },
      { name: 'router', tags: ['internet', 'wifi', 'redes', 'ingeniero'] },
      { name: 'settings_input_component', tags: ['hardware', 'redes', 'tecnico'] },
      { name: 'settings_ethernet', tags: ['cable', 'redes', 'internet'] },
      { name: 'lan', tags: ['red', 'local', 'ingeniero'] },
      { name: 'cloud_sync', tags: ['nube', 'servidor', 'sync'] },
      { name: 'videogame_asset', tags: ['streaming', 'gamer', 'streamer', 'twitch'] },
      { name: 'mic', tags: ['microfono', 'podcasts', 'streamer'] },
      { name: 'video_camera_front', tags: ['camara', 'vlog', 'streamer', 'youtube'] },
      { name: 'live_tv', tags: ['vivo', 'stream', 'tv'] },
      { name: 'podcasts', tags: ['radio', 'audio', 'podcasts'] },
      { name: 'magic_button', tags: ['magia', 'automatizacion', 'especial'] },
      { name: 'engineering', tags: ['ingenieria', 'mecanica', 'tecnico'] },
      { name: 'biotech', tags: ['ciencia', 'bio', 'laboratorio'] },
      { name: 'memory', tags: ['chip', 'hardware', 'cpu'] },
      { name: 'code', tags: ['programacion', 'dev', 'codigo'] },
      { name: 'terminal', tags: ['consola', 'codigo', 'dev'] },
      { name: 'laptop_mac', tags: ['compu', 'macbook', 'trabajo'] },
      { name: 'phone_iphone', tags: ['celular', 'iphone', 'apple'] }
    ]
  }
];

// Flat list of the primary 32 icons to show by default (if no search)
export const DEFAULT_ICONS = [
  'account_balance', 'trending_up', 'candlestick_chart', 'currency_bitcoin', 
  'home', 'apartment', 'directions_car', 'watch',
  'shopping_cart', 'restaurant', 'flight', 'pets',
  'fitness_center', 'back_hand', 'content_cut', 'school',
  'work', 'videogame_asset', 'router', 'laptop_mac',
  'savings', 'paid', 'credit_card', 'receipt',
  'redeem', 'local_mall', 'sports_esports', 'movie',
  'music_note', 'park', 'bolt', 'local_gas_station'
];
