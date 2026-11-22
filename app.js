(function(){
"use strict";
const $=s=>document.querySelector(s);
function langPref(){try{const v=localStorage.getItem("bocado:lang");return v==="es"||v==="en"?v:"auto"}catch(e){return"auto"}}
const LANG=(()=>{const p=langPref();if(p!=="auto")return p;
  const ls=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||"en"];
  for(const l of ls){const c=String(l).slice(0,2).toLowerCase();if(c==="es")return"es";if(c==="en")return"en"}
  return"en"})();
const EN=LANG==="en";
const tr=(es,en)=>EN?en:es;
const LOC=EN?"en-US":"es-CL";
const TZ=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){return""}})();
function tzCountry(tz){
  if(/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Juneau|Sitka|Nome|Yakutat|Metlakatla|Adak|Boise|Detroit|Menominee|Indianapolis|Louisville|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)$|^Pacific\/Honolulu$|^US\//.test(tz))return"us";
  const M={"America/Santiago":"cl","America/Punta_Arenas":"cl","Pacific/Easter":"cl","America/Lima":"pe","America/Bogota":"co","America/Caracas":"ve","America/Montevideo":"uy","America/Asuncion":"py","America/La_Paz":"bo","America/Guayaquil":"ec","Pacific/Galapagos":"ec","America/Costa_Rica":"cr","America/Panama":"pa","America/Guatemala":"gt","America/El_Salvador":"sv","America/Tegucigalpa":"hn","America/Managua":"ni","America/Santo_Domingo":"do","America/Havana":"cu","America/Puerto_Rico":"pr","Europe/Madrid":"es","Atlantic/Canary":"es","Africa/Ceuta":"es","Europe/London":"uk","Europe/Paris":"fr","Europe/Berlin":"de","Europe/Rome":"it","Europe/Lisbon":"pt","America/Toronto":"ca","America/Vancouver":"ca","America/Edmonton":"ca","America/Winnipeg":"ca","America/Halifax":"ca","America/St_Johns":"ca","America/Regina":"ca","Australia/Sydney":"au","Australia/Melbourne":"au","Australia/Brisbane":"au","Australia/Perth":"au","Australia/Adelaide":"au"};
  if(M[tz])return M[tz];
  if(/^America\/Argentina\//.test(tz)||tz==="America/Buenos_Aires")return"ar";
  if(/^America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Chihuahua|Ciudad_Juarez|Ojinaga|Mazatlan|Bahia_Banderas|Hermosillo|Tijuana)$/.test(tz))return"mx";
  if(/^America\/(Sao_Paulo|Bahia|Fortaleza|Recife|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco|Maceio|Araguaina|Santarem|Noronha|Eirunepe)$/.test(tz))return"br";
  return null;
}
const CC=(()=>{const t=tzCountry(TZ);if(t)return t;const l=(navigator.languages&&navigator.languages[0])||navigator.language||"";const m=String(l).match(/[-_]([A-Za-z]{2})(?:$|[-_])/);if(m)return m[1].toLowerCase();return LANG==="es"?"cl":null})();
function unitsPref(){try{const v=localStorage.getItem("bocado:units");return v==="metric"||v==="imperial"?v:"auto"}catch(e){return"auto"}}
const IMP=unitsPref()==="auto"?CC==="us":unitsPref()==="imperial";
const KG2LB=2.20462,ML2OZ=1/29.5735;
const wDisp=kg=>IMP?kg*KG2LB:kg;
const wUnit=IMP?"lb":"kg";
const fmtW=kg=>fmt1(wDisp(kg))+" "+wUnit;
const fmtRate=kg=>IMP?fmt1(kg*KG2LB)+" lb":fmt2(kg)+" kg";
function fmtH(cm){if(!cm)return"";if(!IMP)return Math.round(cm)+" cm";const t=Math.round(cm/2.54);return`${Math.floor(t/12)}′ ${t%12}″`}
const fmtWater=ml=>IMP?fmt(ml*ML2OZ):fmt1(ml/1000);
const waterUnit=IMP?"oz":"L";
function setUnits(v){try{if(v==="auto")localStorage.removeItem("bocado:units");else localStorage.setItem("bocado:units",v)}catch(e){}location.reload()}
function countryName(cc){try{return new Intl.DisplayNames([LOC],{type:"region"}).of(cc.toUpperCase())}catch(e){return cc.toUpperCase()}}
function setLang(v){try{if(v==="auto")localStorage.removeItem("bocado:lang");else localStorage.setItem("bocado:lang",v)}catch(e){}location.reload()}
document.documentElement.lang=LANG;
const MEALS=[["desayuno",tr("Desayuno","Breakfast")],["almuerzo",tr("Almuerzo","Lunch")],["cena",tr("Cena","Dinner")],["snack",tr("Snacks","Snacks")]];
const MEAL_NAME=Object.fromEntries(MEALS);
const ACT=[[1.2,"Sedentario"],[1.375,"Ligero (1–3 entrenos)"],[1.55,"Moderado (3–5 entrenos)"],[1.725,"Alto (6–7 entrenos)"]];
const GOALS=[[-400,"Bajar de peso (−400 kcal)"],[0,"Mantener"],[300,"Subir de peso (+300 kcal)"],[500,"Subir rápido (+500 kcal)"]];
const DEF_PROFILE={name:"",sex:null,age:null,height:null,weight:null,glass:null,weights:[],onboarded:false};
const APP_VERSION="0.3.0";
const OFF_FIELDS="code,product_name,product_name_es,product_name_en,generic_name,generic_name_es,generic_name_en,brands,serving_quantity,nutriments";
const S={profile:{...DEF_PROFILE},foods:{},days:{},wlog:{},date:dstr(new Date()),tab:"hoy",addMeal:null,pendingCode:null};

const UNITS={"Manzana": ["manzana", "manzanas", "apple", "apples", 150], "Plátano": ["plátano", "plátanos", "banana", "bananas", 120], "Naranja": ["naranja", "naranjas", "orange", "oranges", 150], "Mandarina": ["mandarina", "mandarinas", "tangerine", "tangerines", 80], "Pera": ["pera", "peras", "pear", "pears", 170], "Durazno": ["durazno", "duraznos", "peach", "peaches", 150], "Damasco": ["damasco", "damascos", "apricot", "apricots", 35], "Ciruela": ["ciruela", "ciruelas", "plum", "plums", 65], "Kiwi": ["kiwi", "kiwis", "kiwi", "kiwis", 75], "Limón": ["limón", "limones", "lemon", "lemons", 60], "Higo": ["higo", "higos", "fig", "figs", 50], "Dátiles": ["dátil", "dátiles", "date", "dates", 24], "Palta": ["palta", "paltas", "avocado", "avocados", 140], "Chirimoya": ["chirimoya", "chirimoyas", "cherimoya", "cherimoyas", 300], "Tomate": ["tomate", "tomates", "tomato", "tomatoes", 120], "Zanahoria": ["zanahoria", "zanahorias", "carrot", "carrots", 80], "Cebolla": ["cebolla", "cebollas", "onion", "onions", 100], "Ajo": ["diente", "dientes", "clove", "cloves", 5], "Pimentón rojo": ["pimentón", "pimentones", "bell pepper", "bell peppers", 150], "Choclo cocido": ["choclo", "choclos", "ear of corn", "ears of corn", 150], "Marraqueta": ["marraqueta", "marraquetas", "roll", "rolls", 100], "Hallulla": ["hallulla", "hallullas", "flatbread", "flatbreads", 80], "Pan amasado": ["pan", "panes", "bread roll", "bread rolls", 100], "Pan de molde blanco": ["rebanada", "rebanadas", "slice", "slices", 27], "Pan de molde integral": ["rebanada", "rebanadas", "slice", "slices", 30], "Pan pita": ["pan pita", "panes pita", "pita", "pitas", 60], "Pan de hamburguesa": ["pan", "panes", "bun", "buns", 50], "Tortilla de trigo": ["tortilla", "tortillas", "tortilla", "tortillas", 40], "Tortilla de maíz": ["tortilla", "tortillas", "tortilla", "tortillas", 26], "Galletas de agua": ["galleta", "galletas", "cracker", "crackers", 4], "Papa cocida": ["papa", "papas", "potato", "potatoes", 150], "Camote cocido": ["camote", "camotes", "sweet potato", "sweet potatoes", 150], "Avena en hojuelas": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 10], "Vienesa": ["vienesa", "vienesas", "hot dog", "hot dogs", 45], "Jamón de pavo": ["lámina", "láminas", "slice", "slices", 15], "Jamón de cerdo": ["lámina", "láminas", "slice", "slices", 15], "Tocino cocido": ["tira", "tiras", "strip", "strips", 8], "Salame": ["lámina", "láminas", "slice", "slices", 5], "Mortadela": ["lámina", "láminas", "slice", "slices", 15], "Trutro de pollo asado con piel": ["trutro", "trutros", "thigh", "thighs", 120], "Chuleta de cerdo cocida": ["chuleta", "chuletas", "chop", "chops", 150], "Longaniza cocida": ["longaniza", "longanizas", "sausage", "sausages", 80], "Atún en agua (escurrido)": ["lata", "latas", "can", "cans", 120], "Atún en aceite (escurrido)": ["lata", "latas", "can", "cans", 120], "Sardinas en aceite (escurridas)": ["lata", "latas", "can", "cans", 90], "Camarones cocidos": ["camarón", "camarones", "shrimp", "shrimp", 6], "Kanikama": ["barrita", "barritas", "stick", "sticks", 17], "Huevo entero": ["huevo", "huevos", "egg", "eggs", 50], "Clara de huevo": ["clara", "claras", "egg white", "egg whites", 33], "Huevo duro": ["huevo", "huevos", "egg", "eggs", 50], "Huevo frito": ["huevo", "huevos", "egg", "eggs", 46], "Huevos revueltos": ["huevo", "huevos", "egg", "eggs", 61], "Leche entera": ["vaso", "vasos", "glass", "glasses", 200], "Leche semidescremada": ["vaso", "vasos", "glass", "glasses", 200], "Leche descremada": ["vaso", "vasos", "glass", "glasses", 200], "Leche con chocolate": ["vaso", "vasos", "glass", "glasses", 200], "Yogur natural": ["pote", "potes", "cup", "cups", 125], "Yogur con sabor": ["pote", "potes", "cup", "cups", 125], "Yogur protein": ["pote", "potes", "cup", "cups", 155], "Yogur griego natural": ["pote", "potes", "cup", "cups", 170], "Queso gauda": ["lámina", "láminas", "slice", "slices", 15], "Queso mantecoso": ["lámina", "láminas", "slice", "slices", 15], "Queso mozzarella": ["lámina", "láminas", "slice", "slices", 20], "Queso crema": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 15], "Proteína whey en polvo (aprox.)": ["scoop", "scoops", "scoop", "scoops", 30], "Almendras": ["puñado", "puñados", "handful", "handfuls", 30], "Nueces": ["puñado", "puñados", "handful", "handfuls", 30], "Maní tostado": ["puñado", "puñados", "handful", "handfuls", 30], "Castañas de cajú": ["puñado", "puñados", "handful", "handfuls", 30], "Pistachos": ["puñado", "puñados", "handful", "handfuls", 30], "Mix de frutos secos": ["puñado", "puñados", "handful", "handfuls", 30], "Mantequilla de maní": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 16], "Semillas de chía": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 12], "Linaza": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 10], "Aceite de oliva": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 13], "Aceite vegetal": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 13], "Mantequilla": ["cucharadita", "cucharaditas", "teaspoon", "teaspoons", 5], "Margarina": ["cucharadita", "cucharaditas", "teaspoon", "teaspoons", 5], "Mayonesa": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 14], "Mayonesa light": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 14], "Ketchup": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 17], "Mostaza": ["cucharadita", "cucharaditas", "teaspoon", "teaspoons", 5], "Salsa de soya": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 16], "Crema de leche": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 15], "Jugo de naranja natural": ["vaso", "vasos", "glass", "glasses", 250], "Néctar de fruta": ["vaso", "vasos", "glass", "glasses", 250], "Bebida cola": ["lata", "latas", "can", "cans", 350], "Bebida cola zero": ["lata", "latas", "can", "cans", 350], "Bebida isotónica": ["botella", "botellas", "bottle", "bottles", 500], "Café negro": ["taza", "tazas", "cup", "cups", 240], "Café con leche": ["taza", "tazas", "cup", "cups", 250], "Té": ["taza", "tazas", "cup", "cups", 240], "Cerveza": ["lata", "latas", "can", "cans", 350], "Vino tinto": ["copa", "copas", "glass", "glasses", 150], "Pisco sour": ["vaso", "vasos", "glass", "glasses", 120], "Mote con huesillo": ["vaso", "vasos", "glass", "glasses", 300], "Empanada de pino": ["empanada", "empanadas", "empanada", "empanadas", 220], "Empanada de queso frita": ["empanada", "empanadas", "empanada", "empanadas", 100], "Completo italiano": ["completo", "completos", "hot dog", "hot dogs", 250], "Churrasco italiano": ["sándwich", "sándwiches", "sandwich", "sandwiches", 300], "Barros Luco": ["sándwich", "sándwiches", "sandwich", "sandwiches", 250], "Sándwich de jamón y queso": ["sándwich", "sándwiches", "sandwich", "sandwiches", 150], "Humita": ["humita", "humitas", "humita", "humitas", 200], "Sopaipilla": ["sopaipilla", "sopaipillas", "sopaipilla", "sopaipillas", 50], "Pizza de queso": ["trozo", "trozos", "slice", "slices", 110], "Pizza de pepperoni": ["trozo", "trozos", "slice", "slices", 110], "Hamburguesa con queso": ["hamburguesa", "hamburguesas", "burger", "burgers", 180], "Pollo apanado (nuggets)": ["nugget", "nuggets", "nugget", "nuggets", 17], "Sushi (roll)": ["pieza", "piezas", "piece", "pieces", 25], "Milanesa de vacuno": ["milanesa", "milanesas", "cutlet", "cutlets", 150], "Cazuela de vacuno": ["plato", "platos", "bowl", "bowls", 500], "Cazuela de ave": ["plato", "platos", "bowl", "bowls", 500], "Porotos con riendas": ["plato", "platos", "plate", "plates", 350], "Porotos granados": ["plato", "platos", "plate", "plates", 350], "Lentejas guisadas": ["plato", "platos", "plate", "plates", 350], "Pastel de choclo": ["porción", "porciones", "serving", "servings", 350], "Charquicán": ["plato", "platos", "plate", "plates", 350], "Pollo con arroz": ["plato", "platos", "plate", "plates", 400], "Tallarines con salsa boloñesa": ["plato", "platos", "plate", "plates", 350], "Lasaña": ["porción", "porciones", "serving", "servings", 300], "Arroz chaufa": ["plato", "platos", "plate", "plates", 300], "Papas fritas": ["porción", "porciones", "serving", "servings", 120], "Galletas con chips de chocolate": ["galleta", "galletas", "cookie", "cookies", 15], "Galletas de mantequilla": ["galleta", "galletas", "cookie", "cookies", 8], "Barra de cereal": ["barra", "barras", "bar", "bars", 25], "Barra de proteína": ["barra", "barras", "bar", "bars", 50], "Alfajor": ["alfajor", "alfajores", "alfajor", "alfajores", 50], "Calzones rotos": ["unidad", "unidades", "piece", "pieces", 40], "Berlín": ["berlín", "berlines", "doughnut", "doughnuts", 90], "Donut glaseada": ["donut", "donuts", "doughnut", "doughnuts", 60], "Queque": ["trozo", "trozos", "slice", "slices", 60], "Torta de chocolate": ["trozo", "trozos", "slice", "slices", 100], "Kuchen de manzana": ["trozo", "trozos", "slice", "slices", 100], "Pan de pascua": ["trozo", "trozos", "slice", "slices", 60], "Helado de crema": ["bola", "bolas", "scoop", "scoops", 70], "Azúcar": ["cucharadita", "cucharaditas", "teaspoon", "teaspoons", 5], "Miel": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 20], "Mermelada": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 15], "Manjar": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 20], "Leche condensada": ["cucharada", "cucharadas", "tablespoon", "tablespoons", 20], "Chocolate de leche": ["cuadrito", "cuadritos", "square", "squares", 5], "Chocolate amargo 70%": ["cuadrito", "cuadritos", "square", "squares", 5]};
/* Alimentos básicos (232): por 100 g (bebidas por 100 ml). Valores de referencia; los marcados con 1 son promedios aproximados. */
const CATS={fruta:tr("Frutas","Fruits"),verdura:tr("Verduras","Vegetables"),cereal:tr("Panes, cereales y papas","Bread, grains & potatoes"),carne:tr("Carnes y aves","Meat & poultry"),pescado:tr("Pescados y mariscos","Fish & seafood"),lacteo:tr("Huevos y lácteos","Eggs & dairy"),legumbre:tr("Legumbres y soya","Legumes & soy"),frutos:tr("Frutos secos y semillas","Nuts & seeds"),grasa:tr("Aceites, grasas y salsas","Oils, fats & sauces"),bebida:tr("Bebidas","Drinks"),plato:tr("Platos y comida preparada","Meals & prepared food"),snack:tr("Snacks y dulces","Snacks & sweets")};
const BASE=[
 ["fruta", "Manzana", "Apple", 52, 0.3, 13.8, 0.2, 150, 0],
 ["fruta", "Plátano", "Banana", 89, 1.1, 22.8, 0.3, 120, 0],
 ["fruta", "Naranja", "Orange", 47, 0.9, 11.8, 0.1, 150, 0],
 ["fruta", "Mandarina", "Tangerine", 53, 0.8, 13.3, 0.3, 80, 0],
 ["fruta", "Pera", "Pear", 57, 0.4, 15.2, 0.1, 170, 0],
 ["fruta", "Durazno", "Peach", 39, 0.9, 9.5, 0.3, 150, 0],
 ["fruta", "Damasco", "Apricot", 48, 1.4, 11.1, 0.4, 35, 0],
 ["fruta", "Ciruela", "Plum", 46, 0.7, 11.4, 0.3, 65, 0],
 ["fruta", "Uva", "Grapes", 69, 0.7, 18.1, 0.2, 100, 0],
 ["fruta", "Frutilla", "Strawberries", 32, 0.7, 7.7, 0.3, 150, 0],
 ["fruta", "Arándanos", "Blueberries", 57, 0.7, 14.5, 0.3, 100, 0],
 ["fruta", "Frambuesas", "Raspberries", 52, 1.2, 11.9, 0.7, 100, 0],
 ["fruta", "Cerezas", "Cherries", 63, 1.1, 16, 0.2, 100, 0],
 ["fruta", "Kiwi", "Kiwi", 61, 1.1, 14.7, 0.5, 75, 0],
 ["fruta", "Piña", "Pineapple", 50, 0.5, 13.1, 0.1, 150, 0],
 ["fruta", "Mango", "Mango", 60, 0.8, 15, 0.4, 200, 0],
 ["fruta", "Papaya", "Papaya", 43, 0.5, 10.8, 0.3, 150, 0],
 ["fruta", "Sandía", "Watermelon", 30, 0.6, 7.6, 0.2, 280, 0],
 ["fruta", "Melón", "Cantaloupe", 34, 0.8, 8.2, 0.2, 200, 0],
 ["fruta", "Chirimoya", "Cherimoya", 75, 1.6, 17.7, 0.7, 150, 0],
 ["fruta", "Higo", "Fig", 74, 0.8, 19.2, 0.3, 50, 0],
 ["fruta", "Granada", "Pomegranate", 83, 1.7, 18.7, 1.2, 100, 0],
 ["fruta", "Limón", "Lemon", 29, 1.1, 9.3, 0.3, 60, 0],
 ["fruta", "Palta", "Avocado", 160, 2, 8.5, 14.7, 60, 0],
 ["fruta", "Pasas", "Raisins", 299, 3.1, 79.2, 0.5, 30, 0],
 ["fruta", "Dátiles", "Dates", 277, 1.8, 75, 0.2, 24, 0],
 ["verdura", "Tomate", "Tomato", 18, 0.9, 3.9, 0.2, 120, 0],
 ["verdura", "Lechuga", "Lettuce", 15, 1.4, 2.9, 0.2, 50, 0],
 ["verdura", "Zanahoria", "Carrot", 41, 0.9, 9.6, 0.2, 80, 0],
 ["verdura", "Brócoli cocido", "Cooked broccoli", 35, 2.4, 7.2, 0.4, 100, 0],
 ["verdura", "Brócoli crudo", "Raw broccoli", 34, 2.8, 6.6, 0.4, 90, 0],
 ["verdura", "Coliflor", "Cauliflower", 25, 1.9, 5, 0.3, 100, 0],
 ["verdura", "Espinaca", "Spinach", 23, 2.9, 3.6, 0.4, 30, 0],
 ["verdura", "Acelga", "Swiss chard", 19, 1.8, 3.7, 0.2, 100, 0],
 ["verdura", "Pepino", "Cucumber", 15, 0.7, 3.6, 0.1, 100, 0],
 ["verdura", "Pimentón rojo", "Red bell pepper", 31, 1, 6, 0.3, 120, 0],
 ["verdura", "Cebolla", "Onion", 40, 1.1, 9.3, 0.1, 100, 0],
 ["verdura", "Ajo", "Garlic", 149, 6.4, 33, 0.5, 5, 0],
 ["verdura", "Zapallo italiano", "Zucchini", 17, 1.2, 3.1, 0.3, 150, 0],
 ["verdura", "Zapallo", "Pumpkin", 26, 1, 6.5, 0.1, 150, 0],
 ["verdura", "Choclo cocido", "Cooked sweet corn", 96, 3.4, 21, 1.5, 150, 0],
 ["verdura", "Arvejas cocidas", "Cooked green peas", 84, 5.4, 15.6, 0.2, 80, 0],
 ["verdura", "Porotos verdes cocidos", "Cooked green beans", 35, 1.9, 7.9, 0.3, 100, 0],
 ["verdura", "Champiñones", "Mushrooms", 22, 3.1, 3.3, 0.3, 70, 0],
 ["verdura", "Betarraga cocida", "Cooked beets", 44, 1.7, 10, 0.2, 100, 0],
 ["verdura", "Repollo", "Cabbage", 25, 1.3, 5.8, 0.1, 90, 0],
 ["verdura", "Apio", "Celery", 16, 0.7, 3, 0.2, 40, 0],
 ["verdura", "Espárragos cocidos", "Cooked asparagus", 22, 2.4, 4.1, 0.2, 90, 0],
 ["verdura", "Berenjena cocida", "Cooked eggplant", 35, 0.8, 8.7, 0.2, 100, 0],
 ["verdura", "Alcachofa cocida", "Cooked artichoke", 53, 2.9, 11.4, 0.3, 120, 0],
 ["verdura", "Rúcula", "Arugula", 25, 2.6, 3.7, 0.7, 20, 0],
 ["cereal", "Arroz blanco cocido", "Cooked white rice", 130, 2.7, 28.2, 0.3, 150, 0],
 ["cereal", "Arroz integral cocido", "Cooked brown rice", 123, 2.7, 25.6, 1, 150, 0],
 ["cereal", "Arroz blanco crudo", "Uncooked white rice", 365, 7.1, 80, 0.7, 75, 0],
 ["cereal", "Fideos cocidos", "Cooked pasta", 158, 5.8, 31, 0.9, 180, 0],
 ["cereal", "Fideos crudos", "Dry pasta", 371, 13, 75, 1.5, 80, 0],
 ["cereal", "Quinoa cocida", "Cooked quinoa", 120, 4.4, 21.3, 1.9, 150, 0],
 ["cereal", "Cuscús cocido", "Cooked couscous", 112, 3.8, 23.2, 0.2, 150, 0],
 ["cereal", "Mote de trigo cocido", "Cooked wheat berries (mote)", 125, 4.5, 26, 0.6, 150, 1],
 ["cereal", "Avena en hojuelas", "Rolled oats", 389, 16.9, 66.3, 6.9, 40, 0],
 ["cereal", "Avena cocida con agua", "Oatmeal (cooked with water)", 71, 2.5, 12, 1.5, 240, 0],
 ["cereal", "Granola", "Granola", 471, 10, 64, 20, 45, 0],
 ["cereal", "Cereal de maíz (corn flakes)", "Corn flakes", 357, 7.5, 84, 0.4, 30, 0],
 ["cereal", "Marraqueta", "Marraqueta (Chilean bread roll)", 276, 8.5, 56, 1.5, 100, 0],
 ["cereal", "Hallulla", "Hallulla (Chilean flatbread)", 300, 8.5, 56, 5, 80, 0],
 ["cereal", "Pan amasado", "Pan amasado (Chilean homemade bread)", 310, 8, 52, 7, 100, 1],
 ["cereal", "Pan de molde blanco", "White sandwich bread", 266, 8.9, 49, 3.3, 27, 0],
 ["cereal", "Pan de molde integral", "Whole wheat sandwich bread", 250, 12, 43, 3.5, 30, 0],
 ["cereal", "Pan pita", "Pita bread", 275, 9.1, 55.7, 1.2, 60, 0],
 ["cereal", "Pan de hamburguesa", "Hamburger bun", 279, 9.3, 49, 4.3, 50, 0],
 ["cereal", "Tortilla de trigo", "Flour tortilla", 312, 8.3, 51, 8, 40, 0],
 ["cereal", "Tortilla de maíz", "Corn tortilla", 218, 5.7, 44.6, 2.9, 26, 0],
 ["cereal", "Galletas de agua", "Saltine crackers", 418, 9.5, 71.5, 8.6, 25, 0],
 ["cereal", "Harina de trigo", "Wheat flour", 364, 10.3, 76.3, 1, 30, 0],
 ["cereal", "Papa cocida", "Boiled potato", 87, 1.9, 20.1, 0.1, 150, 0],
 ["cereal", "Puré de papas", "Mashed potatoes", 113, 1.9, 16.8, 4.2, 200, 0],
 ["cereal", "Camote cocido", "Cooked sweet potato", 90, 2, 20.7, 0.2, 150, 0],
 ["cereal", "Ñoquis cocidos", "Cooked gnocchi", 133, 3.3, 27, 0.6, 200, 1],
 ["carne", "Pechuga de pollo a la plancha", "Grilled chicken breast", 165, 31, 0, 3.6, 150, 0],
 ["carne", "Pechuga de pollo cruda", "Raw chicken breast", 120, 22.5, 0, 2.6, 150, 0],
 ["carne", "Trutro de pollo asado con piel", "Roast chicken thigh with skin", 229, 23.3, 0, 14.7, 120, 0],
 ["carne", "Pollo asado con piel", "Roast chicken with skin", 239, 27.3, 0, 13.6, 150, 0],
 ["carne", "Pavo pechuga cocida", "Cooked turkey breast", 147, 30, 0, 2.1, 150, 0],
 ["carne", "Carne de vacuno magra cocida", "Cooked lean beef", 190, 29, 0, 8, 150, 0],
 ["carne", "Carne molida 10% grasa cocida", "Cooked ground beef (90% lean)", 217, 26.1, 0, 11.7, 120, 0],
 ["carne", "Carne molida 20% grasa cocida", "Cooked ground beef (80% lean)", 272, 25.6, 0, 17.9, 120, 0],
 ["carne", "Lomo vetado cocido", "Cooked ribeye steak", 291, 23.8, 0, 21.8, 200, 0],
 ["carne", "Filete de vacuno cocido", "Cooked beef tenderloin", 210, 29, 0, 10, 150, 0],
 ["carne", "Hígado de vacuno cocido", "Cooked beef liver", 191, 29, 5.1, 5.3, 100, 0],
 ["carne", "Lomo de cerdo cocido", "Cooked pork loin", 196, 27.3, 0, 8.9, 150, 0],
 ["carne", "Chuleta de cerdo cocida", "Cooked pork chop", 231, 26.8, 0, 13, 150, 0],
 ["carne", "Costillar de cerdo cocido", "Cooked pork ribs", 361, 26, 0, 28, 200, 1],
 ["carne", "Cordero cocido", "Cooked lamb", 294, 24.5, 0, 20.9, 150, 0],
 ["carne", "Tocino cocido", "Cooked bacon", 541, 37, 1.4, 42, 15, 0],
 ["carne", "Jamón de pavo", "Turkey ham", 110, 18, 2, 3, 30, 0],
 ["carne", "Jamón de cerdo", "Pork ham", 145, 18, 2, 7, 30, 0],
 ["carne", "Vienesa", "Hot dog sausage", 290, 10.3, 4.2, 26, 45, 0],
 ["carne", "Longaniza cocida", "Cooked pork sausage (longaniza)", 330, 18, 2, 27, 80, 1],
 ["carne", "Salame", "Salami", 336, 22.6, 2.4, 26, 20, 0],
 ["carne", "Mortadela", "Mortadella", 311, 16.4, 3, 25.4, 20, 0],
 ["pescado", "Atún en agua (escurrido)", "Tuna in water (drained)", 116, 26, 0, 1, 80, 0],
 ["pescado", "Atún en aceite (escurrido)", "Tuna in oil (drained)", 198, 29.1, 0, 8.2, 80, 0],
 ["pescado", "Salmón cocido", "Cooked salmon", 206, 22, 0, 12, 150, 0],
 ["pescado", "Salmón ahumado", "Smoked salmon", 117, 18.3, 0, 4.3, 50, 0],
 ["pescado", "Merluza cocida", "Cooked hake", 98, 20, 0, 1.9, 150, 0],
 ["pescado", "Reineta cocida", "Cooked pomfret (reineta)", 110, 20, 0, 3, 150, 1],
 ["pescado", "Congrio cocido", "Cooked kingklip (congrio)", 95, 19, 0, 1.7, 150, 1],
 ["pescado", "Tilapia cocida", "Cooked tilapia", 128, 26, 0, 2.7, 150, 0],
 ["pescado", "Jurel en lata", "Canned jack mackerel", 150, 22, 0, 7, 100, 1],
 ["pescado", "Sardinas en aceite (escurridas)", "Sardines in oil (drained)", 208, 24.6, 0, 11.5, 90, 0],
 ["pescado", "Camarones cocidos", "Cooked shrimp", 99, 24, 0.2, 0.3, 100, 0],
 ["pescado", "Choritos cocidos", "Cooked mussels", 172, 23.8, 7.4, 4.5, 100, 0],
 ["pescado", "Kanikama", "Imitation crab (surimi)", 95, 7.6, 15, 0.5, 85, 0],
 ["lacteo", "Huevo entero", "Whole egg", 143, 12.6, 0.7, 9.5, 50, 0],
 ["lacteo", "Clara de huevo", "Egg white", 52, 10.9, 0.7, 0.2, 33, 0],
 ["lacteo", "Huevo duro", "Hard-boiled egg", 155, 12.6, 1.1, 10.6, 50, 0],
 ["lacteo", "Huevo frito", "Fried egg", 196, 13.6, 0.8, 14.8, 46, 0],
 ["lacteo", "Huevos revueltos", "Scrambled eggs", 149, 10, 1.6, 11, 100, 0],
 ["lacteo", "Leche entera", "Whole milk", 61, 3.2, 4.8, 3.3, 200, 0],
 ["lacteo", "Leche semidescremada", "Reduced-fat milk", 46, 3.3, 4.9, 1.5, 200, 0],
 ["lacteo", "Leche descremada", "Skim milk", 34, 3.4, 5, 0.1, 200, 0],
 ["lacteo", "Leche con chocolate", "Chocolate milk", 83, 3.2, 10.3, 3.4, 200, 0],
 ["lacteo", "Yogur natural", "Plain yogurt", 61, 3.5, 4.7, 3.3, 125, 0],
 ["lacteo", "Yogur griego natural", "Plain Greek yogurt (nonfat)", 59, 10.2, 3.6, 0.4, 170, 0],
 ["lacteo", "Yogur con sabor", "Flavored yogurt", 95, 3.2, 16, 1.5, 125, 1],
 ["lacteo", "Yogur protein", "High-protein yogurt", 65, 10, 5, 0.3, 155, 1],
 ["lacteo", "Queso gauda", "Gouda cheese", 356, 25, 2.2, 27.4, 20, 0],
 ["lacteo", "Queso mantecoso", "Mantecoso cheese", 340, 23, 1, 27, 20, 1],
 ["lacteo", "Quesillo", "Quesillo (Chilean fresh cheese)", 180, 16, 2.5, 11.5, 50, 1],
 ["lacteo", "Queso fresco", "Fresh cheese (queso fresco)", 299, 18, 3, 24, 30, 0],
 ["lacteo", "Queso cottage", "Cottage cheese", 98, 11.1, 3.4, 4.3, 110, 0],
 ["lacteo", "Queso crema", "Cream cheese", 342, 6, 4.1, 34, 30, 0],
 ["lacteo", "Queso mozzarella", "Mozzarella cheese", 280, 27.5, 3.1, 17.1, 30, 0],
 ["lacteo", "Queso parmesano", "Parmesan cheese", 431, 38, 4.1, 29, 10, 0],
 ["lacteo", "Proteína whey en polvo (aprox.)", "Whey protein powder (approx.)", 390, 78, 8, 6, 30, 1],
 ["legumbre", "Lentejas cocidas", "Cooked lentils", 116, 9, 20, 0.4, 180, 0],
 ["legumbre", "Porotos cocidos", "Cooked beans", 127, 8.7, 22.8, 0.5, 180, 0],
 ["legumbre", "Porotos negros cocidos", "Cooked black beans", 132, 8.9, 23.7, 0.5, 180, 0],
 ["legumbre", "Garbanzos cocidos", "Cooked chickpeas", 164, 8.9, 27.4, 2.6, 180, 0],
 ["legumbre", "Hummus", "Hummus", 166, 7.9, 14.3, 9.6, 30, 0],
 ["legumbre", "Tofu firme", "Firm tofu", 144, 17.3, 2.8, 8.7, 100, 0],
 ["legumbre", "Edamame", "Edamame", 121, 11.9, 8.9, 5.2, 100, 0],
 ["frutos", "Almendras", "Almonds", 579, 21, 22, 50, 30, 0],
 ["frutos", "Nueces", "Walnuts", 654, 15, 14, 65, 30, 0],
 ["frutos", "Maní tostado", "Roasted peanuts", 585, 23.7, 21.5, 49.7, 30, 0],
 ["frutos", "Mantequilla de maní", "Peanut butter", 588, 25, 20, 50, 16, 0],
 ["frutos", "Castañas de cajú", "Cashews", 574, 15.3, 32.7, 46.4, 30, 0],
 ["frutos", "Pistachos", "Pistachios", 562, 20.2, 27.2, 45.3, 30, 0],
 ["frutos", "Avellanas", "Hazelnuts", 628, 15, 16.7, 60.8, 30, 0],
 ["frutos", "Semillas de chía", "Chia seeds", 486, 16.5, 42.1, 30.7, 15, 0],
 ["frutos", "Linaza", "Flaxseed", 534, 18.3, 28.9, 42.2, 10, 0],
 ["frutos", "Semillas de maravilla", "Sunflower seeds", 584, 20.8, 20, 51.5, 30, 0],
 ["frutos", "Semillas de zapallo", "Pumpkin seeds", 559, 30.2, 10.7, 49, 30, 0],
 ["frutos", "Coco rallado", "Shredded coconut (unsweetened)", 660, 6.9, 23.7, 64.5, 10, 0],
 ["frutos", "Mix de frutos secos", "Trail mix", 480, 14, 45, 29, 40, 1],
 ["grasa", "Aceite de oliva", "Olive oil", 884, 0, 0, 100, 10, 0],
 ["grasa", "Aceite vegetal", "Vegetable oil", 884, 0, 0, 100, 10, 0],
 ["grasa", "Mantequilla", "Butter", 717, 0.9, 0.1, 81, 10, 0],
 ["grasa", "Margarina", "Margarine", 717, 0.2, 0.7, 80, 10, 0],
 ["grasa", "Mayonesa", "Mayonnaise", 680, 1, 0.6, 75, 15, 0],
 ["grasa", "Mayonesa light", "Light mayonnaise", 300, 0.8, 8, 30, 15, 1],
 ["grasa", "Crema de leche", "Heavy cream", 340, 2.8, 2.7, 36, 15, 0],
 ["grasa", "Ketchup", "Ketchup", 101, 1, 27.4, 0.1, 15, 0],
 ["grasa", "Mostaza", "Mustard", 60, 3.7, 5.3, 3.3, 5, 0],
 ["grasa", "Salsa de soya", "Soy sauce", 53, 8.1, 4.9, 0.6, 15, 0],
 ["grasa", "Pebre", "Pebre (Chilean salsa)", 60, 1, 4, 4.5, 30, 1],
 ["bebida", "Jugo de naranja natural", "Fresh orange juice", 45, 0.7, 10.4, 0.2, 250, 0],
 ["bebida", "Néctar de fruta", "Fruit nectar", 54, 0.2, 13.5, 0, 250, 1],
 ["bebida", "Bebida cola", "Cola", 42, 0, 10.6, 0, 350, 0],
 ["bebida", "Bebida cola zero", "Diet cola", 1, 0.1, 0, 0, 350, 0],
 ["bebida", "Bebida isotónica", "Sports drink", 26, 0, 6.4, 0, 500, 0],
 ["bebida", "Café negro", "Black coffee", 1, 0.1, 0, 0, 240, 0],
 ["bebida", "Café con leche", "Coffee with milk (latte)", 42, 2.2, 3.4, 2.1, 250, 1],
 ["bebida", "Té", "Tea", 1, 0, 0.3, 0, 240, 0],
 ["bebida", "Cerveza", "Beer", 43, 0.5, 3.6, 0, 350, 0],
 ["bebida", "Vino tinto", "Red wine", 85, 0.1, 2.6, 0, 150, 0],
 ["bebida", "Pisco sour", "Pisco sour", 160, 0.6, 15, 0, 120, 1],
 ["bebida", "Mote con huesillo", "Mote con huesillo", 90, 1, 21, 0.2, 300, 1],
 ["plato", "Empanada de pino", "Baked beef empanada (pino)", 250, 9, 26, 12, 220, 1],
 ["plato", "Empanada de queso frita", "Fried cheese empanada", 330, 10, 30, 19, 100, 1],
 ["plato", "Completo italiano", "Chilean hot dog (avocado, tomato, mayo)", 240, 7, 20, 15, 250, 1],
 ["plato", "Churrasco italiano", "Steak sandwich (italiano)", 230, 12, 20, 11, 300, 1],
 ["plato", "Barros Luco", "Beef & cheese sandwich (Barros Luco)", 260, 14, 22, 13, 250, 1],
 ["plato", "Sándwich de jamón y queso", "Ham & cheese sandwich", 260, 14, 26, 11, 150, 1],
 ["plato", "Cazuela de vacuno", "Beef cazuela (stew)", 70, 5, 6, 2.8, 500, 1],
 ["plato", "Cazuela de ave", "Chicken cazuela (stew)", 65, 5, 6, 2.2, 500, 1],
 ["plato", "Porotos con riendas", "Beans with noodles (porotos con riendas)", 115, 5.5, 18, 2.3, 350, 1],
 ["plato", "Porotos granados", "Fresh bean stew (porotos granados)", 110, 5, 16, 3, 350, 1],
 ["plato", "Lentejas guisadas", "Lentil stew", 110, 6, 17, 2, 350, 1],
 ["plato", "Pastel de choclo", "Corn pie (pastel de choclo)", 150, 7, 17, 6, 350, 1],
 ["plato", "Charquicán", "Charquicán (beef & vegetable stew)", 95, 5, 10, 4, 350, 1],
 ["plato", "Humita", "Humita (corn tamale)", 140, 3.5, 22, 4.5, 200, 1],
 ["plato", "Sopaipilla", "Sopaipilla (fried pumpkin dough)", 330, 5, 40, 17, 50, 1],
 ["plato", "Arroz graneado", "Rice pilaf", 150, 2.7, 28, 3, 150, 1],
 ["plato", "Ensalada chilena", "Tomato & onion salad", 50, 0.9, 4.5, 3.2, 150, 1],
 ["plato", "Pollo con arroz", "Chicken with rice", 160, 11, 18, 4.5, 400, 1],
 ["plato", "Tallarines con salsa boloñesa", "Spaghetti bolognese", 130, 6.5, 17, 4, 350, 1],
 ["plato", "Lasaña", "Lasagna", 145, 8, 14, 6, 300, 1],
 ["plato", "Milanesa de vacuno", "Breaded beef cutlet", 260, 20, 13, 14, 150, 1],
 ["plato", "Pollo apanado (nuggets)", "Breaded chicken (nuggets)", 296, 15, 16.7, 19.8, 100, 0],
 ["plato", "Arroz chaufa", "Fried rice (chaufa)", 170, 5, 25, 5, 300, 1],
 ["plato", "Ceviche", "Ceviche", 80, 13, 4, 1, 200, 1],
 ["plato", "Sushi (roll)", "Sushi roll", 140, 4, 24, 3, 200, 1],
 ["plato", "Pizza de queso", "Cheese pizza", 266, 11.4, 33, 9.7, 110, 0],
 ["plato", "Pizza de pepperoni", "Pepperoni pizza", 290, 12, 30, 13, 110, 1],
 ["plato", "Hamburguesa con queso", "Cheeseburger", 263, 13, 24, 12.7, 180, 1],
 ["plato", "Papas fritas", "French fries", 312, 3.4, 41, 15, 120, 0],
 ["snack", "Chocolate de leche", "Milk chocolate", 535, 7.7, 59.4, 29.7, 25, 0],
 ["snack", "Chocolate amargo 70%", "Dark chocolate 70%", 598, 7.8, 45.9, 42.6, 20, 0],
 ["snack", "Galletas con chips de chocolate", "Chocolate chip cookies", 488, 5, 65, 24, 30, 0],
 ["snack", "Galletas de mantequilla", "Butter cookies", 467, 6, 68, 19, 30, 1],
 ["snack", "Papas fritas de bolsa", "Potato chips", 536, 7, 53, 35, 30, 0],
 ["snack", "Ramitas", "Salty snack sticks (ramitas)", 480, 7, 62, 22, 30, 1],
 ["snack", "Cabritas", "Popcorn", 500, 9, 57.2, 28.1, 30, 0],
 ["snack", "Barra de cereal", "Cereal bar", 400, 6, 70, 11, 25, 1],
 ["snack", "Barra de proteína", "Protein bar", 360, 30, 40, 10, 50, 1],
 ["snack", "Alfajor", "Alfajor", 430, 5, 62, 18, 50, 1],
 ["snack", "Calzones rotos", "Calzones rotos (fried dough)", 410, 6, 50, 20, 40, 1],
 ["snack", "Berlín", "Cream-filled doughnut (berlín)", 340, 6, 42, 16, 90, 1],
 ["snack", "Donut glaseada", "Glazed doughnut", 421, 5.2, 49, 23, 60, 0],
 ["snack", "Queque", "Pound cake", 389, 5.5, 49, 19, 60, 0],
 ["snack", "Torta de chocolate", "Chocolate cake", 367, 4.1, 54.6, 16.4, 100, 0],
 ["snack", "Kuchen de manzana", "Apple kuchen", 260, 3.5, 38, 10.5, 100, 1],
 ["snack", "Pan de pascua", "Pan de pascua (Chilean fruitcake)", 380, 6, 60, 13, 60, 1],
 ["snack", "Helado de crema", "Ice cream", 207, 3.5, 23.6, 11, 70, 0],
 ["snack", "Manjar", "Dulce de leche (manjar)", 315, 6.8, 55.4, 7.4, 20, 0],
 ["snack", "Leche condensada", "Sweetened condensed milk", 321, 7.9, 54.4, 8.7, 20, 0],
 ["snack", "Arroz con leche", "Rice pudding", 130, 3.3, 22, 3, 200, 1],
 ["snack", "Gomitas", "Gummy candies", 340, 5, 78, 0.1, 30, 1],
 ["snack", "Mermelada", "Jam", 250, 0.4, 63, 0.1, 15, 0],
 ["snack", "Azúcar", "Sugar", 387, 0, 100, 0, 5, 0],
 ["snack", "Miel", "Honey", 304, 0.3, 82, 0, 20, 0]
].map(([cat,name,nameEn,kcal,p,c,f,s,a])=>{const u=UNITS[name];return{key:"base-"+slug(name),name:EN?nameEn:name,cat,per100:{kcal,p,c,f},servingG:s,approx:!!a,ml:cat==="bebida",src:"referencia",unit:u?{s:EN?u[2]:u[0],p:EN?u[3]:u[1],g:u[4]}:null}});

/* ---------- utilidades ---------- */
function dstr(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function parseD(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=parseD(s);d.setDate(d.getDate()+n);return dstr(d)}
const today=()=>dstr(new Date());
const NF=new Intl.NumberFormat(LOC);
const fmt=n=>NF.format(Math.round(n||0));
const fmt1=n=>new Intl.NumberFormat(LOC,{maximumFractionDigits:1}).format(n||0);
const fmt2=n=>new Intl.NumberFormat(LOC,{maximumFractionDigits:2}).format(n||0);
const num=v=>{const n=parseFloat(String(v??"").replace(",","."));return isFinite(n)?n:0};
const r1=n=>Math.round((n||0)*10)/10;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function slug(s){return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)||"x"}
function mealNow(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;if(h<11)return"desayuno";if(h<16)return"almuerzo";if(h<18.5)return"snack";if(h<23)return"cena";return"snack"}
function normMeal(m){return MEAL_NAME[m]?m:"snack"}
function toast(msg){document.querySelectorAll(".toast").forEach(t=>t.remove());const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),Math.min(9000,2600+String(msg).length*35))}

/* ---------- almacenamiento en el teléfono ---------- */
const P="bocado:";
function lsGet(k){try{const v=localStorage.getItem(P+k);return v?JSON.parse(v):null}catch(e){return null}}
let warned=false,persisted=false;
function lsSet(k,v){
  try{localStorage.setItem(P+k,JSON.stringify(v))}
  catch(e){if(!warned){warned=true;toast(tr("No se pudo guardar: el almacenamiento del teléfono está lleno","Couldn't save: your phone's storage is full"))}}
  if(!persisted&&navigator.storage&&navigator.storage.persist){persisted=true;navigator.storage.persist().catch(()=>{})}
}
function day(d){
  d=d||S.date;
  if(!S.days[d]){const v=lsGet("day-"+d)||{};S.days[d]={entries:Array.isArray(v.entries)?v.entries:[],water:num(v.water),train:!!v.train}}
  return S.days[d];
}
function saveDay(d){d=d||S.date;const x=day(d);lsSet("day-"+d,{entries:x.entries,water:x.water,train:x.train})}
function saveProfile(){lsSet("profile",S.profile)}
function saveFoods(){
  const keys=Object.keys(S.foods);
  if(keys.length>1500){keys.sort((a,b)=>(S.foods[a].last||0)-(S.foods[b].last||0)).slice(0,keys.length-1500).forEach(k=>delete S.foods[k])}
  lsSet("foods",{items:S.foods});
}
function upsertFood(f){const old=S.foods[f.key]||{};S.foods[f.key]={...old,...f,uses:(old.uses||0)+1,last:Date.now()};saveFoods()}

/* ---------- cálculos ---------- */
const DAILY={sit:[1.2,tr("Mayormente sentado","Mostly sitting"),tr("Oficina, estudio o computador casi todo el día","Office, studying or at a computer most of the day")],mixed:[1.3,tr("De pie a ratos","On your feet at times"),tr("Alternas escritorio y moverte: turnos, atención, soporte","You alternate desk time and moving around: shifts, customer service, support")],walk:[1.4,tr("De pie y caminando","Standing and walking"),tr("Pasas gran parte del día de pie o caminando","You spend most of the day standing or walking")],physical:[1.55,tr("Trabajo físico","Physical work"),tr("Cargas peso o haces esfuerzo casi todo el día","You lift loads or do physical effort most of the day")]};
const TRAIN={"0":[0,tr("No entreno por ahora","I don't work out yet")],"1-2":[0.1,tr("1 a 2 días","1 to 2 days")],"3-4":[0.2,tr("3 a 4 días","3 to 4 days")],"5-6":[0.3,tr("5 a 6 días","5 to 6 days")],"7":[0.375,tr("Todos los días","Every day")]};
const TTYPE={fuerza:[tr("Pesas o fuerza","Weights or strength"),tr("Gimnasio, calistenia, máquinas","Gym, calisthenics, machines")],cardio:["Cardio",tr("Correr, bicicleta, nadar","Running, cycling, swimming")],mixto:[tr("Mixto o deportes","Mixed or sports"),tr("Fútbol, crossfit, combinación de ambos","Soccer, CrossFit, a mix of both")]};
const GOALT={lose:[tr("Perder grasa","Lose fat"),tr("Bajar de peso cuidando el músculo","Lose weight while keeping muscle")],maintain:[tr("Mantener mi peso","Maintain my weight"),tr("Comer equilibrado y mejorar la composición","Eat balanced and improve body composition")],gain:[tr("Ganar músculo","Build muscle"),tr("Subir de peso de forma limpia","Gain weight cleanly")]};
const PACE={lose:{slow:0.25,normal:0.5,fast:0.75},gain:{slow:0.15,normal:0.25,fast:0.4}};
const PACE_LABEL={slow:tr("Tranquilo","Relaxed"),normal:tr("Recomendado","Recommended"),fast:tr("Rápido","Fast")};
function calcPlan(p){
  if(!(p.weight>0&&p.height>0&&p.age>0&&p.sex))return null;
  const bmr=10*p.weight+6.25*p.height-5*p.age+(p.sex==="m"?-161:5);
  const pal=p.onboarded?Math.min(1.9,(DAILY[p.daily]||DAILY.mixed)[0]+(TRAIN[p.train]||TRAIN["0"])[0]):(p.activity||1.55);
  const tdee=bmr*pal;
  const gt=p.onboarded?(p.goalType||"maintain"):(p.goal>0?"gain":p.goal<0?"lose":"maintain");
  const kgWeek=p.onboarded&&gt!=="maintain"?PACE[gt][p.pace||"normal"]:0;
  const adj=p.onboarded?(gt==="lose"?-1:gt==="gain"?1:0)*kgWeek*7700/7:(p.goal||0);
  let kcal=tdee+adj,floored=false;
  const floor=Math.max(bmr,p.sex==="m"?1200:1500);
  if(kcal<floor){kcal=floor;floored=true}
  kcal=Math.round(kcal/10)*10;
  const bmi=p.weight/Math.pow(p.height/100,2);
  const refW=bmi>30?25*Math.pow(p.height/100,2):p.weight;
  const strength=!p.onboarded||p.trainType==="fuerza"||p.trainType==="mixto";
  let ppk=gt==="lose"?(strength?2.2:1.8):gt==="gain"?(strength?2:1.6):(strength?1.8:1.4);
  if(p.onboarded&&p.train==="0")ppk=Math.min(ppk,1.6);
  const pro=Math.round(refW*ppk);
  const fat=Math.round(Math.max(0.8*refW,kcal*0.25/9));
  const carb=Math.max(0,Math.round((kcal-pro*4-fat*9)/4));
  const water=Math.round(p.weight*35/50)*50;
  let weeks=null,eta=null;
  if(kgWeek&&p.targetWeight){
    const diff=Math.abs(p.targetWeight-p.weight),realKg=floored?Math.abs(tdee-kcal)*7/7700:kgWeek;
    if(diff>0.05&&realKg>0){weeks=Math.ceil(diff/realKg);eta=new Date();eta.setDate(eta.getDate()+weeks*7)}
  }
  return{bmr:Math.round(bmr),pal,tdee:Math.round(tdee/10)*10,kcal,adj:Math.round(adj),pro,fat,carb,water,bmi,goalType:gt,kgWeek,weeks,eta,floored,ppk};
}
function targets(p){return calcPlan(p)}
function calcPlanTdee(p){const bmr=10*p.weight+6.25*p.height-5*p.age+(p.sex==="m"?-161:5);return bmr*Math.min(1.9,(DAILY[p.daily]||DAILY.mixed)[0]+(TRAIN[p.train]||TRAIN["0"])[0])}
const monthYear=d=>new Intl.DateTimeFormat(LOC,{month:"long",year:"numeric"}).format(d);
function totals(entries){return entries.reduce((a,e)=>({kcal:a.kcal+num(e.kcal),p:a.p+num(e.p),c:a.c+num(e.c),f:a.f+num(e.f)}),{kcal:0,p:0,c:0,f:0})}
function fromPer100(per,g){return {kcal:Math.round(per.kcal*g/100),p:r1(per.p*g/100),c:r1(per.c*g/100),f:r1(per.f*g/100)}}
function per100Of(x,g){return g>0?{kcal:x.kcal/g*100,p:x.p/g*100,c:x.c/g*100,f:x.f/g*100}:{kcal:0,p:0,c:0,f:0}}
function suspicious(per){const calc=per.p*4+per.c*4+per.f*9;return calc>25&&Math.abs(per.kcal-calc)/calc>0.35}
function tableHTML(per,servingG,eaten,u,youLabel,servLabel){u=u||"g";
  const row=(label,g,you)=>{const x=fromPer100(per,g),c=you?"you":"";
    return `<div class="rl ${c}">${label}</div><div class="${c}">${fmt(x.kcal)}</div><div class="${c}">${fmt1(x.p)}</div><div class="${c}">${fmt1(x.c)}</div><div class="${c}">${fmt1(x.f)}</div>`};
  return `<div class="h rl">${tr("Cantidad","Amount")}</div><div class="h">kcal</div><div class="h">Prot</div><div class="h">Carb</div><div class="h">${tr("Grasa","Fat")}</div>`+
    row("100 "+u,100)+(servingG&&(servLabel||Math.round(servingG)!==100)?row(servLabel||`${tr("Porción","Serving")} ${fmt1(servingG)} ${u}`,servingG):"")+
    (eaten>0?row(youLabel?`${tr("Comiste","You ate")} ${youLabel}`:`${tr("Comiste","You ate")} ${fmt1(eaten)} ${u}`,eaten,true):"");
}

/* ---------- íconos ---------- */
const IC={
  left:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  right:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  barcode:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 8v8M10 8v8M13 8v8M15.5 8v8M18 8v8"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>',
  pencil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19z"/></svg>',
  text:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 6h14M5 11h14M5 16h9"/></svg>',
  keys:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5z"/></svg>',
  ruler:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="8" width="19" height="8" rx="2"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/></svg>',
  drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l1.9 5.4L19 10l-5.1 1.6L12 17l-1.9-5.4L5 10l5.1-1.6z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>',
  logo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-5.3-7.5 3 3 0 0 0 4.8 3.9c.3 1.1.5 2.3.5 3.6z"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/></svg>',
  db:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 13h9l1-13"/></svg>',
};

/* ---------- render ---------- */
function render(){
  $("#viewHoy").hidden=S.tab!=="hoy";$("#viewYo").hidden=S.tab!=="yo";$("#viewPeso").hidden=S.tab!=="peso";$("#viewAj").hidden=S.tab!=="aj";
  document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-current",b.dataset.tab===S.tab?"page":"false"));
  if(S.tab==="hoy") renderHoy(); else if(S.tab==="peso") renderPeso(); else if(S.tab==="aj") renderAjustes(); else renderYo();
}
function dateTitle(d){
  const t=today();
  if(d===t) return tr("Hoy","Today");
  if(d===addDays(t,-1)) return tr("Ayer","Yesterday");
  return new Intl.DateTimeFormat(LOC,{weekday:"long",day:"numeric",month:"short"}).format(parseD(d)).replace(".","");
}
function renderHoy(){
  const p=S.profile,t=targets(p),d=day(),tot=totals(d.entries);
  const isToday=S.date===today();
  const sub=new Intl.DateTimeFormat(LOC,{weekday:"long",day:"numeric",month:"long"}).format(parseD(S.date));
  const goalK=t?t.kcal:0,left=goalK-tot.kcal,over=t&&left<0;
  const pct=t?Math.min(100,tot.kcal/goalK*100):0;
  const mac=[["p",tr("Proteína","Protein"),t&&t.pro,"var(--pro)"],["c",tr("Carbos","Carbs"),t&&t.carb,"var(--carb)"],["f",tr("Grasa","Fat"),t&&t.fat,"var(--fat)"]].map(([k,l,goal,col])=>{
    const v=tot[k],w=goal?Math.min(100,v/goal*100):0;
    return `<div class="macro"><span class="label"><span class="dot" style="background:${col}"></span>${l}</span>
      <div style="margin-top:6px"><span class="num">${fmt(v)}</span><span class="of"> / ${goal?fmt(goal):"—"} g</span></div>
      <div class="track"><i style="width:${w}%;background:${col}"></i></div></div>`;
  }).join("");
  const status=!t?`<span>${tr("Aún no tienes una meta","No goal yet")}</span>`
    :over?`<span style="color:var(--pro)">${tr("Te pasaste","Over by")} <b style="color:inherit">${fmt(-left)}</b> kcal</span><span>${fmt(tot.kcal/goalK*100)} %</span>`
    :`<span>${tr("Te faltan","Remaining:")} <b>${fmt(left)}</b> kcal</span><span>${fmt(pct)} %</span>`;
  const hero=`<section class="card hero">
    <span class="label">${isToday?tr("Consumido hoy","Eaten today"):tr("Consumido ese día","Eaten that day")}</span>
    <div class="big ${over?"over":""}"><span class="num">${fmt(tot.kcal)}</span><span class="goal num">/ ${t?fmt(goalK):"—"}</span><small>kcal</small></div>
    <div class="track" style="margin-top:14px"><i style="width:${pct}%;${over?"background:var(--pro)":""}"></i></div>
    <div class="kline">${status}</div>
    ${!t?`<button class="btn" style="margin:6px 0" data-act="onb">${tr("Hacer el test para calcular tu meta","Take the quiz to set your goal")}</button>`:""}
    <div class="macros">${mac}</div>
  </section>`;
  const wTarget=(t?t.water:2500)+(d.train?500:0);
  const glass=p.glass||(IMP?237:250);
  const n=Math.min(18,Math.ceil(wTarget/glass));
  const filled=Math.round(d.water/glass);
  const glasses=Array.from({length:Math.max(n,filled)},(_,i)=>`<button class="glass ${i<filled?"on":""}" data-act="glass" data-i="${i}" aria-label="${tr("Vaso","Glass")} ${i+1} · ${IMP?Math.round(glass*ML2OZ)+" oz":glass+" ml"}"></button>`).join("");
  const water=`<section class="card">
    <div class="spread"><span class="label">${tr("Agua","Water")}</span><span class="muted" style="font-size:13px"><b class="num" style="font-size:22px;color:var(--ink)">${fmtWater(d.water)}</b> / ${fmtWater(wTarget)} ${waterUnit}</span></div>
    <div class="glasses">${glasses}</div>
    <div class="spread"><button class="toggle" data-act="train" aria-pressed="${d.train?"true":"false"}"><span class="sw"></span>${IMP?tr("Día de entreno (+17 oz)","Workout day (+17 oz)"):tr("Día de entreno (+0,5 L)","Workout day (+0.5 L)")}</button>
      <div class="pm"><button data-act="water" data-d="-1" aria-label="${tr("Quitar un vaso","Remove a glass")}">−</button><button data-act="water" data-d="1" aria-label="${tr("Agregar un vaso","Add a glass")}">+</button></div></div>
  </section>`;
  const meals=MEALS.map(([k,l])=>{
    const es=d.entries.filter(e=>normMeal(e.meal)===k);
    const kc=es.reduce((a,e)=>a+num(e.kcal),0);
    const rows=es.map(e=>`<button class="entry" data-act="entry" data-id="${esc(e.id)}"><div><div class="nm">${esc(e.name)}</div><div class="sub">${[e.units?fmtN(e.units)+" "+(Math.abs(e.units-1)<1e-9?e.uS:e.uP):"",`${fmt(e.grams)} ${e.ml?"ml":"g"}`,`P ${fmt(e.p)}`,`C ${fmt(e.c)}`,`${tr("G","F")} ${fmt(e.f)}`].filter(Boolean).map(x=>esc(x).replace(/ /g,"\u00a0")).join(" · ")}</div></div><span class="kc">${fmt(e.kcal)}</span></button>`).join("");
    return `<div class="meal${es.length?"":" none"}"><div class="mealhead"><h3>${l}${kc?`<span class="k">${fmt(kc)} kcal</span>`:""}</h3><div class="mbtns"><button class="addmini icon" data-act="mhist" data-meal="${k}" aria-label="${tr("Buscar en lo que has comido en","Search what you've eaten for")} ${l}">${IC.search}</button><button class="addmini" data-act="add" data-meal="${k}" aria-label="${tr("Añadir a","Add to")} ${l}">${IC.plus}${tr("Añadir","Add")}</button></div></div>${rows?`<div class="mrows">${rows}</div>`:""}</div>`;
  }).join("");
  $("#viewHoy").innerHTML=`
    <header class="top">
      <button class="iconbtn" data-act="day" data-d="-1" aria-label="${tr("Día anterior","Previous day")}">${IC.left}</button>
      <div><span class="label">${esc(sub)}</span><h1>${esc(dateTitle(S.date))}</h1></div>
      <button class="iconbtn" data-act="day" data-d="1" aria-label="${tr("Día siguiente","Next day")}" ${isToday?"disabled":""}>${IC.right}</button>
    </header>
    <div class="stack">${hero}${water}<section class="meals">${meals}</section>
    ${!isToday?`<button class="btn ghost" data-act="gotoday">${tr("Volver a hoy","Back to today")}</button>`:""}</div>`;
}
function avatarSVG(o){
  const h=o.height||170,w=o.weight||22*Math.pow(h/100,2);
  const bmi=w/Math.pow(h/100,2);
  const k=Math.max(.82,Math.min(1.4,1+(bmi-22)*0.045));
  const fem=o.sex==="m",mus=o.muscle?1.1:1;
  const cx=72,sh=(fem?22:26)*k*mus,waist=(fem?15.5:18.5)*k,hip=(fem?23:19)*k,arm=8.5*k*(o.muscle?1.18:1),leg=11*k*(o.muscle?1.06:1);
  const torso=`M${cx-sh} 64 Q${cx-sh} 56 ${cx-sh+8} 56 L${cx+sh-8} 56 Q${cx+sh} 56 ${cx+sh} 64 L${cx+waist} 100 L${cx+hip} 128 L${cx-hip} 128 L${cx-waist} 100 Z`;
  const col=o.color||"var(--accent)";
  const ruler=o.ruler!==false?Array.from({length:11},(_,i)=>{const y=12+i*20.4,long=i%5===0;return `<line x1="8" x2="${long?20:15}" y1="${y}" y2="${y}" stroke="var(--muted)" stroke-width="1"/>`}).join("")+`<line x1="8" x2="8" y1="12" y2="216" stroke="var(--muted)" stroke-width="1"/><text x="22" y="10" font-family="Geist Mono, monospace" font-size="9" fill="var(--muted)">${o.height?fmtH(o.height):""}</text>`:"";
  return `<svg viewBox="0 0 132 240" role="img" aria-label="${esc(o.aria||tr("Figura proporcional a tu peso y altura","Figure proportional to your weight and height"))}">
    ${ruler}
    <g fill="${col}">
      ${fem?`<path d="M${cx-17} 30 Q${cx-18} 10 ${cx} 12 Q${cx+18} 10 ${cx+17} 30 L${cx+15} 58 Q${cx} 62 ${cx-15} 58 Z" opacity=".55"/>`:""}
      <circle cx="${cx}" cy="32" r="14"/>
      <rect x="${cx-5}" y="44" width="10" height="14" rx="3"/>
      <path d="${torso}"/>
      <rect x="${cx-sh-arm-2}" y="60" width="${arm}" height="70" rx="${arm/2}" transform="rotate(6 ${cx-sh} 60)"/>
      <rect x="${cx+sh+2}" y="60" width="${arm}" height="70" rx="${arm/2}" transform="rotate(-6 ${cx+sh} 60)"/>
      <rect x="${cx-hip}" y="124" width="${leg+2}" height="92" rx="${leg/2}"/>
      <rect x="${cx+hip-leg-2}" y="124" width="${leg+2}" height="92" rx="${leg/2}"/>
    </g>
    <line x1="30" x2="120" y1="218" y2="218" stroke="var(--line)" stroke-width="2"/>
    <text x="${cx}" y="234" text-anchor="middle" font-family="Geist Mono, monospace" font-size="10" fill="var(--muted)">${esc(o.label!=null?o.label:(o.weight?fmtW(o.weight):"— "+wUnit))}</text>
  </svg>`;
}
function avatarPair(p,t){
  const gt=t?t.goalType:"maintain",tw=gt==="maintain"?p.weight:(p.targetWeight||p.weight);
  const muscle=gt==="gain"||(gt==="maintain"&&(p.trainType==="fuerza"||p.trainType==="mixto"));
  return `<div class="avpair">
    <div>${avatarSVG({sex:p.sex,height:p.height,weight:p.weight,color:"var(--muted)",ruler:false,label:tr("Hoy","Today")+" · "+fmtW(p.weight),aria:tr("Tu figura hoy","Your figure today")})}</div>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    <div>${avatarSVG({sex:p.sex,height:p.height,weight:tw,muscle,ruler:false,label:tr("Meta","Goal")+" · "+fmtW(tw),aria:tr("Tu figura en la meta","Your figure at your goal")})}</div>
  </div>`;
}
function bmiLabel(b){if(b<18.5)return tr("bajo","underweight");if(b<25)return"normal";if(b<30)return tr("sobrepeso","overweight");return tr("obesidad","obesity")}
function sparkline(ws){
  if(ws.length<2) return `<p class="muted" style="font-size:13px;margin:8px 0 0">${tr("Registra tu peso una vez por semana para ver tu tendencia.","Log your weight once a week to see your trend.")}</p>`;
  const pts=ws.slice(-20),vals=pts.map(w=>w.kg),mn=Math.min(...vals),mx=Math.max(...vals),rg=Math.max(.5,mx-mn);
  const W=300,H=70,PD=6;
  const xy=pts.map((w,i)=>[PD+i*(W-2*PD)/(pts.length-1),PD+(1-(w.kg-mn)/rg)*(H-2*PD)]);
  const line=xy.map((c,i)=>(i?"L":"M")+c[0].toFixed(1)+" "+c[1].toFixed(1)).join(" ");
  const area=line+` L${xy[xy.length-1][0].toFixed(1)} ${H} L${xy[0][0].toFixed(1)} ${H} Z`;
  const last=xy[xy.length-1],diff=vals[vals.length-1]-vals[0];
  const dm=s=>EN?s.slice(5).replace("-","/"):s.slice(5).split("-").reverse().join("/");
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;margin-top:10px" role="img" aria-label="${tr("Tendencia de peso","Weight trend")}">
    <path d="${area}" fill="var(--accent)" opacity=".12"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="var(--accent)"/></svg>
    <div class="spread" style="font-size:12px;color:var(--muted);font-family:var(--mono)"><span>${esc(dm(pts[0].d))}</span><span>${diff>=0?"+":""}${fmtW(diff)}</span><span>${esc(dm(pts[pts.length-1].d))}</span></div>`;
}
function renderYo(){
  const p=S.profile,t=targets(p);
  const stat=(l,v,u)=>`<div><dt>${l}</dt><dd>${v}${u?`<small>${u}</small>`:""}</dd></div>`;
  if(!t){
    $("#viewYo").innerHTML=`<header class="top"><span></span><div><span class="label">${tr("Tu perfil","Your profile")}</span><h1>${tr("Yo","Profile")}</h1></div><span></span></header>
      <section class="card stack"><p style="margin:0">${tr("Responde el test para calcular tu plan.","Take the quiz to build your plan.")}</p><button class="btn" data-act="onb">${tr("Hacer el test","Take the quiz")}</button></section>`;
    return;
  }
  const stats=[stat(tr("Peso","Weight"),fmt1(wDisp(p.weight)),wUnit),stat(tr("Altura","Height"),IMP?fmtH(p.height):p.height,IMP?"":"cm"),stat(tr("IMC","BMI"),fmt1(t.bmi),bmiLabel(t.bmi)),
    stat(tr("Mantención","Maintenance"),fmt(t.tdee),"kcal"),stat(tr("Meta diaria","Daily goal"),fmt(t.kcal),"kcal"),stat(tr("Proteína","Protein"),fmt(t.pro),"g"),stat(tr("Agua","Water"),fmtWater(t.water),waterUnit)].join("");
  const gt=t.goalType;
  let goalHTML=`<div class="spread"><span class="label">${tr("Objetivo","Goal")}</span><span class="muted" style="font-size:12px">${p.startDate?tr("desde ","since ")+esc(EN?p.startDate.slice(5).replace("-","/"):p.startDate.slice(5).split("-").reverse().join("/")):""}</span></div>
    <div style="font-family:var(--display);font-variation-settings:'wdth' 80;font-weight:800;font-size:26px;margin-top:4px">${(GOALT[gt]||GOALT.maintain)[0]}</div>`;
  if(gt!=="maintain"&&p.targetWeight){
    const start=p.startWeight||p.weight,total=Math.abs(p.targetWeight-start)||1;
    const done=Math.max(0,Math.min(1,(gt==="lose"?start-p.weight:p.weight-start)/total));
    const reached=gt==="lose"?p.weight<=p.targetWeight:p.weight>=p.targetWeight;
    goalHTML+=`<div class="kline" style="margin:10px 0 6px"><span>${fmtW(start)}</span><span><b>${fmtW(p.weight)}</b> ${tr("hoy","today")}</span><span>${tr("Meta","Goal")} ${fmtW(p.targetWeight)}</span></div>
      <div class="track"><i style="width:${done*100}%;background:var(--accent)"></i></div>
      <p class="muted" style="font-size:13px;margin:10px 0 0">${reached?tr("<b style=\"color:var(--ink)\">Llegaste a tu meta.</b> Rehaz el test para definir la siguiente.","<b style=\"color:var(--ink)\">You reached your goal.</b> Retake the quiz to set the next one."):`${tr("Ritmo","Pace")} ${PACE_LABEL[p.pace||"normal"].toLowerCase()}: ${fmtRate(t.kgWeek)} ${tr("por semana","per week")}${t.eta?` · ${tr("llegarías aprox. en","estimated arrival:")} ${monthYear(t.eta)}`:""}.`}</p>`;
  }
  if(t.floored)goalHTML+=`<p class="note" style="margin-top:10px">${tr("Subí tu meta diaria a un mínimo seguro; por eso el avance será algo más lento.","I raised your daily goal to a safe minimum, so progress will be a bit slower.")}</p>`;
  goalHTML+=`<p class="muted" style="font-size:13px;margin:8px 0 0">${p.daily&&DAILY[p.daily]?DAILY[p.daily][1]:""}${p.train&&TRAIN[p.train]?" · "+tr("entrenas ","you work out ")+TRAIN[p.train][1].toLowerCase():""}${p.trainType&&p.train!=="0"&&TTYPE[p.trainType]?" ("+TTYPE[p.trainType][0].toLowerCase()+")":""}</p>
    <button class="btn ghost" style="margin-top:12px" data-act="onb">${tr("Rehacer el test","Retake the quiz")}</button>`;
  const opt=(arr,val)=>arr.map(([v,l])=>`<option value="${v}" ${Number(val)===v?"selected":""}>${l}</option>`).join("");
  const nDays=Object.keys(localStorageKeys()).length;
  $("#viewYo").innerHTML=`
    <header class="top"><span></span><div><span class="label">${tr("Tu perfil","Your profile")}</span><h1>${esc(p.name||tr("Yo","Profile"))}</h1></div><span></span></header>
    <div class="stack">
      <section class="card me"><div class="avatar">${avatarSVG({sex:p.sex,height:p.height,weight:p.weight})}</div><dl class="stats">${stats}</dl></section>
      <section class="card">${goalHTML}</section>
      <section class="card">
        <div class="spread"><span class="label">${tr("Peso del plan","Plan weight")}</span><span class="muted" style="font-size:12px">${(p.weights||[]).length} ${tr("cambios","updates")}</span></div>
        <p class="muted" style="font-size:13px;margin:6px 0 0">${tr("Úsalo cuando quieras recalcular tus calorías y macros. Para pesarte a diario usa la pestaña <b style=\"color:var(--ink)\">Peso</b>.","Use it when you want to recalculate your calories and macros. For daily weigh-ins use the <b style=\"color:var(--ink)\">Weight</b> tab.")}</p>
        <div class="row" style="margin-top:10px"><input id="wIn" class="input" type="number" inputmode="decimal" step="0.1" placeholder="${fmt1(wDisp(p.weight))} ${wUnit}" aria-label="${tr("Peso de hoy en","Today's weight in")} ${wUnit}"><button class="btn" style="width:auto;padding:0 18px" data-act="logW">${tr("Actualizar","Update")}</button></div>
        ${sparkline(p.weights||[])}
      </section>
      <section class="card"><div class="spread"><span class="label">${tr("Últimos 7 días","Last 7 days")}</span><span class="muted" style="font-size:12px">${tr("Toca una barra","Tap a bar")}</span></div><div class="dsel" id="weekSel"></div><div id="week" class="bars" aria-label="${tr("Calorías de los últimos 7 días","Calories over the last 7 days")}"></div></section>
      <section class="card"><div class="spread"><span class="label" id="calTitle"></span><div class="pm"><button data-act="calnav" data-d="-1" aria-label="${tr("Mes anterior","Previous month")}">‹</button><button data-act="calnav" data-d="1" aria-label="${tr("Mes siguiente","Next month")}">›</button></div></div><div id="cal" class="cal"></div><div class="dsel" id="calSel"></div>
        <div class="calkey"><span><i class="dot acc"></i>${tr("Hoy","Today")}</span><span><i class="dot"></i>${tr("Últimos 7 días","Last 7 days")}</span><span><i class="dot hollow"></i>${tr("Sin registro","Nothing logged")}</span></div></section>
    </div>`;
  loadWeek();loadCal();
}
function localStorageKeys(){const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(P+"day-"))o[k.slice(P.length+4)]=1}}catch(e){}return o}
function dayKcal(d){return totals(day(d).entries).kcal}
function daySelHTML(d){
  const t=targets(S.profile),k=dayKcal(d),goal=t?t.kcal:0;
  return `<span><b class="num">${fmt(k)}</b>${goal?` <span class="muted">/ ${fmt(goal)} kcal</span>`:" kcal"}<small>${esc(cap1(dateTitle(d)))}</small></span><button class="dgo" data-act="goday" data-d="${d}">${tr("Ver día","Open day")} ›</button>`;
}
function loadWeek(){
  const t=targets(S.profile),dates=Array.from({length:7},(_,i)=>addDays(today(),i-6));
  const el=$("#week");if(!el)return;
  if(!S.weekSel||!dates.includes(S.weekSel))S.weekSel=today();
  const vals=dates.map(dayKcal);
  const goal=t?t.kcal:0,mx=Math.max(goal,...vals,1)*1.08;
  el.innerHTML=(goal?`<div class="goal-line" style="bottom:calc((100% - 22px) * ${goal/mx} + 22px)"></div>`:"")+
    dates.map((d,i)=>`<button class="b ${d===today()?"today":""} ${d===S.weekSel?"sel":""}" data-act="wk" data-d="${d}" aria-label="${esc(dateTitle(d))}: ${fmt(vals[i])} kcal"><i style="height:calc((100% - 22px) * ${vals[i]/mx})"></i><span>${new Intl.DateTimeFormat(LOC,{weekday:"narrow"}).format(parseD(d))}</span></button>`).join("");
  el.classList.toggle("picked",S.weekSel!==today());
  $("#weekSel").innerHTML=daySelHTML(S.weekSel);
}
function loadCal(){
  const el=$("#cal");if(!el)return;
  const t=today(),ym=S.calMonth||t.slice(0,7);
  const [Y,M]=ym.split("-").map(Number);
  const first=new Date(Y,M-1,1),nDays=new Date(Y,M,0).getDate();
  const sunFirst=CC==="us";
  const lead=(first.getDay()+(sunFirst?0:6))%7;
  const week=new Set(Array.from({length:7},(_,i)=>addDays(t,i-6)));
  const logged=localStorageKeys();
  $("#calTitle").textContent=cap1(new Intl.DateTimeFormat(LOC,{month:"long",year:"numeric"}).format(first));
  const heads=Array.from({length:7},(_,i)=>new Intl.DateTimeFormat(LOC,{weekday:"narrow"}).format(new Date(2024,0,(sunFirst?7:1)+i)));
  let cells=heads.map(h=>`<span class="ch">${h}</span>`).join("")+"<span></span>".repeat(lead);
  for(let n=1;n<=nDays;n++){
    const d=`${Y}-${String(M).padStart(2,"0")}-${String(n).padStart(2,"0")}`;
    const fut=d>t,has=!!logged[d]&&day(d).entries.length>0;
    const cls=["cd",d===t?"today":"",week.has(d)?"wk":"",week.has(d)&&!has?"none":"",fut?"fut":"",d===S.calSel?"sel":""].filter(Boolean).join(" ");
    cells+=fut?`<span class="${cls}"><b>${n}</b></span>`:`<button class="${cls}" data-act="calday" data-d="${d}"><b>${n}</b><i></i></button>`;
  }
  el.innerHTML=cells;
  const nx=document.querySelector('[data-act=calnav][data-d="1"]');if(nx)nx.disabled=ym>=t.slice(0,7);
  $("#calSel").innerHTML=S.calSel&&S.calSel.slice(0,7)===ym?daySelHTML(S.calSel):"";
}

/* ---------- hoja inferior ---------- */
/* hojas con historial: deslizar hacia abajo vuelve a la hoja anterior (o cierra) */
const SH={stack:[],cur:null};
function renderSheet(html,mount){
  const prev=$("#sheetBody"),body=prev.cloneNode(false);prev.replaceWith(body);
  body.innerHTML=html;$("#sheet").hidden=false;$("#scrim").hidden=false;
  document.body.style.overflow="hidden";$("#sheet").scrollTop=0;
  if(mount) mount(body);
}
function openSheet(html,mount,opt){
  opt=opt||{};
  if($("#sheet").hidden)SH.stack=[];
  else if(SH.cur&&!SH.cur.transient)SH.stack.push(SH.cur);
  SH.cur={html,mount,transient:!!opt.transient,onLeave:opt.onLeave};
  renderSheet(html,mount);
}
function leaveCur(){const c=SH.cur;if(c&&c.onLeave){try{c.onLeave()}catch(e){}}}
function closeSheet(){SH.stack=[];SH.cur=null;$("#sheet").hidden=true;$("#scrim").hidden=true;document.body.style.overflow="";const sh=$("#sheet");sh.style.transform="";sh.style.transition=""}
function sheetBack(){
  leaveCur();
  const p=SH.stack.pop();
  if(!p){closeSheet();return}
  SH.cur=p;renderSheet(p.html,p.mount);
}
(function swipeSheet(){
  const sh=document.getElementById("sheet");if(!sh)return;
  let y0=0,x0=0,dy=0,t0=0,on=false,locked=null;
  sh.addEventListener("touchstart",e=>{
    if(e.touches.length!==1)return;
    const t=e.touches[0];y0=t.clientY;x0=t.clientX;dy=0;t0=Date.now();locked=null;
    on=sh.scrollTop<=0;
  },{passive:true});
  sh.addEventListener("touchmove",e=>{
    if(!on)return;
    const t=e.touches[0],ddy=t.clientY-y0,ddx=t.clientX-x0;
    if(locked===null){if(Math.abs(ddy)<6&&Math.abs(ddx)<6)return;locked=ddy>0&&Math.abs(ddy)>Math.abs(ddx)*1.2;if(!locked){on=false;return}
      const a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))a.blur()}
    dy=Math.max(0,ddy);
    if(e.cancelable)e.preventDefault();
    sh.style.transition="none";sh.style.transform=`translateY(${dy}px)`;
  },{passive:false});
  const end=()=>{
    if(!on||!locked){on=false;return}
    on=false;
    const v=dy/Math.max(1,Date.now()-t0);
    if(dy>110||(dy>40&&v>0.6)){
      sh.style.transition="transform .2s ease-in";sh.style.transform="translateY(100%)";
      setTimeout(()=>{sh.style.transition="none";sh.style.transform="";sheetBack();},190);
    }else{sh.style.transition="transform .2s cubic-bezier(.2,.8,.2,1)";sh.style.transform="";}
  };
  sh.addEventListener("touchend",end);sh.addEventListener("touchcancel",end);
})();
function loading(msg){openSheet(`<div class="stack" style="align-items:center;padding:28px 0 12px;text-align:center"><div class="spin" aria-hidden="true"></div><p>${esc(msg)}</p></div>`,null,{transient:true})}
function mealChips(sel){return `<div class="chips">${MEALS.map(([k,l])=>`<button class="chip" data-meal-chip="${k}" aria-pressed="${k===sel}">${l}</button>`).join("")}</div>`}
function wireMealChips(root,get,set){root.querySelectorAll("[data-meal-chip]").forEach(b=>b.addEventListener("click",()=>{set(b.dataset.mealChip);root.querySelectorAll("[data-meal-chip]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.mealChip===get()))}))}
function recentFoods(n){return Object.values(S.foods).filter(f=>f.per100).sort((a,b)=>(b.last||0)-(a.last||0)).slice(0,n)}
const foodRow=(f,right)=>`<button class="li" data-act="food" data-key="${esc(f.key)}"><div><div>${esc(f.name)}</div><div class="muted" style="font-size:12px">${f.brand?esc(f.brand)+" · ":""}${fmt(f.per100.kcal)} kcal / 100 ${f.ml?"ml":"g"}${f.approx?" · "+tr("aprox.","approx."):""}</div></div><span class="k">${right||""}</span></button>`;
let tempFoods={};
function findFood(key){return S.foods[key]||tempFoods[key]||BASE.find(b=>b.key===key)}

function openAdd(meal){
  S.addMeal=meal||S.addMeal||mealNow();
  const rec=recentFoods(4).map(f=>{const u=unitFor(f);return foodRow(f,f.lastMode==="u"&&u&&f.lastUnits?fmtN(f.lastUnits)+" "+uName(u,f.lastUnits):f.lastG?fmt(f.lastG)+(f.ml?" ml":" g"):"")}).join("");
  openSheet(`
    <h2>${tr("Añadir comida","Add food")}</h2>
    <div style="margin-top:10px">${mealChips(S.addMeal)}</div>
    <div class="opts">
      <button class="opt primary" data-act="scan">${IC.barcode}${tr("Escanear código","Scan barcode")}<small>${tr("Apunta la cámara al código de barras","Point the camera at the barcode")}</small></button>
      ${aiProvider()?`<label for="fPlate" class="opt">${IC.camera}${tr("Foto del plato","Meal photo")}<small>${tr("La IA estima porciones y macros","AI estimates portions and macros")}</small></label>`:""}
      <button class="opt" data-act="search">${IC.search}${tr("Buscar alimento","Search food")}<small>${tr(`${BASE.length} alimentos por categoría y Open Food Facts`,`${BASE.length} foods by category and Open Food Facts`)}</small></button>
      ${aiProvider()?`<button class="opt" data-act="describe">${IC.text}${tr("Describir","Describe")}<small>${tr("“2 huevos y una marraqueta con palta”","“2 eggs and toast with avocado”")}</small></button>`:""}
      <button class="opt" data-act="myfoods">${IC.list}${tr("Mis alimentos","My foods")}<small>${Object.keys(S.foods).length} ${tr("guardados","saved")}</small></button>
      <button class="opt" data-act="manual">${IC.pencil}${tr("Ingresar a mano","Enter manually")}<small>${tr("Nombre, gramos y macros","Name, grams and macros")}</small></button>
      <button class="opt wide" data-act="typecode">${IC.keys}<span>${tr("Escribir número del código","Type the barcode number")}</span></button>
    </div>
    ${rec||historyDays().length?`<div style="margin-top:18px"><span class="label">${tr("Historial","History")}</span><div class="list">${rec}<button class="li hmore" data-act="history"><span>${tr("Ver todo lo que has comido, por día","See everything you've eaten, by day")}</span><span class="k">${IC.right}</span></button></div></div>`:""}
    ${aiProvider()?"":`<button class="linkbtn" data-act="aisetup">${tr("¿Quieres registrar con una foto del plato o describiendo lo que comiste? Conecta una IA (opcional)","Want to log with a meal photo or by describing what you ate? Connect an AI (optional)")}</button>`}`,
  root=>wireMealChips(root,()=>S.addMeal,v=>S.addMeal=v));
}

function unitFor(food){
  const base=food&&food.key&&String(food.key).startsWith("base-")?BASE.find(b=>b.key===food.key):null;
  const u=(food&&food.unit)||(base&&base.unit);
  const saved=(food&&S.foods[food.key])||{};
  let r;
  if(u&&u.g)r={s:u.s,p:u.p,baseG:u.g,generic:false};
  else if(food&&food.servingG)r={s:tr("porción","serving"),p:tr("porciones","servings"),baseG:food.servingG,generic:true};
  else r={s:tr("unidad","unit"),p:tr("unidades","units"),baseG:null,generic:true};
  r.g=num(saved.unitG)||num(food&&food.unitG)||r.baseG;
  return r;
}
const uName=(u,n)=>Math.abs(n-1)<1e-9?u.s:u.p;
const cap1=s=>String(s).charAt(0).toUpperCase()+String(s).slice(1);
const fmtN=n=>Math.abs(n-0.5)<1e-9?"½":fmt1(n);
function openPortion(food,entry,opts){
  opts=opts||{};
  const unit=unitFor(food);
  const saved=S.foods[food.key]||{};
  const gU=food.ml?"ml":"g";
  const pre=entry||opts.prefill;
  let unitG=pre&&pre.unitG?num(pre.unitG):unit.g;
  let mode=pre?(pre.units?"u":"g"):(saved.lastMode||(unit.generic?"g":"u"));
  if(mode==="u"&&!unitG)mode="g";
  let n=pre&&pre.units?num(pre.units):(saved.lastUnits||1);
  let g=pre?num(pre.grams):(mode==="u"?n*unitG:(food.lastG||food.servingG||100));
  let meal=entry?normMeal(entry.meal):(S.addMeal||mealNow());
  const per=food.per100;
  const warn=!entry&&suspicious(per);
  const chips=[...new Set([food.servingG,50,100,150,200,250].filter(Boolean).map(x=>Math.round(x)))].slice(0,6);
  const fromOFF=food.src==="Open Food Facts";
  openSheet(`
    <h2>${esc(food.name)}</h2>
    <p class="muted" style="font-size:13px">${food.brand?esc(food.brand)+" · ":""}${fromOFF?`${tr("Datos de","Data from")} <a href="https://world.openfoodfacts.org/product/${esc(food.barcode||"")}" target="_blank" rel="noopener" style="color:inherit">Open Food Facts</a>`:food.src==="referencia"?(food.approx?tr("Valor aproximado: promedio de recetas típicas","Approximate value: average of typical recipes"):tr("Valores de referencia","Reference values"))+(food.cat&&CATS[food.cat]?" · "+CATS[food.cat]:""):tr("Guardado por ti","Saved by you")}</p>
    ${warn?`<p class="note" style="margin-top:10px;border-color:var(--carb)">${tr("Las calorías no calzan con los macros de este producto (posible error en la base de datos). Compáralo con la etiqueta y corrígelo si hace falta.","The calories don't match this product's macros (possible database error). Compare with the label and correct it if needed.")}</p>`:""}
    <div class="stack" style="margin-top:14px">
      ${true?`<div class="field"><label>${tr("Contar por","Count by")}</label><div class="seg" id="qMode"><button data-m="u" aria-pressed="${mode==="u"}">${esc(cap1(unit.p))}</button><button data-m="g" aria-pressed="${mode==="g"}">${food.ml?tr("Mililitros","Milliliters"):tr("Gramos","Grams")}</button></div></div>`:""}
      ${true?`<div id="qU" class="stack" style="gap:8px" ${mode!=="u"?"hidden":""}>
        <div class="stepper qstep"><button data-q="-1" aria-label="${tr("Menos","Less")}">−</button><input id="pn" type="number" inputmode="decimal" step="any" min="0" value="${n}" aria-label="${tr("Cantidad","Amount")}"><button data-q="1" aria-label="${tr("Más","More")}">+</button></div>
        <p class="unitline" id="pnTot"></p><p class="unitline small">1 ${esc(unit.s)} = <input id="pu" class="uin" type="number" inputmode="decimal" step="any" min="0" placeholder="?" value="${unitG?r1(unitG):""}" aria-label="${tr("Peso de 1 unidad","Weight of 1 unit")}"> ${gU}</p>
        <div class="chips" style="justify-content:center">${[0.5,1,2,3,4].map(x=>`<button class="chip" data-n="${x}">${fmtN(x)}</button>`).join("")}</div>
      </div>`:""}
      <div id="qG" class="stack" style="gap:8px" ${mode!=="g"?"hidden":""}>
        <div class="field"><label for="pg">${tr("¿Cuánto comiste? (gramos o ml)","How much did you eat? (grams or ml)")}</label><input id="pg" class="input num" style="font-size:28px;height:58px" type="number" inputmode="decimal" step="any" value="${r1(g)}"></div>
        <div class="chips">${chips.map(c=>`<button class="chip" data-g="${c}">${food.servingG&&c===Math.round(food.servingG)?`${tr("1 porción","1 serving")} · ${c} ${gU}`:c+" "+gU}</button>`).join("")}</div>
      </div>
      <div class="tbl" id="pres"></div>
      <div>${mealChips(meal)}</div>
      <button class="btn" id="pOk">${entry?tr("Guardar cambios","Save changes"):tr("Añadir","Add")}</button>
      ${food.barcode||fromOFF?`<button class="btn ghost" id="pFix">${tr("Corregir valores con la etiqueta","Correct values from the label")}</button>`:""}
      ${entry?`<button class="btn danger" id="pDel">${tr("Eliminar de este día","Remove from this day")}</button>`:""}
    </div>`,
  root=>{
    const inp=root.querySelector("#pg"),pn=root.querySelector("#pn"),pu=root.querySelector("#pu"),btn=root.querySelector("#pOk");
    const upd=()=>{
      unitG=num(pu.value);
      if(mode==="u"){n=Math.max(0,num(pn.value));g=r1(n*unitG)}else g=num(inp.value);
      const label=mode==="u"?`${fmtN(n)} ${uName(unit,n)}`:null;
      const servLabel=`1 ${unit.s} · ${fmt1(unitG)} ${gU}`;
      root.querySelector("#pres").innerHTML=tableHTML(per,unitG||food.servingG,g,gU,label,unitG?servLabel:null);
      root.querySelector("#pnTot").textContent=unitG?`${fmtN(n)} ${uName(unit,n)} = ${fmt(n*unitG)} ${gU}`:tr("¿Cuánto pesa 1 "+unit.s+"?","How much does 1 "+unit.s+" weigh?");
      pu.classList.toggle("need",!unitG);
      if(!entry)btn.textContent=g>0?`${tr("Añadir","Add")} ${mode==="u"?fmtN(n)+" "+uName(unit,n):fmt1(g)+" "+gU} · ${fmt(fromPer100(per,g).kcal)} kcal`:tr("Añadir","Add");
    };
    inp.addEventListener("input",upd);
    root.querySelectorAll("[data-g]").forEach(b=>b.addEventListener("click",()=>{inp.value=b.dataset.g;upd()}));
    if(pn){
      pn.addEventListener("input",upd);pu.addEventListener("input",upd);
      root.querySelectorAll("[data-q]").forEach(b=>b.addEventListener("click",()=>{let v=num(pn.value);v=b.dataset.q==="1"?(v<1?1:Math.floor(v)+1):(v>1?Math.ceil(v)-1:0.5);pn.value=v;upd()}));
      root.querySelectorAll("[data-n]").forEach(b=>b.addEventListener("click",()=>{pn.value=b.dataset.n;upd()}));
      root.querySelectorAll("#qMode [data-m]").forEach(b=>b.addEventListener("click",()=>{
        const m=b.dataset.m;if(m===mode)return;
        if(m==="g"){if(unitG)inp.value=r1(num(pn.value)*unitG)}else{pn.value=unitG?Math.max(0.5,Math.round(num(inp.value)/unitG*2)/2):1}
        mode=m;root.querySelector("#qU").hidden=mode!=="u";root.querySelector("#qG").hidden=mode!=="g";
        root.querySelectorAll("#qMode [data-m]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.m===mode));upd();
      }));
    }
    upd();
    wireMealChips(root,()=>meal,v=>meal=v);
    btn.addEventListener("click",()=>{
      if(mode==="u"&&!(unitG>0)){toast(tr("Indica cuánto pesa 1 "+unit.s,"Enter how much 1 "+unit.s+" weighs"));pu.focus();return}
      if(!(g>0)){toast(tr("Ingresa una cantidad mayor a 0","Enter an amount greater than 0"));return}
      const d=day();
      const e={id:entry?entry.id:uid(),meal,name:food.name,grams:r1(g),...fromPer100(per,g),per100:per,key:food.key,src:food.src||"guardado",ml:!!food.ml};
      if(mode==="u"){e.units=r1(n);e.uS=unit.s;e.uP=unit.p;e.unitG=r1(unitG)}
      if(entry){const i=d.entries.findIndex(z=>z.id===entry.id);if(i>=0)d.entries[i]=e}else d.entries.push(e);
      saveDay();
      if(!entry){const {uses,last,...clean}=food;upsertFood({...clean,lastG:r1(g),lastMode:mode,lastUnits:mode==="u"?r1(n):(saved.lastUnits||null),unitG:unitG&&Math.abs(unitG-(unit.baseG||0))>1e-9?r1(unitG):null})}
      closeSheet();S.tab="hoy";render();toast(entry?tr("Cambios guardados","Changes saved"):`${tr("Añadido a","Added to")} ${MEAL_NAME[meal]}`);
    });
    const fix=root.querySelector("#pFix");
    if(fix)fix.addEventListener("click",()=>openNewProduct(food.barcode||"",{name:food.name,brand:food.brand,servingG:food.servingG,per100:per},tr("Corrige con lo que dice la etiqueta. Queda guardado para la próxima vez.","Correct it with what the label says. It's saved for next time.")));
    const del=root.querySelector("#pDel");
    if(del)del.addEventListener("click",()=>{const d=day();d.entries=d.entries.filter(z=>z.id!==entry.id);saveDay();closeSheet();render();toast(tr("Eliminado","Removed"))});
  });
}
function foodFromEntry(e){
  const known=e.key&&findFood(e.key);
  const per=e.per100||per100Of(e,num(e.grams)||100);
  return {key:e.key||("n-"+slug(e.name)),name:e.name,per100:per,servingG:known&&known.servingG,brand:known&&known.brand,barcode:known&&known.barcode,src:e.src,ml:e.ml||(known&&known.ml),approx:known&&known.approx,cat:known&&known.cat,unit:known&&known.unit};
}
function openEntry(id){
  const e=day().entries.find(x=>x.id===id);if(!e)return;
  openPortion(foodFromEntry(e),e);
}
/* ---------- historial: todo lo registrado, agrupado por día ---------- */
function historyDays(){
  const out=[],seen=new Set();
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(P+"day-"))seen.add(k.slice((P+"day-").length))}
  Object.keys(S.days).forEach(d=>seen.add(d));
  [...seen].filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<=today()).sort().reverse().slice(0,120).forEach(d=>{
    const es=day(d).entries.filter(e=>e&&e.name&&(e.per100||num(e.grams)>0));
    if(es.length)out.push({d,es:[...es].sort((a,b)=>MEALS.findIndex(m=>m[0]===normMeal(a.meal))-MEALS.findIndex(m=>m[0]===normMeal(b.meal)))});
  });
  return out;
}
const amountOf=e=>e.units?`${fmtN(e.units)} ${Math.abs(e.units-1)<1e-9?e.uS:e.uP}`:`${fmt(e.grams)} ${e.ml?"ml":"g"}`;
function openHistory(o){
  o=o||{};
  const days=historyDays();
  let filt=S.histMeal||"all";
  const baseMeal=S.addMeal||mealNow();
  const chipsH=()=>`<div class="chips catchips hchips">${[["all",tr("Todas","All")],...MEALS].map(([k,l])=>`<button class="chip" data-hm="${k}" aria-pressed="${k===filt}">${l}</button>`).join("")}</div>`;
  openSheet(`<h2>${tr("Historial","History")}</h2>
    <p class="muted" style="font-size:13px;margin-top:4px">${tr("Toca un alimento para volver a añadirlo con la misma cantidad.","Tap a food to add it again with the same amount.")}</p>
    <div style="margin-top:10px" id="hchips">${chipsH()}</div>
    <input id="hq" class="input" style="margin-top:10px" type="search" placeholder="${tr("Buscar en lo que has comido","Search what you've eaten")}" aria-label="${tr("Buscar en el historial","Search history")}">
    <div id="hlist" style="margin-top:4px"></div>`,root=>{
    const q=root.querySelector("#hq");
    const row=(e,d,showMeal)=>`<button class="li" data-act="hist" data-d="${d}" data-id="${esc(e.id)}"><div><div>${esc(e.name)}</div><div class="muted" style="font-size:12px">${showMeal?esc(MEAL_NAME[normMeal(e.meal)])+" · ":""}${esc(amountOf(e))}</div></div><span class="k">${fmt(e.kcal)} kcal</span></button>`;
    const draw=()=>{
      const v=q.value,toks=String(v||"").trim()?slug(v).split("-").filter(Boolean):[];
      const html=days.map(({d,es})=>{
        let list=filt==="all"?es:es.filter(e=>normMeal(e.meal)===filt);
        if(toks.length)list=list.filter(e=>{const n=slug(e.name);return toks.every(t=>n.includes(t))});
        if(!list.length)return "";
        const kc=(filt==="all"?es:es.filter(e=>normMeal(e.meal)===filt)).reduce((a,e)=>a+num(e.kcal),0);
        const sub=d===today()||d===addDays(today(),-1)?new Intl.DateTimeFormat(LOC,{weekday:"long",day:"numeric",month:"short"}).format(parseD(d)).replace(".",""):"";
        let body;
        if(filt==="all")body=MEALS.map(([k,l])=>{const m=list.filter(e=>normMeal(e.meal)===k);return m.length?`<div class="hmeal">${esc(l)}</div><div class="list">${m.map(e=>row(e,d,false)).join("")}</div>`:""}).join("");
        else body=`<div class="list">${list.map(e=>row(e,d,false)).join("")}</div>`;
        return `<div class="hday"><div class="hhead"><span>${esc(cap1(dateTitle(d)))}${sub?`<small>${esc(sub)}</small>`:""}</span><span class="k">${fmt(kc)} kcal</span></div>${body}</div>`;
      }).join("");
      const empty=!days.length?tr("Aquí aparecerá todo lo que vayas registrando, día por día.","Everything you log will show up here, day by day.")
        :toks.length?tr("No encontré eso en tu historial.","Couldn't find that in your history.")
        :tr(`Todavía no hay nada registrado en ${MEAL_NAME[filt]}.`,`Nothing logged for ${MEAL_NAME[filt]} yet.`);
      root.querySelector("#hlist").innerHTML=html||`<p class="muted" style="font-size:13px;padding:14px 0">${esc(empty)}</p>`;
    };
    root.querySelector("#hchips").addEventListener("click",ev=>{
      const b=ev.target.closest("[data-hm]");if(!b)return;
      filt=b.dataset.hm;S.histMeal=filt;S.addMeal=filt==="all"?baseMeal:filt;
      root.querySelectorAll("[data-hm]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.hm===filt));draw();
    });
    q.addEventListener("input",draw);
    draw();
    if(o.focus)setTimeout(()=>{try{q.focus({preventScroll:true})}catch(e){}},60);
  });
}

function openFoods(){
  const all=Object.values(S.foods).filter(f=>f.per100).sort((a,b)=>(b.last||0)-(a.last||0));
  openSheet(`<h2>${tr("Mis alimentos","My foods")}</h2>
    <input id="fq" class="input" style="margin-top:10px" type="search" placeholder="${tr("Buscar","Search")}" aria-label="${tr("Buscar en mis alimentos","Search my foods")}">
    <div class="list" id="flist" style="margin-top:6px"></div>`,root=>{
    const draw=q=>{q=slug(q||"");const items=all.filter(f=>!q||q==="x"||slug(f.name+" "+(f.brand||"")).includes(q));
      root.querySelector("#flist").innerHTML=items.length?items.map(f=>foodRow(f,(f.uses||0)+"×")).join("")
        :`<p class="empty" style="padding:14px 0">${all.length?tr("Nada coincide con tu búsqueda.","Nothing matches your search."):tr("Aún no tienes alimentos guardados. Todo lo que añadas queda aquí para la próxima vez.","No saved foods yet. Everything you add is kept here for next time.")}</p>`};
    root.querySelector("#fq").addEventListener("input",e=>draw(e.target.value));draw("");
  });
}

function openSearch(){
  openSheet(`<h2>${tr("Buscar alimento","Search food")}</h2>
    <form id="sForm" class="row" style="margin-top:10px"><input id="sq" class="input" type="search" enterkeyhint="search" placeholder="${tr("Ej. arroz, empanada, yogur","e.g. rice, chicken, yogurt")}" aria-label="${tr("Buscar alimento","Search food")}" autocomplete="off"><button class="btn" style="width:auto;padding:0 16px">${tr("Buscar","Search")}</button></form>
    <div class="chips catchips" id="sCats" role="tablist" aria-label="${tr("Categorías","Categories")}">${Object.entries(CATS).map(([k,l])=>`<button class="chip" data-cat="${k}" aria-pressed="${S.searchCat===k}">${l}</button>`).join("")}</div>
    <div id="sLocal" class="list"></div>
    <div id="sOff" style="margin-top:14px"></div>`,root=>{
    const inp=root.querySelector("#sq");
    const label=t=>`<span class="label" style="display:block;margin-top:14px">${t}</span>`;
    const drawLocal=()=>{
      const toks=slug(inp.value).split("-").filter(x=>x&&x!=="x");
      const box=root.querySelector("#sLocal");
      root.querySelectorAll("[data-cat]").forEach(b=>b.setAttribute("aria-pressed",!toks.length&&S.searchCat===b.dataset.cat));
      if(toks.length){
        const pool=[...Object.values(S.foods).filter(f=>f.per100),...BASE.filter(b=>!S.foods[b.key])];
        const items=pool.filter(f=>{const s=slug(f.name+" "+(f.brand||""));return toks.every(t=>s.includes(t))}).slice(0,40);
        box.innerHTML=items.length?label(tr("En tus alimentos y la lista de la app","In your foods and the app's list"))+items.map(f=>foodRow(f,f.src==="referencia"?(CATS[f.cat]||""):tr("guardado","saved"))).join("")
          :`<p class="empty" style="padding:14px 0 0">${tr("No está en la lista de la app. Búscalo en Open Food Facts o ingrésalo a mano.","Not in the app's list. Search Open Food Facts or enter it manually.")}</p>`;
        root.querySelector("#sOff").innerHTML=`<button class="btn ghost" data-off-search>${tr("Buscar","Search")} “${esc(inp.value.trim())}” ${tr("en","on")} Open Food Facts</button><button class="linkbtn" data-act="manual" style="text-align:center">${tr("O ingrésalo a mano","Or enter it manually")}</button>`;
        const b=root.querySelector("[data-off-search]");if(b)b.addEventListener("click",()=>runOffSearch(root,inp.value.trim()));
      }else{
        root.querySelector("#sOff").innerHTML="";
        if(S.searchCat&&CATS[S.searchCat]){
          const items=BASE.filter(b=>b.cat===S.searchCat).map(b=>S.foods[b.key]&&S.foods[b.key].per100?{...b,...S.foods[b.key],cat:b.cat,approx:b.approx,ml:b.ml}:b).sort((a,b)=>a.name.localeCompare(b.name,LOC));
          box.innerHTML=label(`${CATS[S.searchCat]} · ${items.length}`)+items.map(f=>foodRow(f,"")).join("");
        }else{
          const rec=recentFoods(8);
          box.innerHTML=(rec.length?label(tr("Recientes","Recent"))+rec.map(f=>foodRow(f,f.lastG?fmt(f.lastG)+(f.ml?" ml":" g"):"")).join(""):"")+
            `<p class="empty" style="padding:14px 0 0">${tr(`Elige una categoría o escribe para buscar entre ${BASE.length} alimentos de la app, los tuyos y Open Food Facts.`,`Pick a category or type to search ${BASE.length} foods in the app, your own foods and Open Food Facts.`)}</p>`;
        }
      }
    };
    root.querySelectorAll("[data-cat]").forEach(b=>b.addEventListener("click",()=>{S.searchCat=S.searchCat===b.dataset.cat&&!inp.value.trim()?null:b.dataset.cat;inp.value="";drawLocal();root.querySelector("#sLocal").scrollIntoView({block:"nearest"})}));
    inp.addEventListener("input",drawLocal);drawLocal();
    root.querySelector("#sForm").addEventListener("submit",e=>{e.preventDefault();inp.blur();if(inp.value.trim())runOffSearch(root,inp.value.trim())});
    if(window.matchMedia("(pointer:fine)").matches)setTimeout(()=>inp.focus(),250);
  });
}
async function runOffSearch(root,q){
  const box=root.querySelector("#sOff");
  box.innerHTML=`<div class="row" style="justify-content:center;padding:14px"><div class="spin" aria-hidden="true"></div><span class="muted">${tr("Buscando en Open Food Facts…","Searching Open Food Facts…")}</span></div>`;
  try{
    let prods=[],where=tr("en el mundo","worldwide");
    if(CC){prods=await offSearch(`https://${CC==="gb"?"uk":CC}.openfoodfacts.org`,q);where=tr("en ","in ")+countryName(CC)}
    if(!prods.length){prods=await offSearch("https://world.openfoodfacts.org",q);where=tr("en el mundo","worldwide")}
    const foods=prods.map(p=>offToFood(p,p.code)).filter(f=>f&&!f.incomplete);
    tempFoods={};foods.forEach(f=>tempFoods[f.key]=f);
    if(!root.isConnected)return;
    box.innerHTML=foods.length?`<span class="label">Open Food Facts · ${where}</span><div class="list">${foods.map(f=>foodRow(f,"")).join("")}</div>`
      :`<p class="empty" style="padding:10px 0">${tr(`No encontré “${esc(q)}” en Open Food Facts. Prueba con otra palabra o ingrésalo a mano.`,`Couldn't find “${esc(q)}” on Open Food Facts. Try another word or enter it manually.`)}</p>`;
  }catch(e){
    if(!root.isConnected)return;
    box.innerHTML=`<p class="empty" style="padding:10px 0">${e&&e.message==="429"?tr("Hiciste muchas búsquedas seguidas. Espera un minuto y vuelve a intentar.","Too many searches in a row. Wait a minute and try again."):tr("No pude conectarme a Open Food Facts. Revisa tu conexión.","Couldn't reach Open Food Facts. Check your connection.")}</p>`;
  }
}
async function offSearch(host,q){
  const ctrl=new AbortController();const tm=setTimeout(()=>ctrl.abort(),12000);
  try{
    const r=await fetch(`${host}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=24&sort_by=unique_scans_n&fields=${OFF_FIELDS}`,{signal:ctrl.signal});
    if(r.status===429||r.status===503)throw new Error("429");
    if(!r.ok)throw new Error("http");
    const j=await r.json();return Array.isArray(j.products)?j.products:[];
  }finally{clearTimeout(tm)}
}
function offToFood(p,code){
  if(!p)return null;
  code=String(code||p.code||"").replace(/\D/g,"");
  const n=p.nutriments||{};
  let kcal=num(n["energy-kcal_100g"]);
  if(!kcal){const kj=num(n["energy-kj_100g"]||n["energy_100g"]);if(kj)kcal=kj/4.184}
  const per100={kcal:r1(kcal),p:r1(num(n.proteins_100g)),c:r1(num(n.carbohydrates_100g)),f:r1(num(n.fat_100g))};
  const name=String((EN?(p.product_name_en||p.product_name||p.generic_name_en||p.generic_name):(p.product_name_es||p.product_name||p.generic_name_es||p.generic_name))||"").trim();
  const brand=String(p.brands||"").split(",")[0].trim();
  const servingG=num(p.serving_quantity)||null;
  const base={key:code?"bc-"+code:"off-"+slug(name+brand),barcode:code||undefined,name:name||(tr("Producto ","Product ")+code),brand,servingG,src:"Open Food Facts"};
  if(!per100.kcal&&!(per100.p||per100.c||per100.f))return{...base,incomplete:true};
  if(!per100.kcal)per100.kcal=r1(per100.p*4+per100.c*4+per100.f*9);
  return{...base,per100};
}
async function lookupOFF(code){
  const ctrl=new AbortController();const tm=setTimeout(()=>ctrl.abort(),10000);
  try{
    const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${OFF_FIELDS}`,{signal:ctrl.signal});
    if(r.status===404)return null;
    if(!r.ok)throw new Error("http");
    const j=await r.json();
    if(!j||!j.product||j.status===0)return null;
    return offToFood(j.product,code);
  }finally{clearTimeout(tm)}
}

function openManual(){
  openSheet(`<h2>${tr("Ingresar a mano","Enter manually")}</h2><p class="muted" style="font-size:13px">${tr("Valores de la porción que comiste.","Values for the portion you ate.")}</p>
    <div class="stack" style="margin-top:12px">
      <div class="field"><label for="mN">${tr("Alimento","Food")}</label><input id="mN" class="input" placeholder="${tr("Ej. Sándwich de pollo","e.g. Chicken sandwich")}"></div>
      <div class="grid2"><div class="field"><label for="mG">${tr("Gramos","Grams")}</label><input id="mG" class="input" type="number" inputmode="decimal" step="any" value="100"></div>
      <div class="field"><label for="mK">${tr("Calorías","Calories")}</label><input id="mK" class="input" type="number" inputmode="decimal" step="any"></div></div>
      <div class="grid2" style="grid-template-columns:repeat(3,1fr)"><div class="field"><label for="mP">Prot g</label><input id="mP" class="input" type="number" inputmode="decimal" step="any"></div>
      <div class="field"><label for="mC">Carb g</label><input id="mC" class="input" type="number" inputmode="decimal" step="any"></div>
      <div class="field"><label for="mF">${tr("Grasa g","Fat g")}</label><input id="mF" class="input" type="number" inputmode="decimal" step="any"></div></div>
      <button class="btn" id="mOk">${tr("Añadir a","Add to")} ${esc(MEAL_NAME[S.addMeal||mealNow()])}</button>
    </div>`,root=>{
    root.querySelector("#mOk").addEventListener("click",()=>{
      const v=id=>num(root.querySelector(id).value);
      const name=root.querySelector("#mN").value.trim(),g=v("#mG");
      const x={kcal:Math.round(v("#mK")),p:r1(v("#mP")),c:r1(v("#mC")),f:r1(v("#mF"))};
      if(!name){toast(tr("Escribe el nombre del alimento","Enter the food name"));return}
      if(!x.kcal&&(x.p||x.c||x.f))x.kcal=Math.round(x.p*4+x.c*4+x.f*9);
      if(!(g>0)){toast(tr("Ingresa los gramos","Enter the grams"));return}
      if(!x.kcal){toast(tr("Ingresa las calorías","Enter the calories"));return}
      const meal=S.addMeal||mealNow(),per=per100Of(x,g),key="n-"+slug(name);
      const d=day();d.entries.push({id:uid(),meal,name,grams:r1(g),...x,per100:per,key,src:"manual"});saveDay();
      upsertFood({key,name,per100:per,src:"manual",lastG:r1(g)});
      closeSheet();S.tab="hoy";render();toast(`${tr("Añadido a","Added to")} ${MEAL_NAME[meal]}`);
    });
  });
}

/* ---------- código de barras ---------- */
function loadImg(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>res({img,url});img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("img"))};img.src=url})}
let zReader=null;
function zxReader(tryHarder){
  const Z=window.ZXing;if(!Z)return null;
  const hints=new Map();if(tryHarder)hints.set(Z.DecodeHintType.TRY_HARDER,true);
  hints.set(Z.DecodeHintType.POSSIBLE_FORMATS,[Z.BarcodeFormat.EAN_13,Z.BarcodeFormat.EAN_8,Z.BarcodeFormat.UPC_A,Z.BarcodeFormat.UPC_E,Z.BarcodeFormat.CODE_128]);
  const r=new Z.MultiFormatReader();r.setHints(hints);return r;
}
function decodeCanvas(reader,cv){
  const Z=window.ZXing,ctx=cv.getContext("2d",{willReadFrequently:true});
  const data=ctx.getImageData(0,0,cv.width,cv.height).data,n=cv.width*cv.height,gray=new Uint8ClampedArray(n);
  for(let j=0;j<n;j++)gray[j]=(data[j*4]*77+data[j*4+1]*150+data[j*4+2]*29)>>8;
  try{const res=reader.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.RGBLuminanceSource(gray,cv.width,cv.height))));return res?res.getText():null}
  catch(e){return null}finally{try{reader.reset()}catch(e){}}
}
let detector=null,detectorChecked=false;
async function getDetector(){
  if(detectorChecked)return detector;detectorChecked=true;
  try{if("BarcodeDetector" in window){const f=await window.BarcodeDetector.getSupportedFormats();if(f.includes("ean_13"))detector=new window.BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128"].filter(x=>f.includes(x))})}}catch(e){}
  return detector;
}
async function decodeFile(file){
  const {img,url}=await loadImg(file);
  try{
    const det=await getDetector();
    if(det){try{const r=await det.detect(img);if(r&&r.length)return r[0].rawValue}catch(e){}}
    const reader=zxReader(true);if(!reader)return null;
    const W=img.naturalWidth,H=img.naturalHeight;
    for(const max of [1100,1600,800])for(const rot of [0,90]){
      const sc=Math.min(1,max/Math.max(W,H)),w=Math.round(W*sc),h=Math.round(H*sc);
      const cv=document.createElement("canvas"),ctx=cv.getContext("2d",{willReadFrequently:true});
      if(rot){cv.width=h;cv.height=w;ctx.translate(h,0);ctx.rotate(Math.PI/2)}else{cv.width=w;cv.height=h}
      ctx.drawImage(img,0,0,w,h);
      const code=decodeCanvas(reader,cv);if(code)return code;
      await sleep(0);
    }
    return null;
  }finally{URL.revokeObjectURL(url)}
}

/* Escáner en vivo */
const SC={stream:null,on:false,canvas:null,reader:null,flip:false,kill:null};
/* iOS no guarda el permiso de cámara en apps de pantalla de inicio: mantenemos la cámara lista unos minutos para no volver a pedirlo en escaneos seguidos */
const CAM_KEEP_MS=5*60*1000;
function streamLive(){return!!(SC.stream&&SC.stream.getVideoTracks().some(t=>t.readyState==="live"))}
function releaseCamera(){clearTimeout(SC.kill);SC.kill=null;if(SC.stream){SC.stream.getTracks().forEach(t=>t.stop());SC.stream=null}const v=$("#scanVideo");if(v)v.srcObject=null}
async function startScanner(){
  closeSheet();
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){openCamFallback(tr("Este navegador no permite usar la cámara en vivo.","This browser can't use the live camera."));return}
  const box=$("#scanner"),video=$("#scanVideo");
  box.hidden=false;document.body.style.overflow="hidden";$("#scanMsg").textContent=tr("Apunta al código de barras","Point at the barcode");
  clearTimeout(SC.kill);SC.kill=null;
  if(streamLive()){SC.stream.getTracks().forEach(t=>t.enabled=true)}
  else try{
    SC.stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}}});
  }catch(e){
    box.hidden=true;document.body.style.overflow="";
    openCamFallback(e&&e.name==="NotAllowedError"?tr("No diste permiso para usar la cámara. Puedes activarlo en los ajustes del navegador, o usar una foto.","Camera permission was denied. You can enable it in your browser settings, or use a photo."):tr("No pude abrir la cámara.","Couldn't open the camera."));
    return;
  }
  if(video.srcObject!==SC.stream)video.srcObject=SC.stream;
  try{await video.play()}catch(e){}
  SC.on=true;SC.canvas=SC.canvas||document.createElement("canvas");
  SC.reader=zxReader(false);
  await getDetector();
  scanLoop();
}
function stopScanner(){
  SC.on=false;
  const v=$("#scanVideo");try{v.pause()}catch(e){}
  $("#scanner").hidden=true;document.body.style.overflow="";
  releaseCamera(); // apaga la cámara al tiro: así iOS quita el indicador rojo
}
async function scanLoop(){
  if(!SC.on)return;
  const video=$("#scanVideo");
  let code=null;
  if(video.readyState>=2&&video.videoWidth){
    if(detector){try{const r=await detector.detect(video);if(r&&r.length)code=r[0].rawValue}catch(e){}}
    else{
      if(!SC.reader)SC.reader=zxReader(false);
      if(SC.reader){
        const vw=video.videoWidth,vh=video.videoHeight;
        const cw=vw*0.9,ch=vh*(SC.flip?0.6:0.42),sx=(vw-cw)/2,sy=(vh-ch)/2;
        const sc=Math.min(1,760/cw),cv=SC.canvas;cv.width=Math.round(cw*sc);cv.height=Math.round(ch*sc);
        cv.getContext("2d",{willReadFrequently:true}).drawImage(video,sx,sy,cw,ch,0,0,cv.width,cv.height);
        code=decodeCanvas(SC.reader,cv);SC.flip=!SC.flip;
      }
    }
  }
  if(code&&SC.on){
    stopScanner();
    try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}
    handleCode(code);return;
  }
  setTimeout(scanLoop,detector?120:60);
}
function openCamFallback(msg){
  openSheet(`<h2>${tr("Cámara no disponible","Camera unavailable")}</h2><p class="muted">${esc(msg)}</p>
    <div class="stack" style="margin-top:14px"><label for="fBarcode" class="btn" style="display:grid;place-items:center">${tr("Usar una foto del código","Use a photo of the barcode")}</label><button class="btn ghost" data-act="typecode">${tr("Escribir el número","Type the number")}</button></div>`);
}
async function handleCode(code){
  code=String(code).replace(/\D/g,"");
  if(code.length<6){toast(tr("Ese código no es válido","That barcode isn't valid"));return}
  const f=S.foods["bc-"+code];
  if(f&&f.per100){openPortion(f);return}
  loading(tr("Buscando el producto…","Looking up the product…"));
  let food=null,err=false;
  try{food=await lookupOFF(code)}catch(e){err=true}
  if($("#sheet").hidden)return;
  if(food&&!food.incomplete){openPortion(food);return}
  if(food&&food.incomplete){openNewProduct(code,{name:food.name,brand:food.brand,servingG:food.servingG},tr("Está en Open Food Facts pero sin tabla nutricional. Copia los valores de la etiqueta y queda guardado para la próxima vez.","It's on Open Food Facts but without nutrition facts. Copy the values from the label and it's saved for next time."));return}
  openNewProduct(code,null,err?tr("Sin conexión con Open Food Facts. Ingresa los valores de la etiqueta y quedan guardados para la próxima vez.","Couldn't reach Open Food Facts. Enter the values from the label and they're saved for next time."):tr("No está en Open Food Facts. Copia los valores de la etiqueta una vez y quedan guardados para la próxima vez.","Not on Open Food Facts. Copy the values from the label once and they're saved for next time."));
}
function openTypeCode(failed){
  openSheet(`<h2>${failed?tr("No pude leer el código","Couldn't read the barcode"):tr("Escribir código","Type barcode")}</h2>
    <p class="muted" style="font-size:13px">${failed?tr("Prueba otra foto con el código derecho y enfocado, o escribe los números que aparecen bajo las barras.","Try another photo with the barcode straight and in focus, or type the numbers under the bars."):tr("Los números que aparecen bajo las barras del envase.","The numbers printed under the bars on the package.")}</p>
    <div class="stack" style="margin-top:12px">
      <input id="cIn" class="input num" style="font-size:26px;height:56px;letter-spacing:.06em" inputmode="numeric" placeholder="7801234567890" aria-label="${tr("Número del código de barras","Barcode number")}">
      <button class="btn" id="cOk">${tr("Buscar","Search")}</button>
      ${failed?`<label for="fBarcode" class="btn ghost" style="display:grid;place-items:center">${tr("Tomar otra foto","Take another photo")}</label>`:""}
    </div>`,root=>{
    const go=()=>handleCode(root.querySelector("#cIn").value);
    root.querySelector("#cOk").addEventListener("click",go);
    root.querySelector("#cIn").addEventListener("keydown",e=>{if(e.key==="Enter")go()});
  });
}
function openNewProduct(code,pre,msg){
  S.pendingCode=code;S.pendingPre=pre||null;
  const p=pre||{};const per=p.per100||{};
  let basis="100",meal=S.addMeal||mealNow();
  const val=k=>per[k]!=null?r1(per[k]):"";
  openSheet(`<h2>${pre&&pre.per100?tr("Corregir valores","Correct values"):tr("Producto nuevo","New product")}</h2>
    <p class="muted" style="font-size:13px">${code?tr("Código ","Barcode ")+esc(code)+". ":""}${esc(msg||"")}</p>
    <div class="stack" style="margin-top:12px">
      ${!(pre&&pre.per100)&&aiProvider()?`<label for="fLabel" class="opt primary wide">${IC.camera}<span>${tr("Foto de la tabla nutricional","Nutrition label photo")}<br><small>${tr("La IA lee los valores por ti","AI reads the values for you")}</small></span></label>`:""}
      <div class="field"><label for="nN">${tr("Nombre","Name")}</label><input id="nN" class="input" value="${esc(p.name||"")}" placeholder="${tr("Ej. Fideos al huevo","e.g. Egg noodles")}"></div>
      <div class="grid2"><div class="field"><label for="nB">${tr("Marca","Brand")}</label><input id="nB" class="input" value="${esc(p.brand||"")}"></div>
      <div class="field"><label for="nS">${tr("Porción de la tabla (g)","Label serving (g)")}</label><input id="nS" class="input" type="number" inputmode="decimal" step="any" value="${p.servingG?r1(p.servingG):""}"></div></div>
      <div class="field"><label>${tr("Los valores de abajo son","The values below are")}</label><div class="seg" id="nBasis"><button data-b="100" aria-pressed="true">${tr("Por 100 g","Per 100 g")}</button><button data-b="porcion" aria-pressed="false">${tr("Por porción","Per serving")}</button></div></div>
      <div class="grid4">
        <div class="field"><label for="nK">kcal</label><input id="nK" class="input" type="number" inputmode="decimal" step="any" value="${val("kcal")}"></div>
        <div class="field"><label for="nP">Prot</label><input id="nP" class="input" type="number" inputmode="decimal" step="any" value="${val("p")}"></div>
        <div class="field"><label for="nC">Carb</label><input id="nC" class="input" type="number" inputmode="decimal" step="any" value="${val("c")}"></div>
        <div class="field"><label for="nF">${tr("Grasa","Fat")}</label><input id="nF" class="input" type="number" inputmode="decimal" step="any" value="${val("f")}"></div>
      </div>
      <div class="field" style="margin-top:6px"><label for="nE">${tr("¿Cuánto comiste? (gramos o ml)","How much did you eat? (grams or ml)")}</label><input id="nE" class="input num" style="font-size:28px;height:58px" type="number" inputmode="decimal" step="any" value="${p.servingG?r1(p.servingG):100}"></div>
      <div class="tbl" id="nTbl"></div>
      <div>${mealChips(meal)}</div>
      <button class="btn" id="nAdd">${tr("Añadir","Add")}</button>
      <button class="btn ghost" id="nOk">${tr("Solo guardar el producto","Just save the product")}</button>
      ${!(pre&&pre.per100)&&!aiProvider()?`<button class="linkbtn" data-act="aisetup">${tr("Leer la etiqueta con una foto requiere conectar una IA (opcional)","Reading the label from a photo requires connecting an AI (optional)")}</button>`:""}
    </div>`,root=>{
    const v=id=>num(root.querySelector(id).value);
    const read=()=>{
      const serving=v("#nS"),raw={kcal:v("#nK"),p:v("#nP"),c:v("#nC"),f:v("#nF")};
      if(!raw.kcal&&(raw.p||raw.c||raw.f))raw.kcal=raw.p*4+raw.c*4+raw.f*9;
      let per100=raw;
      if(basis==="porcion"){if(!(serving>0))return{serving,per100:null,err:tr("Escribe el tamaño de la porción en gramos","Enter the serving size in grams")};per100={kcal:raw.kcal*100/serving,p:raw.p*100/serving,c:raw.c*100/serving,f:raw.f*100/serving}}
      return{serving,per100,eaten:v("#nE")};
    };
    const upd=()=>{
      const r=read(),tbl=root.querySelector("#nTbl"),btn=root.querySelector("#nAdd");
      if(!r.per100||!r.per100.kcal){tbl.innerHTML=`<div class="rl" style="grid-column:1/-1;border-top:0">${esc(r.err||tr("Completa las calorías para ver el cálculo","Fill in the calories to see the calculation"))}</div>`;btn.textContent=tr("Añadir","Add");return}
      tbl.innerHTML=tableHTML(r.per100,r.serving,r.eaten);
      btn.textContent=r.eaten>0?`${tr("Añadir","Add")} ${fmt1(r.eaten)} g · ${fmt(fromPer100(r.per100,r.eaten).kcal)} kcal`:tr("Añadir","Add");
    };
    root.querySelectorAll("#nBasis button").forEach(b=>b.addEventListener("click",()=>{basis=b.dataset.b;root.querySelectorAll("#nBasis button").forEach(x=>x.setAttribute("aria-pressed",x===b));upd()}));
    root.addEventListener("input",upd);upd();
    wireMealChips(root,()=>meal,m=>meal=m);
    const store=()=>{
      const name=root.querySelector("#nN").value.trim();
      if(!name){toast(tr("Ponle un nombre al producto","Give the product a name"));return null}
      const r=read();
      if(r.err){toast(r.err);return null}
      if(!r.per100.kcal){toast(tr("Faltan las calorías","Calories are missing"));return null}
      const key=code?"bc-"+code:"n-"+slug(name);
      const food={key,barcode:code||undefined,name,brand:root.querySelector("#nB").value.trim(),servingG:r.serving||null,per100:r.per100,src:"etiqueta"};
      S.foods[key]={...(S.foods[key]||{}),...food,last:Date.now()};
      return{food:S.foods[key],eaten:r.eaten};
    };
    root.querySelector("#nOk").addEventListener("click",()=>{const s=store();if(!s)return;saveFoods();closeSheet();render();toast(tr("Producto guardado","Product saved"))});
    root.querySelector("#nAdd").addEventListener("click",()=>{
      const s=store();if(!s)return;
      if(!(s.eaten>0)){toast(tr("Escribe cuántos gramos comiste","Enter how many grams you ate"));return}
      const d=day();
      d.entries.push({id:uid(),meal,name:s.food.name,grams:r1(s.eaten),...fromPer100(s.food.per100,s.eaten),per100:s.food.per100,key:s.food.key,src:"etiqueta"});
      saveDay();upsertFood({...s.food,lastG:r1(s.eaten)});
      closeSheet();S.tab="hoy";render();toast(`${tr("Añadido a","Added to")} ${MEAL_NAME[meal]}`);
    });
  });
}

/* ---------- IA con llave propia (Gemini o Claude) ---------- */
const AI={abort:null};
const aiKey=()=>{try{return localStorage.getItem(P+"aikey")||""}catch(e){return""}};
function aiProvider(k){k=k||aiKey();if(/^sk-ant-/.test(k))return"claude";if(/^(AIza|AQ\.)/.test(k))return"gemini";return null}
const PROV_NAME={claude:"Claude",gemini:"Gemini"};
function blobToB64(blob){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(",")[1]);r.onerror=rej;r.readAsDataURL(blob)})}
async function toJpeg(file,max){
  const {img,url}=await loadImg(file);
  try{const sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));const cv=document.createElement("canvas");
    cv.width=Math.round(img.naturalWidth*sc);cv.height=Math.round(img.naturalHeight*sc);cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
    return await new Promise(r=>cv.toBlob(r,"image/jpeg",.85));
  }finally{URL.revokeObjectURL(url)}
}
function parseJSONText(t){
  t=String(t||"").trim().replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();
  try{return JSON.parse(t)}catch(e){}
  const a=t.indexOf("{"),b=t.lastIndexOf("}");
  if(a>=0&&b>a){try{return JSON.parse(t.slice(a,b+1))}catch(e){}}
  throw{code:"parse"};
}
const GEM_DEFAULT=["gemini-flash-latest","gemini-flash-lite-latest","gemini-2.5-flash","gemini-2.5-flash-lite"];
function gemModels(){try{const v=JSON.parse(localStorage.getItem(P+"aimodels")||"null");if(Array.isArray(v)&&v.length)return v}catch(e){}return GEM_DEFAULT}
async function gemListModels(k){
  let r;
  try{r=await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",{headers:{"x-goog-api-key":k}})}
  catch(e){throw{code:"net"}}
  const j=await r.json().catch(()=>({}));
  if(!r.ok){const m=(j.error&&j.error.message)||"";throw{code:r.status===401||r.status===403||/API_KEY_INVALID|API key not valid|UNAUTHENTICATED|PERMISSION_DENIED/i.test(m)?"badkey":r.status===429?"rate":r.status>=500?"busy":"http",msg:m,status:r.status}}
  const names=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes("generateContent")).map(m=>String(m.name||"").replace(/^models\//,""))
    .filter(n=>/flash/i.test(n)&&!/(image|tts|audio|live|embed|native|thinking-exp|preview-tts|robotics|computer)/i.test(n));
  const ver=n=>{const m=n.match(/gemini-(\d+(?:\.\d+)?)/);return m?parseFloat(m[1]):0};
  const score=n=>(/-latest$/.test(n)?1000:0)+ver(n)*10+(/lite/.test(n)?0:5)-(/preview|exp/.test(n)?3:0);
  const sorted=[...new Set(names)].sort((a,b)=>score(b)-score(a)).slice(0,6);
  return sorted.length?sorted:GEM_DEFAULT;
}
async function aiJSON(prompt,blob,keyOverride){
  const k=keyOverride||aiKey(),prov=aiProvider(k);
  if(!prov)throw{code:"nokey"};
  const b64=blob?await blobToB64(blob):null;
  AI.abort=new AbortController();AI.timedOut=false;AI.userCancel=false;
  const tm=setTimeout(()=>{AI.timedOut=true;AI.abort&&AI.abort.abort()},90000);
  try{
    let text="";
    if(prov==="claude"){
      const content=[];
      if(b64)content.push({type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}});
      content.push({type:"text",text:prompt});
      let r;
      try{r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",signal:AI.abort.signal,headers:{"x-api-key":k,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-5-5",max_tokens:1500,messages:[{role:"user",content}]})})}
      catch(e){throw{code:AI.userCancel?"abort":AI.timedOut?"slow":e&&e.name==="AbortError"?"abort":"net"}}
      const j=await r.json().catch(()=>({}));
      if(!r.ok){const m=(j.error&&j.error.message)||"";throw{code:r.status===401||r.status===403?"badkey":r.status===429||r.status===529?"rate":/credit|billing|balance/i.test(m)?"credit":"http",msg:m}}
      text=(j.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("");
    }else{
      const parts=[{text:prompt}];
      if(b64)parts.push({inline_data:{mime_type:"image/jpeg",data:b64}});
      let last=null;
      const think=m=>/gemini-(1|2)\./.test(m)?(/pro/.test(m)?null:{thinkingBudget:0}):{thinkingLevel:"low"};
      for(const model of gemModels()){
        if(AI.timedOut)break;
        let tc=think(model),r,j,m="",st="";
        for(let attempt=0;attempt<2;attempt++){
          const gc={responseMimeType:"application/json",temperature:0.2};if(tc)gc.thinkingConfig=tc;
          const one=new AbortController(),stop=()=>one.abort();AI.abort.signal.addEventListener("abort",stop);
          const t1=setTimeout(()=>{one.slow=true;one.abort()},35000);
          try{r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:"POST",signal:one.signal,headers:{"content-type":"application/json","x-goog-api-key":k},body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:gc})})}
          catch(e){
            if(one.slow&&!AI.timedOut&&!AI.userCancel){r=null;break}
            throw{code:AI.userCancel?"abort":AI.timedOut||one.slow?"slow":e&&e.name==="AbortError"?"abort":"net"};
          }finally{clearTimeout(t1);AI.abort.signal.removeEventListener("abort",stop)}
          j=await r.json().catch(()=>({}));m=(j.error&&j.error.message)||"";st=(j.error&&j.error.status)||"";
          if(r.status===400&&tc&&/think/i.test(m)){tc=null;continue}
          break;
        }
        if(!r){last={code:"slow"};continue}
        if(r.status===404||(r.status===400&&/not found|not supported|is not available|deprecated/i.test(m))){last=last||{code:"http",msg:m||("modelo "+model+" no disponible"),status:r.status};continue}
        if(r.status===503||r.status===500||st==="UNAVAILABLE"||/high demand|overloaded/i.test(m)){last={code:"busy"};await sleep(400);continue}
        if(r.status===429||st==="RESOURCE_EXHAUSTED"){last={code:"rate"};continue}
        if(!r.ok)throw{code:/API_KEY_INVALID|API key not valid|UNAUTHENTICATED/i.test(m)||r.status===401||r.status===403?"badkey":"http",msg:m||(model+" · HTTP "+r.status),status:r.status};
        const c=j.candidates&&j.candidates[0];
        text=c&&c.content&&Array.isArray(c.content.parts)?c.content.parts.filter(p=>!p.thought).map(p=>p.text||"").join(""):"";
        last=null;break;
      }
      if(last)throw last;
    }
    return parseJSONText(text);
  }catch(e){if(e&&e.code)throw e;throw{code:"http",msg:String((e&&e.message)||e)}}
  finally{clearTimeout(tm);AI.abort=null}
}
function aiMsg(e){
  const c=e&&e.code;
  const known={nokey:tr("Primero conecta una llave de IA en Yo → IA para fotos.","First connect an AI key in Profile → AI for photos."),
    badkey:tr("La llave no es válida o no tiene permiso. Revísala en Yo → IA para fotos.","The key isn't valid or lacks permission. Check it in Profile → AI for photos."),
    rate:aiProvider()==="gemini"?tr("Llegaste al límite gratuito de Gemini por ahora. Espera un rato y vuelve a intentar.","You've hit Gemini's free limit for now. Wait a while and try again."):tr("Demasiadas consultas seguidas. Espera un minuto y vuelve a intentar.","Too many requests in a row. Wait a minute and try again."),
    busy:tr("Gemini está con mucha demanda en este momento. Suele pasar rápido: intenta de nuevo en unos minutos.","Gemini is very busy right now. It usually passes quickly: try again in a few minutes."),
    credit:tr("Tu cuenta de Claude no tiene crédito. Carga saldo en la consola de Claude.","Your Claude account has no credit. Add balance in the Claude console."),
    slow:tr("La IA tardó demasiado en responder. Suele ser algo momentáneo: intenta de nuevo en un rato.","The AI took too long to respond. It is usually temporary: try again in a bit."),
    net:tr("Sin conexión a internet.","No internet connection."),parse:tr("No pude interpretar la respuesta. Intenta de nuevo.","Couldn't understand the response. Try again."),abort:null
  }[c];
  if(c==="abort")return null;
  if(known!==undefined)return known;
  return (tr("No funcionó","That didn't work")+(e&&e.msg?": "+e.msg:(e&&e.status?` (HTTP ${e.status})`:"")+(e&&e.code?` [${e.code}]`:"")+(e&&e.msg||e&&e.status?"":tr(". Intenta de nuevo.",". Try again."))));
}
function aiFail(e,extra){
  const m=aiMsg(e);if(m===null)return;
  openSheet(`<h2>${tr("No funcionó","That didn't work")}</h2><p class="muted">${esc(m)}</p><div class="stack" style="margin-top:14px">${e&&(e.code==="nokey"||e.code==="badkey")?`<button class="btn" data-act="aisetup">${tr("Configurar la llave","Set up the key")}</button>`:""}${extra||""}</div>`);
}
function aiLoading(msg){openSheet(`<div class="stack" style="align-items:center;padding:28px 0 12px;text-align:center"><div class="spin" aria-hidden="true"></div><p>${esc(msg)}</p><button class="btn ghost" data-act="aicancel" style="max-width:200px">${tr("Cancelar","Cancel")}</button></div>`,null,{transient:true,onLeave:()=>{AI.userCancel=true;if(AI.abort)AI.abort.abort()}})}

const ITEMS_FORMAT=EN?`Reply ONLY with valid JSON, no text before or after, in exactly this shape:
{"items":[{"name":"Cooked white rice","grams":150,"kcal":195,"p":4.1,"c":42,"f":0.4}],"note":"one short sentence in English"}
"grams" is the estimated weight of what is shown or described; kcal, p (protein g), c (carbs g) and f (fat g) refer to that amount. Use short names in English and typical portion sizes.`:`Responde SOLO con JSON válido, sin texto antes ni después, con esta forma exacta:
{"items":[{"name":"Arroz blanco cocido","grams":150,"kcal":195,"p":4.1,"c":42,"f":0.4}],"note":"una frase breve en español"}
"grams" es el peso estimado de lo que se ve o describe; kcal, p (proteína g), c (carbohidratos g) y f (grasa g) corresponden a esa cantidad. Usa nombres cortos en español y porciones típicas de Chile cuando aplique.`;
function cleanItems(v){
  const arr=v&&Array.isArray(v.items)?v.items:[];
  return arr.map(i=>({name:String(i.name||tr("Alimento","Food")).slice(0,80),grams:Math.max(1,num(i.grams)),kcal:Math.max(0,num(i.kcal)),p:Math.max(0,num(i.p)),c:Math.max(0,num(i.c)),f:Math.max(0,num(i.f))})).filter(i=>i.kcal>0||i.p||i.c||i.f);
}
async function runPlate(file){
  aiLoading(tr("Analizando tu plato…","Analyzing your meal…"));
  try{
    const blob=await toJpeg(file,1024);
    const v=await aiJSON(tr("Eres nutricionista. Identifica cada alimento o preparación visible en la foto y estima su peso y su aporte nutricional. Si no hay comida en la imagen, devuelve items vacío y explícalo en note.\n","You are a nutritionist. Identify each food or dish visible in the photo and estimate its weight and nutrition. If there is no food in the image, return empty items and explain in note.\n")+ITEMS_FORMAT,blob);
    if($("#sheet").hidden)return;
    showAiItems(cleanItems(v),v&&v.note,{blob});
  }catch(e){if(!$("#sheet").hidden||e.code!=="abort")aiFail(e)}
}
function openDescribe(){
  if(!aiProvider()){openAiSetup();return}
  openSheet(`<h2>${tr("¿Qué comiste?","What did you eat?")}</h2><p class="muted" style="font-size:13px">${tr("Escríbelo como se lo contarías a alguien. Mientras más detalle (cantidades, marcas, preparación), mejor la estimación.","Write it the way you'd tell someone. The more detail (amounts, brands, preparation), the better the estimate.")}</p>
    <div class="stack" style="margin-top:12px"><textarea id="dT" class="input" placeholder="${tr("Ej. 2 huevos revueltos, una marraqueta con palta y un café con leche","e.g. 2 scrambled eggs, toast with avocado and a latte")}"></textarea><button class="btn" id="dOk">${tr("Calcular","Calculate")}</button></div>`,root=>{
    root.querySelector("#dOk").addEventListener("click",async()=>{
      const txt=root.querySelector("#dT").value.trim();if(!txt){toast(tr("Escribe lo que comiste","Write what you ate"));return}
      aiLoading(tr("Analizando tu comida…","Analyzing your food…"));
      try{const v=await aiJSON(tr("Eres nutricionista. Estima cada alimento de esta comida descrita por el usuario, con su peso en gramos y su aporte nutricional.\nComida: ","You are a nutritionist. Estimate each food in this meal described by the user, with its weight in grams and its nutrition.\nMeal: ")+"\"\"\""+txt.slice(0,600)+"\"\"\"\n"+ITEMS_FORMAT);if(!$("#sheet").hidden)showAiItems(cleanItems(v),v&&v.note,{text:txt.slice(0,600)})}
      catch(e){aiFail(e)}
    });
  });
}
function showAiItems(items,note,ctx){
  ctx=ctx||{};const fixed=new Set(ctx.fixed||[]);
  if(!items.length){openSheet(`<h2>${tr("No encontré comida","No food found")}</h2><p class="muted">${esc(note||tr("Intenta con otra foto o descríbelo con palabras.","Try another photo or describe it in words."))}</p>`);return}
  let meal=S.addMeal||mealNow();
  const base=items.map(i=>({...i,per:per100Of(i,i.grams)}));
  openSheet(`<h2>${tr("Revisa la estimación","Review the estimate")}</h2>
    ${note?`<p class="note" style="margin-top:8px">${esc(note)}</p>`:""}
    <div style="margin-top:6px">${base.map((i,ix)=>`<div class="aiitem"><input type="checkbox" checked data-ix="${ix}" aria-label="${tr("Incluir","Include")} ${esc(i.name)}"><div><div style="font-weight:500">${esc(i.name)}${fixed.has(i.name)?` <span class="fixtag">${tr("corregido","corrected")}</span>`:""}</div><div class="muted" style="font-size:12px;font-family:var(--mono)" id="ai${ix}"></div></div><div class="aig"><input class="input" type="number" inputmode="decimal" step="any" value="${Math.round(i.grams)}" data-g="${ix}" aria-label="${tr("Gramos de","Grams of")} ${esc(i.name)}"><span>g</span></div></div>`).join("")}</div>
    <div class="spread" style="margin:12px 0"><span class="label">Total</span><span class="num" style="font-size:30px" id="aiTot"></span></div>
    <div class="fixbox"><label for="aiFix">${tr("¿Algo no está bien?","Something wrong?")}</label><div class="fixrow"><input id="aiFix" class="input" type="text" enterkeyhint="send" autocomplete="off" placeholder="${tr("Ej. no es pollo, es cerdo","e.g. it's pork, not chicken")}"><button class="btn ghost" id="aiFixGo">${tr("Corregir","Fix")}</button></div></div>
    <div class="stack">${mealChips(meal)}<button class="btn" id="aiOk">${tr("Añadir","Add")}</button></div>
    <p class="foot" style="margin-top:10px">${tr("Es una estimación: ajusta los gramos si conoces la cantidad real.","It's an estimate: adjust the grams if you know the real amount.")}</p>`,root=>{
    const cur=()=>base.map((b,ix)=>{const g=num(root.querySelector(`[data-g="${ix}"]`).value);return{name:b.name,grams:g,...fromPer100(b.per,g),on:root.querySelector(`[data-ix="${ix}"]`).checked}});
    const upd=()=>{const c=cur();c.forEach((x,ix)=>root.querySelector("#ai"+ix).textContent=`${fmt(x.kcal)} kcal · P ${fmt(x.p)} · C ${fmt(x.c)} · ${tr("G","F")} ${fmt(x.f)}`);root.querySelector("#aiTot").textContent=fmt(c.filter(x=>x.on).reduce((a,x)=>a+x.kcal,0))+" kcal"};
    root.addEventListener("input",upd);root.addEventListener("change",upd);upd();
    wireMealChips(root,()=>meal,v=>meal=v);
    const fixIn=root.querySelector("#aiFix");
    const doFix=async()=>{
      const fix=fixIn.value.trim();if(!fix){toast(tr("Escribe qué hay que corregir","Write what needs fixing"));fixIn.focus();return}
      fixIn.blur();S.addMeal=meal;
      const prevItems=cur().map(({on,...x})=>({name:x.name,grams:r1(x.grams),kcal:Math.round(x.kcal),p:r1(x.p),c:r1(x.c),f:r1(x.f)}));
      aiLoading(tr("Corrigiendo…","Fixing…"));
      try{
        const v=await aiJSON(tr(
`Eres nutricionista. Ya estimaste esta comida${ctx.blob?" a partir de la foto adjunta":ctx.text?` descrita así: """${ctx.text}"""`:""}. Tu estimación anterior fue:
${JSON.stringify({items:prevItems})}
El usuario la corrige: """${fix.slice(0,300)}"""
Aplica SOLO esa corrección. Cambia el o los alimentos que indica (nombre y valores nutricionales recalculados para el mismo peso, salvo que el usuario diga otra cantidad), agrega o quita lo que pida, y deja todos los demás alimentos exactamente iguales. Devuelve la lista completa.
`,
`You are a nutritionist. You already estimated this meal${ctx.blob?" from the attached photo":ctx.text?` described as: """${ctx.text}"""`:""}. Your previous estimate was:
${JSON.stringify({items:prevItems})}
The user corrects it: """${fix.slice(0,300)}"""
Apply ONLY that correction. Change the food(s) it refers to (name and nutrition recalculated for the same weight, unless the user gives another amount), add or remove what they ask, and keep every other food exactly the same. Return the full list.
`)+ITEMS_FORMAT,ctx.blob||null);
        if($("#sheet").hidden)return;
        const nv=cleanItems(v);
        if(!nv.length){toast(tr("No pude aplicar la corrección. Intenta decirlo de otra forma.","Couldn't apply the fix. Try saying it another way."));sheetBack();return}
        const oldNames=new Set(prevItems.map(x=>x.name.toLowerCase()));
        showAiItems(nv,v&&v.note,{...ctx,fixed:nv.filter(x=>!oldNames.has(x.name.toLowerCase())).map(x=>x.name)});
      }catch(e){if(!$("#sheet").hidden||e.code!=="abort")aiFail(e)}
    };
    root.querySelector("#aiFixGo").addEventListener("click",doFix);
    fixIn.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();doFix()}});
    root.querySelector("#aiOk").addEventListener("click",()=>{
      const sel=cur().filter(x=>x.on&&x.grams>0);if(!sel.length){toast(tr("Marca al menos un alimento","Select at least one food"));return}
      const d=day();
      sel.forEach(it=>{const per=per100Of(it,it.grams),key="n-"+slug(it.name);
        d.entries.push({id:uid(),meal,name:it.name,grams:r1(it.grams),kcal:Math.round(it.kcal),p:r1(it.p),c:r1(it.c),f:r1(it.f),per100:per,key,src:"ia"});
        const old=S.foods[key]||{};S.foods[key]={...old,key,name:it.name,per100:per,src:"ia",lastG:r1(it.grams),uses:(old.uses||0)+1,last:Date.now()}});
      saveDay();saveFoods();closeSheet();S.tab="hoy";render();
      toast(sel.length===1?`${tr("Añadido a","Added to")} ${MEAL_NAME[meal]}`:`${sel.length} ${tr("alimentos añadidos a","foods added to")} ${MEAL_NAME[meal]}`);
    });
  });
}
async function runLabel(file){
  const code=S.pendingCode,prev=S.pendingPre||{};
  aiLoading(tr("Leyendo la tabla nutricional…","Reading the nutrition label…"));
  try{
    const blob=await toJpeg(file,1600);
    const v=await aiJSON(EN?`Read the nutrition facts label in the photo. Labels may show a "per 100 g" (or 100 ml) column and/or a "per serving" column (for example 80 g). Copy EACH column into its own field without mixing them: values from the 100 g column go in "per100" and values from the serving column go in "perServing". "servingG" is the serving size in grams or ml. If a column does not exist, set that field to null. Use Calories (kcal), Protein (g), Total carbohydrate (g) and Total fat (g). If the product name or brand is visible, include them.
Reply ONLY with valid JSON, no extra text: {"found":true,"name":"","brand":"","servingG":80,"per100":{"kcal":0,"p":0,"c":0,"f":0},"perServing":{"kcal":0,"p":0,"c":0,"f":0}}
If there is no legible nutrition label reply {"found":false}.`:`Lee la tabla de información nutricional de la foto (envase de alimento, probablemente chileno). Estas tablas suelen tener dos columnas: "100 g" (o "100 ml") y "1 porción" (por ejemplo 80 g). Copia CADA columna en su campo correcto, sin mezclarlas: los valores de la columna 100 g van en "per100" y los de la columna porción van en "perServing". "servingG" es el tamaño de la porción en gramos o ml. Si una columna no existe, deja ese campo en null. Usa "Energía (kcal)", "Proteínas (g)", "H. de C. disponibles (g)" y "Grasa total (g)". Si se ve el nombre o la marca del producto, inclúyelos.
Responde SOLO con JSON válido, sin texto adicional: {"found":true,"name":"","brand":"","servingG":80,"per100":{"kcal":0,"p":0,"c":0,"f":0},"perServing":{"kcal":0,"p":0,"c":0,"f":0}}
Si no hay una tabla nutricional legible responde {"found":false}.`,blob);
    if($("#sheet").hidden)return;
    const pick=o=>o&&num(o.kcal)>0?{kcal:num(o.kcal),p:num(o.p),c:num(o.c),f:num(o.f)}:null;
    const sg=num(v&&v.servingG)||null,p100=pick(v&&v.per100),pS=pick(v&&v.perServing);
    const per100=p100||(pS&&sg?{kcal:pS.kcal*100/sg,p:pS.p*100/sg,c:pS.c*100/sg,f:pS.f*100/sg}:null);
    if(!v||!v.found||!per100){openSheet(`<h2>${tr("No pude leer la tabla","Couldn't read the label")}</h2><p class="muted">${tr("Toma la foto de frente, con buena luz y sin reflejos, o ingresa los valores a mano.","Take the photo straight on, in good light and without glare, or enter the values manually.")}</p><div class="stack" style="margin-top:12px"><label for="fLabel" class="btn" style="display:grid;place-items:center">${tr("Tomar otra foto","Take another photo")}</label><button class="btn ghost" data-act="newmanual">${tr("Ingresar a mano","Enter manually")}</button></div>`);return}
    openNewProduct(code,{name:v.name||prev.name,brand:v.brand||prev.brand,servingG:sg||prev.servingG,per100},tr("Leí la tabla nutricional. Revisa los valores, escribe cuánto comiste y queda guardado para la próxima vez.","I read the nutrition label. Check the values, enter how much you ate, and it's saved for next time."));
  }catch(e){aiFail(e,`<button class="btn ghost" data-act="newmanual">${tr("Ingresar a mano","Enter manually")}</button>`)}
}
function openAiSetup(){
  const k=aiKey(),prov=aiProvider(k);
  openSheet(`<h2>${tr("IA para fotos","AI for photos")}</h2>
    <p class="muted" style="font-size:13px">${tr("Para la foto del plato, “Describir” y leer tablas nutricionales, la app usa una IA con tu propia llave. La llave se guarda solo en este teléfono: no va a GitHub ni a los respaldos.","For meal photos, “Describe” and reading nutrition labels, the app uses an AI with your own key. The key is stored only on this phone: it never goes to GitHub or into backups.")}</p>
    ${prov?`<p class="note" style="margin-top:10px">${tr("Conectada","Connected")}: <b style="color:var(--ink)">${PROV_NAME[prov]}</b> (…${esc(k.slice(-4))})</p>`:""}
    <div class="stack" style="margin-top:14px">
      <div class="card stack" style="gap:6px;padding:14px"><b>Gemini · ${tr("gratis","free")}</b><span class="muted" style="font-size:13px">${tr("Entra a","Go to")} <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="color:inherit">aistudio.google.com/apikey</a> ${tr("con tu cuenta de Google y toca “Create API key”. Tiene límite diario de uso y Google puede usar esas consultas para mejorar sus productos.","with your Google account and tap “Create API key”. It has a daily usage limit and Google may use those requests to improve its products.")}</span></div>
      <div class="card stack" style="gap:6px;padding:14px"><b>Claude · ${tr("pagado, muy barato","paid, very cheap")}</b><span class="muted" style="font-size:13px">${tr("Entra a","Go to")} <a href="https://platform.claude.com" target="_blank" rel="noopener" style="color:inherit">platform.claude.com</a>, ${tr("carga saldo y crea una llave en “API keys”. Cada foto cuesta una fracción de centavo de dólar.","add credit and create a key under “API keys”. Each photo costs a fraction of a cent.")}</span></div>
      <div class="field"><label for="kIn">${tr("Pega tu llave","Paste your key")}</label><input id="kIn" class="input" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="AQ.…  ·  AIza…  ·  sk-ant-…"></div>
      <p class="note" id="kStatus" hidden></p>
      <button class="btn" id="kOk">${tr("Guardar y probar","Save and test")}</button>
      ${prov?`<button class="btn danger" id="kDel">${tr("Quitar la llave","Remove the key")}</button>`:""}
    </div>`,root=>{
    root.querySelector("#kOk").addEventListener("click",async()=>{
      const v=root.querySelector("#kIn").value.replace(/\s+/g,""),pv=aiProvider(v);
      if(!pv){toast(tr("Esa llave no parece de Gemini (AQ.… o AIza…) ni de Claude (sk-ant-…). Pégala tal cual, sin agregarle nada.","That key doesn't look like a Gemini (AQ.… or AIza…) or Claude (sk-ant-…) key. Paste it exactly as given."));return}
      const btn=root.querySelector("#kOk"),stEl=root.querySelector("#kStatus");const say=t=>{stEl.hidden=false;stEl.textContent=t};btn.disabled=true;btn.textContent=tr("Probando…","Testing…");say(tr("Revisando la llave con ","Checking the key with ")+PROV_NAME[pv]+"…");
      try{
        if(pv==="gemini"){
          const models=await gemListModels(v);say(tr(`Llave reconocida. Modelos disponibles: ${models.join(", ")}. Probando…`,`Key recognized. Available models: ${models.join(", ")}. Testing…`));
          try{localStorage.setItem(P+"aikey",v);localStorage.setItem(P+"aimodels",JSON.stringify(models))}catch(e){}
        }
        const r=await aiJSON('Reply only with this JSON: {"ok":true}',null,v);
        if(!r||r.ok!==true)throw{code:"parse"};
        try{localStorage.setItem(P+"aikey",v)}catch(e){}
        closeSheet();render();toast(tr(`Listo: ${PROV_NAME[pv]} conectado`,`Done: ${PROV_NAME[pv]} connected`));
      }catch(e){
        if(e&&(e.code==="busy"||e.code==="rate"||(pv==="gemini"&&aiKey()===v))){
          try{localStorage.setItem(P+"aikey",v)}catch(x){}
          closeSheet();render();toast(e.code==='busy'||e.code==='rate'?tr(`Llave guardada: ${PROV_NAME[pv]} la reconoció, pero ahora está con mucha demanda. Prueba Describir en unos minutos.`,`Key saved: ${PROV_NAME[pv]} recognized it, but it's very busy right now. Try Describe in a few minutes.`):tr(`Llave guardada. La prueba falló: ${aiMsg(e)}`,`Key saved. The test failed: ${aiMsg(e)}`));return;
        }
        btn.disabled=false;btn.textContent=tr("Guardar y probar","Save and test");const em=aiMsg(e)||tr("Prueba cancelada","Test cancelled");say(em+(e&&e.status?` · HTTP ${e.status}`:"")+` · v${APP_VERSION}`);toast(em)}
    });
    const del=root.querySelector("#kDel");
    if(del)del.addEventListener("click",()=>{try{localStorage.removeItem(P+"aikey");localStorage.removeItem(P+"aimodels")}catch(e){}closeSheet();render();toast(tr("Llave eliminada","Key removed"))});
  });
}

/* ---------- respaldo ---------- */
function exportData(){
  const days={};Object.keys(localStorageKeys()).forEach(d=>{const v=lsGet("day-"+d);if(v)days[d]=v});
  return{app:"bocado",v:1,exported:new Date().toISOString(),profile:S.profile,foods:S.foods,days,wlog:S.wlog};
}
async function doExport(){
  const json=JSON.stringify(exportData());
  const name=`bocado-${tr("respaldo","backup")}-${today()}.json`;
  try{
    const file=new File([json],name,{type:"application/json"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:tr("Respaldo de Bocado","Bocado backup")});return}
  }catch(e){if(e&&e.name==="AbortError")return}
  try{
    const url=URL.createObjectURL(new Blob([json],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);toast(tr("Respaldo descargado","Backup downloaded"));
  }catch(e){
    openSheet(`<h2>${tr("Copia tu respaldo","Copy your backup")}</h2><p class="muted" style="font-size:13px">${tr("Copia este texto y guárdalo en una nota.","Copy this text and save it in a note.")}</p><textarea class="input" style="margin-top:10px;height:200px" readonly>${esc(json)}</textarea>`);
  }
}
function importData(text){
  let j;try{j=JSON.parse(text)}catch(e){toast(tr("Ese texto no es un respaldo válido","That text isn't a valid backup"));return}
  if(!j||j.app!=="bocado"){toast(tr("Ese archivo no es un respaldo de Bocado","That file isn't a Bocado backup"));return}
  if(j.profile){
    if(S.profile.onboarded){
      const m={};[...(S.profile.weights||[]),...(j.profile.weights||[])].forEach(w=>{if(w&&w.d)m[w.d]=w});
      S.profile.weights=Object.values(m).sort((a,b)=>a.d<b.d?-1:1).slice(-150);
    }else S.profile={...DEF_PROFILE,...j.profile};
  }
  saveProfile();
  if(j.foods&&typeof j.foods==="object"){Object.entries(j.foods).forEach(([k,f])=>{if(f&&f.per100)S.foods[k]={...(S.foods[k]||{}),...f}});saveFoods()}
  if(j.wlog&&typeof j.wlog==="object"){Object.entries(j.wlog).forEach(([d,kg])=>{if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&num(kg)>25&&!S.wlog[d])S.wlog[d]=num(kg)});saveWlog()}
  let n=0;
  if(j.days&&typeof j.days==="object"){
    Object.entries(j.days).forEach(([d,v])=>{
      if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!v)return;
      const cur=day(d),ids=new Set(cur.entries.map(e=>e.id));
      (Array.isArray(v.entries)?v.entries:[]).forEach(e=>{if(e&&!ids.has(e.id))cur.entries.push(e)});
      cur.water=Math.max(cur.water,num(v.water));cur.train=cur.train||!!v.train;
      saveDay(d);n++;
    });
  }
  closeSheet();render();toast(tr(`Respaldo importado: ${n} ${n===1?"día":"días"} y ${Object.keys(j.foods||{}).length} alimentos`,`Backup imported: ${n} ${n===1?"day":"days"} and ${Object.keys(j.foods||{}).length} foods`));
}
function openPaste(){
  openSheet(`<h2>${tr("Pegar respaldo","Paste backup")}</h2><p class="muted" style="font-size:13px">${tr("Pega aquí el texto que copiaste desde la versión de Bocado en Claude, o de un respaldo anterior.","Paste the text you copied from Bocado in Claude, or from an earlier backup.")}</p>
    <div class="stack" style="margin-top:12px"><textarea id="impT" class="input" style="height:180px" placeholder='{"app":"bocado", …}'></textarea><button class="btn" id="impOk">${tr("Importar","Import")}</button></div>`,root=>{
    root.querySelector("#impOk").addEventListener("click",()=>{const t=root.querySelector("#impT").value.trim();if(t)importData(t);else toast(tr("Pega el texto primero","Paste the text first"))});
  });
}

/* ---------- peso ---------- */
function logWeight(v){
  const kg=IMP?Math.round(num(v)/KG2LB*1000)/1000:num(v);if(!(kg>25&&kg<400)){toast(tr("Ingresa un peso válido en ","Enter a valid weight in ")+wUnit);return}
  const p=S.profile,kv=IMP?kg:r1(kg);p.weight=kv;
  const ws=(p.weights||[]).filter(w=>w.d!==today());ws.push({d:today(),kg:kv});ws.sort((a,b)=>a.d<b.d?-1:1);p.weights=ws.slice(-150);
  saveProfile();render();toast(tr("Peso guardado","Weight saved"));
}

/* ---------- registro diario de peso (independiente del plan) ---------- */
function saveWlog(){lsSet("wlog",S.wlog)}
const wlogList=()=>Object.entries(S.wlog||{}).filter(([d,kg])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&num(kg)>0).map(([d,kg])=>({d,kg:num(kg)})).sort((a,b)=>a.d<b.d?-1:1);
const wIn=v=>IMP?Math.round(num(v)/KG2LB*1000)/1000:r1(num(v));
const fmtWv=kg=>fmt1(wDisp(kg));
function wDelta(kg){const v=wDisp(kg),s=Math.abs(v)<0.05?"±":v>0?"+":"−";return `${s}${fmt1(Math.abs(v))}`}
function wAt(list,d){let r=null;for(const x of list){if(x.d<=d)r=x;else break}return r}
function shortDate(d){return new Intl.DateTimeFormat(LOC,{day:"numeric",month:"short"}).format(parseD(d)).replace(".","")}
function wChart(list,range){
  const t=today(),from=range==="all"?(list[0]?list[0].d:t):addDays(t,-({"7":6,"30":29,"90":89}[range]||29));
  const pts=list.filter(x=>x.d>=from);
  if(pts.length<2)return `<div class="wempty">${tr("Registra tu peso al menos dos días para ver la curva.","Log your weight on at least two days to see the curve.")}</div>`;
  const W=340,H=150,PL=4,PR=4,PT=12,PB=22;
  const d0=parseD(pts[0].d).getTime(),d1=parseD(pts[pts.length-1].d).getTime(),span=Math.max(1,d1-d0);
  const goal=S.profile&&S.profile.targetWeight&&S.profile.goalType!=="maintain"?S.profile.targetWeight:null;
  const vals=pts.map(x=>x.kg);let mn=Math.min(...vals),mx=Math.max(...vals);
  if(goal&&Math.abs(goal-mn)<3&&goal<mn)mn=goal;if(goal&&Math.abs(goal-mx)<3&&goal>mx)mx=goal;
  const pad=Math.max(0.3,(mx-mn)*0.15);mn-=pad;mx+=pad;
  const X=d=>PL+(parseD(d).getTime()-d0)/span*(W-PL-PR),Y=kg=>PT+(1-(kg-mn)/(mx-mn))*(H-PT-PB);
  const path=pts.map((x,i)=>`${i?"L":"M"}${X(x.d).toFixed(1)} ${Y(x.kg).toFixed(1)}`).join(" ");
  const area=`${path} L${X(pts[pts.length-1].d).toFixed(1)} ${H-PB} L${X(pts[0].d).toFixed(1)} ${H-PB} Z`;
  const last=pts[pts.length-1],hi=pts.reduce((a,b)=>b.kg>a.kg?b:a),lo=pts.reduce((a,b)=>b.kg<a.kg?b:a);
  const gl=goal&&goal>=mn&&goal<=mx?`<line x1="0" x2="${W}" y1="${Y(goal).toFixed(1)}" y2="${Y(goal).toFixed(1)}" class="wgoal"/><text x="${W-2}" y="${(Y(goal)-4).toFixed(1)}" text-anchor="end" class="wlbl">${tr("Meta","Goal")} ${fmtWv(goal)}</text>`:"";
  return `<svg viewBox="0 0 ${W} ${H}" class="wsvg" role="img" aria-label="${tr("Evolución de tu peso","Your weight over time")}">
    <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${gl}<path d="${area}" fill="url(#wg)"/><path d="${path}" class="wline"/>
    ${pts.length<=31?pts.map(x=>`<circle cx="${X(x.d).toFixed(1)}" cy="${Y(x.kg).toFixed(1)}" r="2.2" class="wpt"/>`).join(""):""}
    <circle cx="${X(last.d).toFixed(1)}" cy="${Y(last.kg).toFixed(1)}" r="4.5" class="wlast"/>
    <text x="${X(hi.d).toFixed(1)}" y="${(Y(hi.kg)-7).toFixed(1)}" text-anchor="middle" class="wlbl">${fmtWv(hi.kg)}</text>
    ${lo!==hi?`<text x="${X(lo.d).toFixed(1)}" y="${(Y(lo.kg)+14).toFixed(1)}" text-anchor="middle" class="wlbl">${fmtWv(lo.kg)}</text>`:""}
    <text x="${PL}" y="${H-5}" class="wax">${shortDate(pts[0].d)}</text><text x="${W-PR}" y="${H-5}" text-anchor="end" class="wax">${shortDate(last.d)}</text>
  </svg>`;
}
function renderPeso(){
  const list=wlogList(),t=today(),cur=list[list.length-1],todayV=S.wlog[t];
  const sel=S.wDate&&S.wDate<=t?S.wDate:t,selV=S.wlog[sel];
  const pre=selV||(wAt(list,sel)||cur||{}).kg||S.profile.weight||null;
  const range=S.wRange||"30";
  const st=(l,v,u)=>`<div class="wst"><span>${l}</span><b>${v}</b>${u?`<small>${u}</small>`:""}</div>`;
  let stats="";
  if(cur){
    const ago=n=>{const r=wAt(list,addDays(cur.d,-n));return r&&r.d!==cur.d?cur.kg-r.kg:null};
    const last7=list.filter(x=>x.d>addDays(t,-7)),avg=last7.length?last7.reduce((a,x)=>a+x.kg,0)/last7.length:null;
    const c7=ago(7),c30=ago(30);
    stats=`<section class="card"><div class="wstats">${st(tr("Actual","Current"),fmtWv(cur.kg),wUnit)}${st(tr("Promedio 7 días","7-day average"),avg?fmtWv(avg):"—",avg?wUnit:"")}${st(tr("Cambio 7 días","7-day change"),c7==null?"—":wDelta(c7),c7==null?"":wUnit)}${st(tr("Cambio 30 días","30-day change"),c30==null?"—":wDelta(c30),c30==null?"":wUnit)}</div></section>`;
  }
  const rows=[...list].reverse();
  const shown=S.wAll?rows:rows.slice(0,14);
  const hist=rows.length?`<section class="card"><div class="spread"><span class="label">${tr("Registros","Entries")}</span><span class="muted" style="font-size:12px">${rows.length}</span></div>
    <div class="list wlist">${shown.map((x,i)=>{const prev=rows[rows.indexOf(x)+1];const dv=prev?x.kg-prev.kg:null;
      return `<button class="li" data-act="wedit" data-d="${x.d}"><div><div>${esc(cap1(dateTitle(x.d)))}</div>${x.d===t||x.d===addDays(t,-1)?`<div class="muted" style="font-size:12px">${esc(shortDate(x.d))}</div>`:""}</div><span class="wv"><b>${fmtWv(x.kg)}</b> ${wUnit}${dv==null?"":`<small class="${Math.abs(dv)<0.05?"":dv>0?"up":"down"}">${wDelta(dv)}</small>`}</span></button>`}).join("")}</div>
    ${rows.length>14?`<button class="linkbtn" data-act="wall" style="margin-top:8px">${S.wAll?tr("Ver menos","Show less"):tr(`Ver los ${rows.length} registros`,`Show all ${rows.length} entries`)}</button>`:""}</section>`:"";
  $("#viewPeso").innerHTML=`
    <header class="top"><span></span><div><span class="label">${tr("Registro diario","Daily log")}</span><h1>${tr("Peso","Weight")}</h1></div><span></span></header>
    <div class="stack">
      <section class="card wtoday">
        <div class="spread"><span class="label">${sel===t?(todayV?tr("Registrado hoy","Logged today"):tr("Peso de hoy","Today's weight")):tr("Peso del","Weight for")+" "+esc(shortDate(sel))}</span>
          <label class="wdate">${IC.cal}<span>${sel===t?tr("Hoy","Today"):esc(shortDate(sel))}</span><input type="date" id="wDate" max="${t}" value="${sel}" aria-label="${tr("Fecha del registro","Entry date")}"></label></div>
        <div class="stepper wstep"><button data-act="wstep" data-d="-1" aria-label="${tr("Menos","Less")}">−</button><input id="wVal" type="number" inputmode="decimal" step="0.1" value="${pre?fmt1(wDisp(pre)).replace(",","."):""}" placeholder="—" aria-label="${tr("Peso en","Weight in")} ${wUnit}"><button data-act="wstep" data-d="1" aria-label="${tr("Más","More")}">+</button></div>
        <p class="unitline">${wUnit==="kg"?tr("kilos","kilograms"):tr("libras","pounds")}</p>
        <button class="btn" data-act="wsave">${selV?tr("Actualizar","Update"):tr("Guardar","Save")}</button>
        <p class="foot" style="text-align:center;margin-top:10px">${tr("Pésate en la mañana, después del baño y antes de comer. Este registro no cambia tus calorías.","Weigh yourself in the morning, after the bathroom and before eating. This log doesn't change your calories.")}</p>
      </section>
      ${stats}
      <section class="card"><div class="spread"><span class="label">${tr("Tendencia","Trend")}</span><div class="seg sm" id="wRange">${[["7","7D"],["30","30D"],["90","90D"],["all",tr("Todo","All")]].map(([v,l])=>`<button data-act="wrange" data-r="${v}" aria-pressed="${v===range}">${l}</button>`).join("")}</div></div>
        <div style="margin-top:10px">${wChart(list,range)}</div></section>
      ${hist}
    </div>`;
}
function saveWeightEntry(d,v){
  const kg=wIn(v);if(!(kg>25&&kg<400)){toast(tr("Ingresa un peso válido en ","Enter a valid weight in ")+wUnit);return false}
  S.wlog[d]=kg;saveWlog();return true;
}
function openWeightEdit(d){
  const kg=S.wlog[d];if(!kg)return;
  openSheet(`<h2>${esc(cap1(dateTitle(d)))}</h2><p class="muted" style="font-size:13px">${esc(new Intl.DateTimeFormat(LOC,{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(parseD(d)))}</p>
    <div class="stack" style="margin-top:14px"><div class="stepper wstep"><button data-q="-1">−</button><input id="weV" type="number" inputmode="decimal" step="0.1" value="${fmt1(wDisp(kg)).replace(",",".")}" aria-label="${tr("Peso en","Weight in")} ${wUnit}"><button data-q="1">+</button></div><p class="unitline">${wUnit}</p>
    <button class="btn" id="weOk">${tr("Guardar cambios","Save changes")}</button><button class="btn danger" id="weDel">${tr("Eliminar registro","Delete entry")}</button></div>`,root=>{
    const inp=root.querySelector("#weV");
    root.querySelectorAll("[data-q]").forEach(b=>b.addEventListener("click",()=>{inp.value=(Math.round((num(inp.value)+0.1*Number(b.dataset.q))*10)/10).toFixed(1)}));
    root.querySelector("#weOk").addEventListener("click",()=>{if(saveWeightEntry(d,inp.value)){closeSheet();render();toast(tr("Registro actualizado","Entry updated"))}});
    root.querySelector("#weDel").addEventListener("click",()=>{delete S.wlog[d];saveWlog();closeSheet();render();toast(tr("Registro eliminado","Entry deleted"))});
  });
}

/* ---------- ajustes ---------- */
const GLASSES=()=>IMP?[[237,"8 oz"],[355,"12 oz"],[473,tr("16 oz (botella)","16 oz (bottle)")],[591,tr("20 oz (botella)","20 oz (bottle)")]]:[[200,"200 ml"],[250,"250 ml"],[300,"300 ml"],[500,tr("500 ml (botella)","500 ml (bottle)")]];
const LANGS=()=>[["auto",tr("Automático","Automatic"),tr("Usa el idioma del teléfono","Uses your phone's language")],["es","Español",""],["en","English",""]];
const UNITSO=()=>[["auto",tr("Automático","Automatic"),tr("Según tu país","Based on your country")+" · "+(CC==="us"?tr("libras y pies","pounds and feet"):tr("kilos y cm","kg and cm"))],["metric",tr("Métrico","Metric"),tr("Kilos, centímetros y litros","Kilograms, centimeters and liters")],["imperial",tr("Imperial","Imperial"),tr("Libras, pies y onzas","Pounds, feet and ounces")]];
function openPicker(title,opts,cur,onPick,note){
  openSheet(`<h2>${esc(title)}</h2>${note?`<p class="muted" style="font-size:13px">${esc(note)}</p>`:""}<div class="pick">${opts.map(([v,l,sub])=>`<button class="pickrow" data-v="${esc(String(v))}" aria-pressed="${String(v)===String(cur)}"><span><span>${esc(l)}</span>${sub?`<small>${esc(sub)}</small>`:""}</span><i>${IC.check}</i></button>`).join("")}</div>`,root=>{
    root.querySelectorAll(".pickrow").forEach(b=>b.addEventListener("click",()=>{
      root.querySelectorAll(".pickrow").forEach(x=>x.setAttribute("aria-pressed",x===b));
      setTimeout(()=>onPick(b.dataset.v),120);
    }));
  });
}
function srow(act,icon,tone,title,value,extra){
  return `<button class="srow" data-act="${act}"${extra||""}><span class="sic ${tone}">${icon}</span><span class="stx">${title}</span><span class="sval">${value||""}</span><span class="schev">${IC.right}</span></button>`;
}
function renderAjustes(){
  const p=S.profile,nDays=Object.keys(localStorageKeys()).length,nW=wlogList().length;
  const langNow=langPref()==="auto"?tr("Automático","Automatic")+" · "+(LANG==="es"?"Español":"English"):(LANG==="es"?"Español":"English");
  const unitsNow=unitsPref()==="auto"?tr("Automático","Automatic"):unitsPref()==="metric"?tr("Métrico","Metric"):"Imperial";
  const glass=(GLASSES().find(g=>g[0]===Number(p.glass||(IMP?237:250)))||GLASSES()[1])[1];
  const ai=aiProvider();
  $("#viewAj").innerHTML=`
    <header class="top"><span></span><div><span class="label">Bocado</span><h1>${tr("Ajustes","Settings")}</h1></div><span></span></header>
    <div class="stack sgroups">
      <div><span class="label sl">${tr("Preferencias","Preferences")}</span><section class="card sg">
        ${srow("set-lang",IC.globe,"t1",tr("Idioma","Language"),langNow)}
        ${srow("set-units",IC.ruler,"t2",tr("Unidades","Units"),unitsNow)}
        ${srow("set-glass",IC.drop,"t3",tr("Tamaño del vaso","Glass size"),glass)}
      </section></div>
      <div><span class="label sl">${tr("Inteligencia artificial","Artificial intelligence")}</span><section class="card sg">
        ${srow("aisetup",IC.spark,"t4",tr("IA para fotos","AI for photos"),ai?PROV_NAME[ai]:tr("Opcional","Optional"))}
      </section><p class="foot sfoot">${tr("Sirve para describir comidas, analizar fotos de platos y leer tablas nutricionales. Usa tu propia llave gratuita.","Used to describe meals, analyze meal photos and read nutrition labels. It uses your own free key.")}</p></div>
      <div><span class="label sl">${tr("Tu plan","Your plan")}</span><section class="card sg">
        ${srow("onb",IC.target,"t5",tr("Rehacer el test","Retake the quiz"),p.onboarded?"":tr("Pendiente","Pending"))}
        ${srow("set-how",IC.info,"t2",tr("Cómo se calcula tu plan","How your plan is calculated"),"")}
      </section></div>
      <div><span class="label sl">${tr("Tus datos","Your data")}</span><section class="card sg">
        ${srow("export",IC.up,"t1",tr("Exportar respaldo","Export backup"),"")}
        ${srow("set-import",IC.down,"t1",tr("Importar respaldo","Import backup"),"")}
      </section><p class="foot sfoot">${tr(`Todo se guarda solo en este teléfono: ${nDays} ${nDays===1?"día":"días"} de comidas y ${nW} ${nW===1?"registro":"registros"} de peso. Exporta un respaldo de vez en cuando o antes de cambiar de teléfono.`,`Everything is stored only on this phone: ${nDays} ${nDays===1?"day":"days"} of meals and ${nW} weight ${nW===1?"entry":"entries"}. Export a backup now and then, or before switching phones.`)}</p></div>
      <div><span class="label sl">${tr("Acerca de","About")}</span><section class="card sg">
        <div class="srow static"><span class="sic t5">${IC.logo}</span><span class="stx">${tr("Versión","Version")}</span><span class="sval mono">${APP_VERSION}</span></div>
        ${srow("set-update",IC.refresh,"t3",tr("Buscar actualizaciones","Check for updates"),"")}
        <a class="srow" href="https://world.openfoodfacts.org" target="_blank" rel="noopener"><span class="sic t2">${IC.db}</span><span class="stx">${tr("Productos","Products")}</span><span class="sval">Open Food Facts</span><span class="schev">${IC.right}</span></a>
      </section></div>
      <section class="card sg">${srow("set-wipe",IC.trash,"t6 danger",`<span class="dangertx">${tr("Borrar todos los datos","Delete all data")}</span>`,"")}</section>
      <p class="foot" style="text-align:center;margin-top:6px">Bocado ${APP_VERSION}</p>
    </div>`;
}
function openHow(){
  const t=targets(S.profile);
  openSheet(`<h2>${tr("Cómo se calcula tu plan","How your plan is calculated")}</h2><div class="how">${tr(`<p><b>Calorías.</b> Metabolismo en reposo con la fórmula Mifflin-St Jeor, multiplicado por tu actividad diaria más tus entrenamientos. Para cambiar 1 kg se estiman 7.700 kcal.</p><p><b>Macros.</b> Proteína según tu objetivo y tipo de entrenamiento${t?` (${fmt1(t.ppk)} g por kg)`:""}, grasa mínimo 25 % de las calorías y el resto en carbohidratos.</p><p><b>Agua.</b> 35 ml por kg, más 0,5 L los días de entreno.</p><p><b>Ajustes.</b> Son estimaciones: si en 2–3 semanas tu peso no se mueve como esperas, rehaz el test o ajusta tu ritmo.</p><p class="muted">Datos de productos: Open Food Facts, bajo licencia ODbL. La lista de alimentos usa valores de referencia; los platos preparados son promedios aproximados.</p>`,`<p><b>Calories.</b> Resting metabolism uses the Mifflin-St Jeor formula, multiplied by your daily activity plus your workouts. Changing 1 kg is estimated at 7,700 kcal.</p><p><b>Macros.</b> Protein depends on your goal and training type${t?` (${fmt1(t.ppk)} g per kg)`:""}, fat is at least 25% of calories and carbs make up the rest.</p><p><b>Water.</b> 35 ml per kg, plus 0.5 L on workout days.</p><p><b>Adjusting.</b> These are estimates: if your weight doesn't move as expected in 2–3 weeks, retake the quiz or adjust your pace.</p><p class="muted">Product data: Open Food Facts, under the ODbL license. The food list uses reference values; prepared meals are approximate averages.</p>`)}</div>`);
}
function openImport(){
  openSheet(`<h2>${tr("Importar respaldo","Import backup")}</h2><p class="muted" style="font-size:13px">${tr("Se suma a lo que ya tienes; no borra nada.","It's added to what you already have; nothing is deleted.")}</p>
    <div class="stack" style="margin-top:12px"><label for="fImport" class="btn" style="display:grid;place-items:center">${tr("Elegir archivo","Choose file")}</label><button class="btn ghost" data-act="paste">${tr("Pegar respaldo como texto","Paste backup as text")}</button></div>`);
}
function openWipe(){
  openSheet(`<h2>${tr("¿Borrar todos los datos?","Delete all data?")}</h2><p class="muted">${tr("Se borran tu perfil, tus comidas, tus alimentos guardados y tu registro de peso de este teléfono. No se puede deshacer.","Your profile, meals, saved foods and weight log will be deleted from this phone. This can't be undone.")}</p>
    <div class="stack" style="margin-top:14px"><button class="btn ghost" data-act="export">${tr("Exportar respaldo primero","Export a backup first")}</button><button class="btn danger" id="wipeOk">${tr("Borrar todo","Delete everything")}</button></div>`,root=>{
    root.querySelector("#wipeOk").addEventListener("click",()=>{
      try{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(P))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k))}catch(e){}
      location.reload();
    });
  });
}
async function checkUpdate(){
  toast(tr("Buscando actualizaciones…","Checking for updates…"));
  try{
    const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
    if(!reg){location.reload();return}
    await reg.update();
    await sleep(800);
    if(reg.installing||reg.waiting){toast(tr("Actualizando…","Updating…"));setTimeout(()=>location.reload(),1500)}
    else toast(tr("Ya tienes la última versión","You're on the latest version"));
  }catch(e){toast(tr("No pude revisar. ¿Tienes internet?","Couldn't check. Are you online?"))}
}

/* ---------- eventos ---------- */
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]");if(!el)return;
  const a=el.dataset.act;
  if(a==="close"){leaveCur();closeSheet();return}
  if(a==="tab"){S.tab=el.dataset.tab;render();window.scrollTo(0,0);return}
  if(a==="add"){openAdd(el.dataset.meal);return}
  if(a==="wk"){S.weekSel=el.dataset.d;loadWeek();return}
  if(a==="calday"){S.calSel=S.calSel===el.dataset.d?null:el.dataset.d;loadCal();return}
  if(a==="calnav"){const ym=S.calMonth||today().slice(0,7);const [y,m]=ym.split("-").map(Number);const dt=new Date(y,m-1+Number(el.dataset.d),1);const n=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`;if(n>today().slice(0,7))return;S.calMonth=n;loadCal();return}
  if(a==="goday"){S.date=el.dataset.d;S.tab="hoy";render();window.scrollTo(0,0);return}
  if(a==="day"){const n=addDays(S.date,Number(el.dataset.d));if(n>today())return;S.date=n;render();return}
  if(a==="gotoday"){S.date=today();render();return}
  if(a==="entry"){openEntry(el.dataset.id);return}
  if(a==="food"){const f=findFood(el.dataset.key);if(f)openPortion(f);return}
  if(a==="glass"){const d=day(),g=S.profile.glass||(IMP?237:250),i=Number(el.dataset.i),filled=Math.round(d.water/g);d.water=(i+1===filled?i:i+1)*g;saveDay();render();return}
  if(a==="water"){const d=day(),g=S.profile.glass||(IMP?237:250);d.water=Math.max(0,d.water+Number(el.dataset.d)*g);saveDay();render();return}
  if(a==="train"){const d=day();d.train=!d.train;saveDay();render();return}
  if(a==="setupW"){logWeight($("#setupW").value);return}
  if(a==="logW"){logWeight($("#wIn").value);return}
  if(a==="wstep"){const i=$("#wVal");const v=num(i.value)||num(i.placeholder)||0;i.value=(Math.round((v+0.1*Number(el.dataset.d))*10)/10).toFixed(1);return}
  if(a==="wsave"){const d=S.wDate&&S.wDate<=today()?S.wDate:today();const had=!!S.wlog[d];if(saveWeightEntry(d,$("#wVal").value)){render();toast(had?tr("Registro actualizado","Entry updated"):tr("Peso guardado","Weight saved"))}return}
  if(a==="wrange"){S.wRange=el.dataset.r;renderPeso();return}
  if(a==="wedit"){openWeightEdit(el.dataset.d);return}
  if(a==="wall"){S.wAll=!S.wAll;renderPeso();return}
  if(a==="set-lang"){openPicker(tr("Idioma","Language"),LANGS(),langPref(),v=>{if(v!==langPref())setLang(v);else closeSheet()});return}
  if(a==="set-units"){openPicker(tr("Unidades","Units"),UNITSO(),unitsPref(),v=>{if(v!==unitsPref())setUnits(v);else closeSheet()});return}
  if(a==="set-glass"){openPicker(tr("Tamaño del vaso","Glass size"),GLASSES().map(([v,l])=>[v,l,""]),S.profile.glass||(IMP?237:250),v=>{S.profile.glass=Number(v);saveProfile();closeSheet();render()},tr("Cada toque en el registro de agua suma un vaso de este tamaño.","Each tap in the water tracker adds one glass of this size."));return}
  if(a==="set-how"){openHow();return}
  if(a==="set-import"){openImport();return}
  if(a==="set-update"){checkUpdate();return}
  if(a==="set-wipe"){openWipe();return}
  if(a==="onb"){startOnb();return}
  if(a==="scan"){startScanner();return}
  if(a==="scanStop"){stopScanner();return}
  if(a==="scanType"){stopScanner();openTypeCode(false);return}
  if(a==="search"){openSearch();return}
  if(a==="myfoods"){openFoods();return}
  if(a==="history"){openHistory();return}
  if(a==="mhist"){S.addMeal=el.dataset.meal;S.histMeal=el.dataset.meal;openHistory({focus:true});return}
  if(a==="hist"){const e=day(el.dataset.d).entries.find(x=>x.id===el.dataset.id);if(e)openPortion(foodFromEntry(e),null,{prefill:e});return}
  if(a==="manual"){openManual();return}
  if(a==="typecode"){openTypeCode(false);return}
  if(a==="export"){doExport();return}
  if(a==="paste"){openPaste();return}
  if(a==="aisetup"){openAiSetup();return}
  if(a==="describe"){openDescribe();return}
  if(a==="newmanual"){openNewProduct(S.pendingCode,S.pendingPre,tr("Copia los valores de la etiqueta.","Copy the values from the label."));return}
  if(a==="aicancel"){AI.userCancel=true;if(AI.abort)AI.abort.abort();closeSheet();return}
});
document.addEventListener("change",e=>{
  if(e.target.id==="wDate"){S.wDate=e.target.value||today();renderPeso();return}
  if(e.target.id==="pLang"){setLang(e.target.value);return}
  if(e.target.id==="pUnits"){setUnits(e.target.value);return}
  const k=e.target.dataset&&e.target.dataset.prof;if(!k)return;
  const v=num(e.target.value);
  S.profile[k]=v;saveProfile();render();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){if(!$("#scanner").hidden)stopScanner();else if(!$("#sheet").hidden)closeSheet()}
  if(e.key==="Enter"&&e.target.id==="setupW")logWeight(e.target.value);
  if(e.key==="Enter"&&e.target.id==="wIn")logWeight(e.target.value);
  if(e.key==="Enter"&&e.target.id==="wVal"){e.preventDefault();e.target.blur();document.querySelector("[data-act=wsave]").click()}
});
$("#fBarcode").addEventListener("change",async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;
  loading(tr("Leyendo el código…","Reading the barcode…"));
  let code=null;try{code=await decodeFile(f)}catch(err){}
  if($("#sheet").hidden)return;
  if(code)handleCode(code);else openTypeCode(true);
});
$("#fPlate").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(f)runPlate(f)});
$("#fLabel").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(f)runLabel(f)});
$("#fImport").addEventListener("change",async e=>{
  const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;
  try{importData(await f.text())}catch(err){toast(tr("No pude leer ese archivo","Couldn't read that file"))}
});
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){if(SC.on)stopScanner();releaseCamera()}
  if(!document.hidden&&S.date!==today()&&S.lastSeen===S.date){S.date=today();render()}
  S.lastSeen=today();
});

/* ---------- test inicial ---------- */
const STEPS=["intro","name","sex","age","height","weight","train","ttype","daily","goal","target","pace","calc","result"];
const QUESTIONS=STEPS.slice(1,12);
const ONB={i:0,d:null,timer:null};
function countOn(s,d){if(s==="target"||s==="pace")return d.goalType!=="maintain";if(s==="ttype")return d.train!=="0";return true}
function stepOn(s,d){if(s==="target"||s==="pace")return!!d.goalType&&d.goalType!=="maintain";if(s==="ttype")return!!d.train&&d.train!=="0";return true}
function startOnb(){
  const p=S.profile;
  ONB.d={name:p.name||"",sex:p.sex||null,age:p.age||null,height:p.height||null,weight:p.weight||null,train:p.train||null,trainType:p.trainType||null,daily:p.daily||null,goalType:p.goalType||null,targetWeight:p.targetWeight||null,pace:p.pace||"normal"};
  ONB.i=0;$("#onb").hidden=false;document.body.style.overflow="hidden";drawOnb();
}
function closeOnb(){clearTimeout(ONB.timer);$("#onb").hidden=true;document.body.style.overflow=""}
function goStep(dir){
  let i=ONB.i;
  do{i+=dir}while(i>0&&i<STEPS.length-1&&!stepOn(STEPS[i],ONB.d));
  ONB.i=Math.max(0,Math.min(STEPS.length-1,i));drawOnb();
}
function defaults(d){
  if(!d.age)d.age=30;
  if(!d.height)d.height=d.sex==="m"?160:172;
  if(!d.weight)d.weight=d.sex==="m"?62:75;
}
function fixTarget(d){
  const w=d.weight;
  if(d.goalType==="lose"&&!(d.targetWeight<w))d.targetWeight=r1(Math.max(35,w-5));
  if(d.goalType==="gain"&&!(d.targetWeight>w))d.targetWeight=r1(w+4);
}
const LIMITS={age:[14,90,1,tr("años","years")],height:IMP?[51,87,1,tr("pies y pulgadas","feet and inches")]:[130,220,1,"cm"],weight:IMP?[77,550,1,"lb"]:[35,250,0.5,"kg"],targetWeight:IMP?[77,550,1,"lb"]:[35,250,0.5,"kg"]};
function disp(f,v){if(v==null||v==="")return null;if(f==="weight"||f==="targetWeight")return IMP?Math.round(v*KG2LB):r1(v);if(f==="height")return IMP?Math.round(v/2.54):Math.round(v);return v}
const r3=n=>Math.round(n*1000)/1000;
function fromDisp(f,v){if(v==null)return null;if(f==="weight"||f==="targetWeight")return IMP?r3(v/KG2LB):v;if(f==="height")return IMP?r3(v*2.54):v;return v}
const ftin=inch=>`${Math.floor(inch/12)}′ ${inch%12}″`;
function stepper(field){
  const [mn,mx,st,u]=LIMITS[field];
  return `<div class="stepper"><button data-o="dec" data-f="${field}" aria-label="${tr("Menos","Less")}">−</button>
    ${IMP&&field==="height"?`<div id="onbFt" class="ftin" aria-live="polite">${ftin(disp("height",ONB.d.height)||67)}</div>`:`<input id="onbNum" data-f="${field}" type="number" inputmode="${st<1?"decimal":"numeric"}" step="${st}" min="${mn}" max="${mx}" value="${disp(field,ONB.d[field])??""}" aria-label="${u}">`}
    <button data-o="inc" data-f="${field}" aria-label="${tr("Más","More")}">+</button></div><div class="unitline">${u}</div><p class="live" id="onbLive"></p>`;
}
function choices(field,map,auto){
  return `<div class="stack" style="gap:10px;margin-top:10px">${Object.entries(map).map(([k,v])=>`<button class="choice" data-o="${auto?"pick":"sel"}" data-f="${field}" data-v="${k}" aria-pressed="${ONB.d[field]===k}">${esc(v[0])}${v[1]?`<small>${esc(v[1])}</small>`:""}</button>`).join("")}</div>`;
}
function liveLine(){
  const el=$("#onbLive");if(!el)return;
  const d=ONB.d,s=STEPS[ONB.i];
  if(s==="weight"&&d.weight&&d.height){const b=d.weight/Math.pow(d.height/100,2);el.textContent=`${tr("IMC","BMI")} ${fmt1(b)} · ${bmiLabel(b)}`}
  else if(s==="target"&&d.targetWeight&&d.weight){const df=d.targetWeight-d.weight;el.textContent=Math.abs(df)<0.05?tr("Igual a tu peso de hoy","Same as your weight today"):`${df>0?"+":"−"}${fmtW(Math.abs(df))} ${tr("desde hoy","from today")}`;el.classList.toggle("bad",d.goalType==="lose"?df>=0:df<=0)}
  else el.textContent="";
}
function drawOnb(){
  const d=ONB.d,s=STEPS[ONB.i];
  const qs=QUESTIONS.filter(q=>countOn(q,d)),qi=qs.indexOf(s);
  const pct=s==="intro"?0:s==="calc"||s==="result"?100:Math.round((qi)/qs.length*100);
  let body="",foot="";
  const cont=(label)=>`<button class="btn" data-o="next">${label||tr("Continuar","Continue")}</button>`;
  switch(s){
    case"intro":
      body=`<div class="onb-hero">${avatarSVG({sex:"h",height:170,weight:66,ruler:false,label:"",color:"var(--accent)",aria:tr("Figura de ejemplo","Example figure")})}</div>
        <h2>${tr("Armemos tu plan","Let's build your plan")}</h2><p class="sub">${tr("11 preguntas rápidas sobre tu cuerpo, tus hábitos y tu objetivo. Con eso calculo tus calorías, tus macros y tu agua, y armo tu avatar.","11 quick questions about your body, habits and goal. With them I calculate your calories, macros and water, and build your avatar.")}</p>`;
      foot=`<button class="btn" data-o="next">${tr("Comenzar","Start")}</button>${S.profile.onboarded?`<button class="btn ghost" data-o="cancel">${tr("Cancelar","Cancel")}</button>`:""}`;break;
    case"name":
      body=`<h2>${tr("¿Cómo te llamas?","What's your name?")}</h2><p class="sub">${tr("Para saludarte en la app. Es opcional.","So the app can greet you. It's optional.")}</p><input id="onbName" class="input" style="height:56px;font-size:20px;margin-top:10px" data-f="name" value="${esc(d.name)}" placeholder="${tr("Tu nombre","Your name")}" autocomplete="given-name" enterkeyhint="next">`;
      foot=cont()+`<button class="btn ghost" data-o="skip">${tr("Omitir","Skip")}</button>`;break;
    case"sex":
      body=`<h2>${tr("¿Cuál es tu sexo?","What's your sex?")}</h2><p class="sub">${tr("Hombres y mujeres gastan distinta energía en reposo; lo uso solo para ese cálculo y para tu avatar.","Men and women burn different amounts of energy at rest; I only use this for that calculation and for your avatar.")}</p>`+choices("sex",{h:[tr("Hombre","Male")],m:[tr("Mujer","Female")]},true);break;
    case"age":body=`<h2>${tr("¿Qué edad tienes?","How old are you?")}</h2><p class="sub">${tr("El metabolismo baja un poco con los años.","Metabolism slows a little with age.")}</p>`+stepper("age");foot=cont();break;
    case"height":body=`<h2>${tr("¿Cuánto mides?","How tall are you?")}</h2><p class="sub">${IMP?tr("En pies y pulgadas. Usa − y + para ajustar.","In feet and inches. Use − and + to adjust."):tr("En centímetros. Ejemplo: 1,70 m son 170 cm.","In centimeters. Example: 1.70 m is 170 cm.")}</p>`+stepper("height");foot=cont();break;
    case"weight":body=`<h2>${tr("¿Cuánto pesas hoy?","How much do you weigh today?")}</h2><p class="sub">${tr("Idealmente en la mañana, en ayunas.","Ideally in the morning, before eating.")}</p>`+stepper("weight");foot=cont();break;
    case"train":body=`<h2>${tr("¿Cuántos días a la semana entrenas?","How many days a week do you work out?")}</h2><p class="sub">${tr("Cuenta gimnasio, deporte o cardio de al menos 30 minutos.","Count gym, sports or cardio sessions of at least 30 minutes.")}</p>`+choices("train",TRAIN,true);break;
    case"ttype":body=`<h2>${tr("¿Qué tipo de entrenamiento haces más?","What kind of training do you do most?")}</h2><p class="sub">${tr("Define cuánta proteína necesitas.","It sets how much protein you need.")}</p>`+choices("trainType",TTYPE,true);break;
    case"daily":body=`<h2>${tr("Fuera del entrenamiento, ¿cómo es tu día?","Outside your workouts, what's your day like?")}</h2><p class="sub">${tr("Piensa en tu trabajo o estudio. La mayoría sobreestima cuánto se mueve: si dudas, elige la opción más baja.","Think about your work or studies. Most people overestimate how much they move: if unsure, pick the lower option.")}</p>`+choices("daily",DAILY,true);break;
    case"goal":body=`<h2>${tr("¿Cuál es tu objetivo?","What's your goal?")}</h2>`+choices("goalType",GOALT,true);break;
    case"target":body=`<h2>${tr("¿Cuál es tu peso meta?","What's your goal weight?")}</h2><p class="sub">${tr("Hoy pesas","Today you weigh")} ${fmtW(d.weight)}.</p>`+stepper("targetWeight");foot=cont();break;
    case"pace":{
      const opts=Object.keys(PACE_LABEL).map(k=>{const t=calcPlan({...d,onboarded:true,pace:k});
        return `<button class="choice" data-o="sel" data-f="pace" data-v="${k}" aria-pressed="${d.pace===k}"><span>${PACE_LABEL[k]}${k==="normal"?`<span class="tag">${tr("Sugerido","Suggested")}</span>`:""}</span>
          <small>${d.goalType==="lose"?"−":"+"}${fmtRate(PACE[d.goalType][k])} ${tr("por semana","per week")} · ${fmt(t.kcal)} kcal ${tr("al día","a day")}${t.eta?` · ${tr("meta en","goal by")} ${monthYear(t.eta)}`:""}${t.floored?tr(" · limitado a un mínimo seguro"," · capped at a safe minimum"):""}</small></button>`}).join("");
      body=`<h2>${tr("¿A qué ritmo quieres ir?","How fast do you want to go?")}</h2><p class="sub">${d.goalType==="gain"?tr("Subir lento ayuda a que lo que ganes sea más músculo que grasa.","Gaining slowly helps more of it be muscle rather than fat."):tr("Bajar más rápido cuesta más sostenerlo y arriesga músculo.","Losing faster is harder to sustain and risks muscle.")}</p><div class="stack" style="gap:10px;margin-top:10px">${opts}</div>`;
      foot=cont();break;}
    case"calc":
      body=`<div class="stack" style="gap:16px;margin-top:30px"><h2>${tr("Calculando tu plan…","Calculating your plan…")}</h2>
        ${(EN?["Resting metabolism","Daily burn with your activity","Calories for your goal","Protein, fat and carbs","Daily water"]:["Metabolismo en reposo","Gasto diario con tu actividad","Calorías para tu objetivo","Proteína, grasa y carbohidratos","Agua diaria"]).map((l,i)=>`<div class="calcline" style="transition-delay:${i*220}ms"><span class="dot" style="background:var(--accent)"></span>${l}</div>`).join("")}</div>`;
      break;
    case"result":{
      const p={...d,onboarded:true},t=calcPlan(p);
      const realAdj=Math.round(t.kcal-calcPlanTdee(p));
      const adjTxt=t.goalType==="maintain"?tr("Sin ajuste: comes lo que gastas","No adjustment: you eat what you burn"):t.floored?`${realAdj>0?"+":"−"}${fmt(Math.abs(realAdj))} kcal ${tr("(limitado al mínimo seguro)","(capped at a safe minimum)")}`:`${t.adj>0?"+":"−"}${fmt(Math.abs(t.adj))} kcal ${tr("para","to")} ${t.goalType==="gain"?tr("subir","gain"):tr("bajar","lose")} ${fmtRate(t.kgWeek)} ${tr("por semana","per week")}`;
      body=`<span class="label">${tr("Tu plan","Your plan")}${d.name?", "+esc(d.name):""}</span>
        <div class="planbig"><span class="num">${fmt(t.kcal)}</span><small>${tr("kcal al día","kcal a day")}</small></div>
        <div class="macros" style="margin-top:0">${[[tr("Proteína","Protein"),t.pro,"var(--pro)"],[tr("Carbos","Carbs"),t.carb,"var(--carb)"],[tr("Grasa","Fat"),t.fat,"var(--fat)"]].map(([l,v,c])=>`<div class="macro"><span class="label"><span class="dot" style="background:${c}"></span>${l}</span><div style="margin-top:4px"><span class="num">${fmt(v)}</span><span class="of"> g</span></div></div>`).join("")}</div>
        ${avatarPair(p,t)}
        <dl class="stats card" style="padding:4px 14px">
          <div><dt>${tr("En reposo","At rest")}</dt><dd>${fmt(t.bmr)}<small>kcal</small></dd></div>
          <div><dt>${tr("Mantención","Maintenance")}</dt><dd>${fmt(t.tdee)}<small>kcal</small></dd></div>
          <div><dt>${tr("Ajuste","Adjustment")}</dt><dd style="font-size:15px;font-family:var(--body);font-weight:600;text-align:right">${adjTxt}</dd></div>
          <div><dt>${tr("Agua","Water")}</dt><dd>${fmtWater(t.water)}<small>${waterUnit} ${tr("al día","a day")}</small></dd></div>
          ${t.eta?`<div><dt>${tr("Meta","Goal")}</dt><dd style="font-size:15px;font-family:var(--body);font-weight:600">${fmtW(d.targetWeight)} ${tr("en","by")} ${monthYear(t.eta)}</dd></div>`:""}
        </dl>
        ${t.floored?`<p class="note">${tr(`Tu meta quedó en el mínimo seguro para ti (${fmt(t.kcal)} kcal), así que el avance será algo más lento que el ritmo elegido.`,`Your goal was set at your safe minimum (${fmt(t.kcal)} kcal), so progress will be a bit slower than the chosen pace.`)}</p>`:""}`;
      foot=`<button class="btn" data-o="finish">${tr("Empezar","Get started")}</button>`;break;}
  }
  const showBack=ONB.i>0&&s!=="calc"&&s!=="result";
  $("#onb").innerHTML=`<div class="onb-in">
    <div class="onb-top"><button class="iconbtn" data-o="back" aria-label="${tr("Atrás","Back")}" ${showBack?"":"style=\"visibility:hidden\""}>${IC.left}</button>
      <div class="onb-prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      ${s==="intro"&&!S.profile.onboarded?`<button class="langbtn" data-o="lang">${EN?"Español":"English"}</button>`:`<span class="label" style="text-align:right">${qi>=0?(qi+1)+"/"+qs.length:""}</span>`}</div>
    <div class="onb-body" id="onbBody">${body}</div>
    <div class="onb-foot">${foot}</div></div>`;
  $("#onb").scrollTop=0;
  liveLine();
  if(s==="calc"){
    requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll(".calcline").forEach(e=>e.classList.add("on"))));
    ONB.timer=setTimeout(()=>{ONB.i=STEPS.indexOf("result");drawOnb()},1500);
  }
  const ni=$("#onbNum")||$("#onbName");
  if(ni&&window.matchMedia("(pointer:fine)").matches)ni.focus();
}
function validStep(){
  const d=ONB.d,s=STEPS[ONB.i];
  if(LIMITS[s==="target"?"targetWeight":s]){
    const f=s==="target"?"targetWeight":s,[mn,mx,,u]=LIMITS[f],dv=num(disp(f,d[f]));
    if(!(dv>=mn&&dv<=mx)){toast(tr(`Ingresa un valor entre ${mn} y ${mx} ${u}`,`Enter a value between ${mn} and ${mx} ${u}`));return false}
    const v=num(d[f]);
    d[f]=f==="age"||(f==="height"&&!IMP)?Math.round(v):IMP?r3(v):r1(v);
    if(s==="target"){
      if(d.goalType==="lose"&&!(v<d.weight)){toast(tr("Para perder grasa, la meta debe ser menor a tu peso de hoy","To lose fat, your goal must be below today's weight"));return false}
      if(d.goalType==="gain"&&!(v>d.weight)){toast(tr("Para ganar músculo, la meta debe ser mayor a tu peso de hoy","To build muscle, your goal must be above today's weight"));return false}
    }
  }
  return true;
}
function finishOnb(){
  const d=ONB.d,p=S.profile;
  const changedGoal=p.goalType!==d.goalType||p.targetWeight!==d.targetWeight||!p.onboarded;
  const np={...p,...d,name:String(d.name||"").trim().slice(0,30),onboarded:true};
  delete np.activity;delete np.goal;
  if(changedGoal){np.startWeight=d.weight;np.startDate=today()}
  const ws=(np.weights||[]).filter(w=>w.d!==today());ws.push({d:today(),kg:IMP?d.weight:r1(d.weight)});ws.sort((a,b)=>a.d<b.d?-1:1);np.weights=ws.slice(-150);
  if(d.goalType==="maintain")np.targetWeight=null;
  S.profile=np;saveProfile();closeOnb();S.tab="hoy";render();window.scrollTo(0,0);
  toast(np.name?tr(`Listo, ${np.name}. Tu plan está activo`,`All set, ${np.name}. Your plan is active`):tr("Listo. Tu plan está activo","All set. Your plan is active"));
}
$("#onb").addEventListener("click",e=>{
  const b=e.target.closest("[data-o]");if(!b)return;
  const a=b.dataset.o,d=ONB.d,f=b.dataset.f;
  if(a==="back"){goStep(-1);return}
  if(a==="cancel"){closeOnb();return}
  if(a==="skip"){d.name="";goStep(1);return}
  if(a==="next"){if(!validStep())return;if(d.sex)defaults(d);goStep(1);return}
  if(a==="pick"){d[f]=b.dataset.v;if(f==="sex")defaults(d);if(f==="goalType")fixTarget(d);if(f==="train"&&b.dataset.v==="0")d.trainType=null;
    b.parentElement.querySelectorAll(".choice").forEach(x=>x.setAttribute("aria-pressed",x===b));ONB.timer=setTimeout(()=>goStep(1),180);return}
  if(a==="sel"){d[f]=b.dataset.v;drawOnb();return}
  if(a==="inc"||a==="dec"){const [mn,mx,st]=LIMITS[f];let v=num(disp(f,d[f]))||mn;v=Math.min(mx,Math.max(mn,r1(v+(a==="inc"?st:-st))));d[f]=fromDisp(f,v);if($("#onbNum"))$("#onbNum").value=v;if($("#onbFt"))$("#onbFt").textContent=ftin(v);liveLine();return}
  if(a==="finish"){finishOnb();return}
  if(a==="lang"){setLang(EN?"es":"en");return}
});
$("#onb").addEventListener("input",e=>{const f=e.target.dataset&&e.target.dataset.f;if(!f)return;ONB.d[f]=f==="name"?e.target.value:fromDisp(f,num(e.target.value)||null);liveLine()});
$("#onb").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.target.id==="onbNum"||e.target.id==="onbName")){e.preventDefault();$("#onb [data-o=next]")&&$("#onb [data-o=next]").click()}});

/* Sin zoom por doble toque: el segundo toque rápido sobre algo que no es un control (fondo, botón desactivado) se ignora */
let lastTap=0;
document.addEventListener("touchend",e=>{
  const now=Date.now(),quick=now-lastTap<350;lastTap=now;
  if(quick&&e.touches.length===0&&!e.target.closest("button:not([disabled]),a[href],label,input,select,textarea,[data-act]:not([disabled]),[data-o]"))e.preventDefault();
},{passive:false});

/* ---------- inicio ---------- */
(function init(){
  const p=lsGet("profile");if(p)S.profile={...DEF_PROFILE,...p};
  const f=lsGet("foods");if(f&&f.items)S.foods=f.items;
  const wl=lsGet("wlog");if(wl&&typeof wl==="object")S.wlog=wl;else{(S.profile.weights||[]).forEach(w=>{if(w&&w.d&&w.kg)S.wlog[w.d]=w.kg});if(Object.keys(S.wlog).length)saveWlog()}
  S.lastSeen=today();
  document.querySelectorAll("[data-i18n]").forEach(el=>{const v=el.getAttribute("data-i18n").split("|");el.textContent=EN?v[1]:v[0]});
  document.querySelectorAll("[data-i18n-aria]").forEach(el=>{const v=el.getAttribute("data-i18n-aria").split("|");el.setAttribute("aria-label",EN?v[1]:v[0])});
  render();
  if(!S.profile.onboarded)startOnb();
  if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){
    const hadController=!!navigator.serviceWorker.controller;let reloaded=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{if(hadController&&!reloaded&&$("#sheet").hidden&&$("#onb").hidden&&$("#scanner").hidden){reloaded=true;location.reload()}});
    navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).then(reg=>{document.addEventListener("visibilitychange",()=>{if(!document.hidden)reg.update().catch(()=>{})})}).catch(()=>{});
  }
})();
})();
