export interface City {
    name: string;
}

export interface State {
    name: string;
    cities: string[];
}

export interface CountryData {
    states: State[];
    stateLabel: string;
    cityLabel: string;
}

export const LOCATIONS: Record<string, CountryData> = {
    VE: {
        stateLabel: 'Estado',
        cityLabel: 'Ciudad',
        states: [
            { name: 'Amazonas', cities: ['Puerto Ayacucho', 'San Fernando de Atabapo', 'San Carlos de Río Negro', 'Maroa'] },
            { name: 'Anzoátegui', cities: ['Barcelona', 'Puerto La Cruz', 'El Tigre', 'Anaco', 'Lechería', 'Guanta'] },
            { name: 'Apure', cities: ['San Fernando de Apure', 'Guasdualito', 'Elorza', 'Achaguas', 'Biruaca'] },
            { name: 'Aragua', cities: ['Maracay', 'Turmero', 'La Victoria', 'Cagua', 'El Limón', 'Colonia Tovar'] },
            { name: 'Barinas', cities: ['Barinas', 'Socopó', 'Santa Bárbara', 'Ciudad Bolivia'] },
            { name: 'Bolívar', cities: ['Ciudad Guayana', 'Ciudad Bolívar', 'Upata', 'Santa Elena de Uairén', 'Caicara del Orinoco', 'El Callao'] },
            { name: 'Carabobo', cities: ['Valencia', 'Puerto Cabello', 'Guacara', 'Naguanagua', 'San Diego', 'Mariara'] },
            { name: 'Cojedes', cities: ['San Carlos', 'Tinaquillo', 'Tinaco', 'El Pao'] },
            { name: 'Delta Amacuro', cities: ['Tucupita', 'Pedernales'] },
            { name: 'Distrito Capital', cities: ['Caracas'] },
            { name: 'Falcón', cities: ['Coro', 'Punto Fijo', 'Puerto Cumarebo', 'Dabajuro', 'Tucacas'] },
            { name: 'Guárico', cities: ['Calabozo', 'Valle de la Pascua', 'Zaraza', 'Altagracia de Orituco', 'San Juan de los Morros'] },
            { name: 'Lara', cities: ['Barquisimeto', 'Carora', 'El Tocuyo', 'Quíbor', 'Cabudare'] },
            { name: 'Mérida', cities: ['Mérida', 'El Vigía', 'Tovar', 'Ejido', 'Lagunillas'] },
            { name: 'Miranda', cities: ['Petare', 'Baruta', 'Chacao', 'Los Teques', 'Guarenas', 'Guatire', 'Ocumare del Tuy', 'Santa Teresa del Tuy'] },
            { name: 'Monagas', cities: ['Maturín', 'Caripito', 'Punta de Mata', 'Temblador', 'Caripe'] },
            { name: 'Nueva Esparta', cities: ['Porlamar', 'La Asunción', 'Juan Griego', 'Pampatar', 'El Valle del Espíritu Santo'] },
            { name: 'Portuguesa', cities: ['Acarigua', 'Guanare', 'Araure', 'Villa Bruzual'] },
            { name: 'Sucre', cities: ['Cumaná', 'Carúpano', 'Güiria', 'Río Caribe', 'Casanay'] },
            { name: 'Táchira', cities: ['San Cristóbal', 'Táriba', 'Rubio', 'San Antonio del Táchira', 'La Grita'] },
            { name: 'Trujillo', cities: ['Valera', 'Trujillo', 'Boconó', 'Monay', 'Sabana de Mendoza'] },
            { name: 'La Guaira (Vargas)', cities: ['La Guaira', 'Maiquetía', 'Carayaca', 'Catia La Mar'] },
            { name: 'Yaracuy', cities: ['San Felipe', 'Chivacoa', 'Yaritagua', 'Nirgua'] },
            { name: 'Zulia', cities: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'Machiques', 'Santa Rita', 'San Francisco'] }
        ]
    },
    CO: {
        stateLabel: 'Departamento',
        cityLabel: 'Ciudad',
        states: [
            { name: 'Amazonas', cities: ['Leticia', 'Puerto Nariño'] },
            { name: 'Antioquia', cities: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro'] },
            { name: 'Arauca', cities: ['Arauca', 'Tame', 'Saravena'] },
            { name: 'Atlántico', cities: ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia'] },
            { name: 'Bogotá D.C.', cities: ['Bogotá'] },
            { name: 'Bolívar', cities: ['Cartagena', 'Magangué', 'Turbaco', 'El Carmen de Bolívar'] },
            { name: 'Boyacá', cities: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá'] },
            { name: 'Caldas', cities: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría'] },
            { name: 'Caquetá', cities: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico'] },
            { name: 'Casanare', cities: ['Yopal', 'Aguazul', 'Villanueva'] },
            { name: 'Cauca', cities: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada'] },
            { name: 'Cesar', cities: ['Valledupar', 'Aguachica', 'Codazzi'] },
            { name: 'Chocó', cities: ['Quibdó', 'Istmina', 'Condoto', 'Acandí'] },
            { name: 'Córdoba', cities: ['Montería', 'Cereté', 'Lorica', 'Sahagún'] },
            { name: 'Cundinamarca', cities: ['Soacha', 'Facatativá', 'Zipaquirá', 'Girardot', 'Chía'] },
            { name: 'Guainía', cities: ['Inírida', 'Barranco Minas'] },
            { name: 'Guaviare', cities: ['San José del Guaviare', 'Calamar', 'Miraflores'] },
            { name: 'Huila', cities: ['Neiva', 'Pitalito', 'Garzón'] },
            { name: 'La Guajira', cities: ['Riohacha', 'Maicao', 'Uribia', 'Manaure'] },
            { name: 'Magdalena', cities: ['Santa Marta', 'Ciénaga', 'Fundación'] },
            { name: 'Meta', cities: ['Villavicencio', 'Acacías', 'Granada'] },
            { name: 'Nariño', cities: ['Pasto', 'Tumaco', 'Ipiales'] },
            { name: 'Norte de Santander', cities: ['Cúcuta', 'Ocaña', 'Pamplona'] },
            { name: 'Putumayo', cities: ['Mocoa', 'Puerto Asís', 'Orito'] },
            { name: 'Quindío', cities: ['Armenia', 'Calarcá', 'Montenegro'] },
            { name: 'Risaralda', cities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'] },
            { name: 'San Andrés y Providencia', cities: ['San Andrés', 'Providencia'] },
            { name: 'Santander', cities: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja'] },
            { name: 'Sucre', cities: ['Sincelejo', 'Corozal', 'Sampués'] },
            { name: 'Tolima', cities: ['Ibagué', 'Espinal', 'Melgar'] },
            { name: 'Valle del Cauca', cities: ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Cartago'] },
            { name: 'Vaupés', cities: ['Mitú', 'Carurú'] },
            { name: 'Vichada', cities: ['Puerto Carreño', 'La Primavera'] }
        ]
    },
    MX: {
        stateLabel: 'Estado',
        cityLabel: 'Ciudad / Municipio',
        states: [
            { name: 'Aguascalientes', cities: ['Aguascalientes', 'Jesús María', 'Calvillo', 'Pabellón de Arteaga'] },
            { name: 'Baja California', cities: ['Tijuana', 'Mexicali', 'Ensenada', 'Playas de Rosarito', 'Tecate'] },
            { name: 'Baja California Sur', cities: ['La Paz', 'Cabo San Lucas', 'San José del Cabo', 'Ciudad Constitución'] },
            { name: 'Campeche', cities: ['San Francisco de Campeche', 'Ciudad del Carmen', 'Calkiní', 'Champotón'] },
            { name: 'Chiapas', cities: ['Tuxtla Gutiérrez', 'Tapachula', 'San Cristóbal de las Casas', 'Comitán de Domínguez'] },
            { name: 'Chihuahua', cities: ['Ciudad Juárez', 'Chihuahua', 'Cuauhtémoc', 'Delicias', 'Hidalgo del Parral'] },
            { name: 'Ciudad de México', cities: ['Iztapalapa', 'Gustavo A. Madero', 'Álvaro Obregón', 'Coyoacán', 'Tlalpan'] },
            { name: 'Coahuila de Zaragoza', cities: ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Ciudad Acuña'] },
            { name: 'Colima', cities: ['Manizales', 'Colima', 'Villa de Álvarez', 'Tecomán'] },
            { name: 'Durango', cities: ['Durango', 'Gómez Palacio', 'Ciudad Lerdo', 'Santiago Papasquiaro'] },
            { name: 'Estado de México', cities: ['Ecatepec de Morelos', 'Nezahualcóyotl', 'Naucalpan de Juárez', 'Toluca de Lerdo', 'Chimalhuacán'] },
            { name: 'Guanajuato', cities: ['León de los Aldama', 'Irapuato', 'Celaya', 'Salamanca', 'Guanajuato'] },
            { name: 'Guerrero', cities: ['Acapulco de Juárez', 'Chilpancingo de los Bravo', 'Iguala de la Independencia', 'Taxco de Alarcón', 'Zihuatanejo'] },
            { name: 'Hidalgo', cities: ['Pachuca de Soto', 'Tulancingo de Bravo', 'Tizayuca', 'Mineral de la Reforma', 'Huejutla de Reyes'] },
            { name: 'Jalisco', cities: ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá', 'Puerto Vallarta'] },
            { name: 'Michoacán de Ocampo', cities: ['Morelia', 'Uruapan del Progreso', 'Zamora de Hidalgo', 'Lázaro Cárdenas', 'Pátzcuaro'] },
            { name: 'Morelos', cities: ['Cuernavaca', 'Jiutepec', 'Cuautla', 'Temixco', 'Yautepec'] },
            { name: 'Nayarit', cities: ['Tepic', 'Xalisco', 'Tecuala', 'Acaponeta', 'Compostela'] },
            { name: 'Nuevo León', cities: ['Monterrey', 'Guadalupe', 'Apodaca', 'San Nicolás de los Garza', 'Santa Catarina'] },
            { name: 'Oaxaca', cities: ['Oaxaca de Juárez', 'Salina Cruz', 'Juchitán de Zaragoza', 'Huajuapan de León', 'Puerto Escondido'] },
            { name: 'Puebla', cities: ['Puebla de Zaragoza', 'Tehuacán', 'San Martín Texmelucan', 'Atlixco', 'Cholula de Rivadavia'] },
            { name: 'Querétaro', cities: ['Santiago de Querétaro', 'San Juan del Río', 'El Marqués', 'Corregidora'] },
            { name: 'Quintana Roo', cities: ['Cancún', 'Playa del Carmen', 'Chetumal', 'Cozumel', 'Tulum'] },
            { name: 'San Luis Potosí', cities: ['San Luis Potosí', 'Soledad de Graciano Sánchez', 'Ciudad Valles', 'Matehuala', 'Rioverde'] },
            { name: 'Sinaloa', cities: ['Culiacán Rosales', 'Mazatlán', 'Los Mochis', 'Guasave', 'Navolato'] },
            { name: 'Sonora', cities: ['Hermosillo', 'Ciudad Obregón', 'Nogales', 'San Luis Río Colorado', 'Guaymas'] },
            { name: 'Tabasco', cities: ['Villahermosa', 'Cárdenas', 'Comalcalco', 'Huimanguillo', 'Paraíso'] },
            { name: 'Tamaulipas', cities: ['Reynosa', 'Matamoros', 'Nuevo Laredo', 'Tampico', 'Ciudad Victoria'] },
            { name: 'Tlaxcala', cities: ['San Pablo del Monte', 'Vicente Guerrero', 'Tlaxcala de Xicohténcatl', 'Chiautempan', 'Apizaco'] },
            { name: 'Veracruz de Ignacio de la Llave', cities: ['Veracruz', 'Xalapa-Enríquez', 'Coatzacoalcos', 'Córdoba', 'Poza Rica de Hidalgo'] },
            { name: 'Yucatán', cities: ['Mérida', 'Kanasín', 'Valladolid', 'Tizimín', 'Progreso'] },
            { name: 'Zacatecas', cities: ['Zacatecas', 'Guadalupe', 'Fresnillo', 'Jerez de García Salinas', 'Río Grande'] }
        ]
    }
};
