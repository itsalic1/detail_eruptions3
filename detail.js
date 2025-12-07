let data;
let eruptions = [];
let selectedName;
let selectedYear = 0;
let selectedNumber = 0;
let currentIndex = 0;

// immagini vulcano
let stratoImg, calderaImg, complexImg, cinderImg, compoundImg, craterImg, fissureImg;
let lava_coneImg, lava_domeImg, maarImg, pumiceImg, pyroclastic_coneImg, pyroclastic_shieldImg;
let shieldImg, subglacialImg, submarineImg, tuffImg, volcanic_fieldImg;

// immagine mappa
let worldMap; 

function preload() {
  // preload data e mappa
  data = loadTable("data_impatto.csv", "csv", "header");
  worldMap = loadImage("worldmap.png");

  // preload illustrazioni
  stratoImg = loadImage("stratovolcano.png");
  calderaImg = loadImage("caldera.png");
  complexImg = loadImage("complex_volcano.png");
  cinderImg = loadImage("cinder_cone.png");
  compoundImg = loadImage("compound_volcano.png");
  craterImg = loadImage("crater_rows.png");
  fissureImg = loadImage("fissure_vent.png");
  lava_coneImg = loadImage("lava_cone.png");
  lava_domeImg = loadImage("lava_dome.png");
  maarImg = loadImage("maar.png");
  pumiceImg = loadImage("pumice_cone.png");
  pyroclastic_coneImg = loadImage("pyroclastic_cone.png");
  pyroclastic_shieldImg = loadImage("pyroclastic_shield.png");
  shieldImg = loadImage("shield_volcano.png");
  subglacialImg = loadImage("subglacial_volcano.png");
  submarineImg = loadImage("submarine.png");
  tuffImg = loadImage("tuff_cone.png");
  volcanic_fieldImg = loadImage("volcanic_field.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Helvetica");

  // legge parametri ed assegna a variabili
  selectedName = getQueryParam("name");
  selectedYear = int(getQueryParam("year"));
  selectedNumber = int(getQueryParam("number"));

  if (!selectedName) return;

  // popola eruptions[] filtrando per Name
  for (let i = 0; i < data.getRowCount(); i++) {
    if (data.getString(i, "Name") === selectedName) {
      eruptions.push({
        year: int(data.getString(i, "Year")),
        type: data.getString(i, "Type") || "Unknown",
        deaths: data.getString(i, "Deaths") || "Not Available",
        number: int(data.getString(i, "Number")),
        lat: float(data.getString(i, "Latitude")),
        lon: float(data.getString(i, "Longitude")),
      });
    }
  }

  // ordina per anno
  eruptions.sort((a, b) => a.year - b.year);

  // sincronizza currentIndex con Number o Year
  if (!isNaN(selectedNumber) && selectedNumber > 0) {
    const idxByNumber = eruptions.findIndex(e => e.number === selectedNumber);
    if (idxByNumber !== -1) currentIndex = idxByNumber;
  } else if (!isNaN(selectedYear) && selectedYear > 0) {
    const idxByYear = eruptions.findIndex(e => e.year === selectedYear);
    if (idxByYear !== -1) {
      currentIndex = idxByYear;
      selectedNumber = eruptions[currentIndex].number;
    }
  }

  // fallback (primo elemento)
  if (eruptions.length > 0 && currentIndex === 0) {
    selectedYear = eruptions[0].year;
    selectedNumber = eruptions[0].number;
  }
}

function draw() {
  background("#FFFFFF");

  /* fallback nel caso in cui 
  NON ci sia alcun vulcano selezionato */
  if (eruptions.length === 0) {
    fill(0);
    textSize(24);
    textAlign(LEFT, TOP);
    text("Nessun vulcano selezionato", 50, 50);
    drawBackButton();
    return;
  }

  // recupera elemento nell'array e salva in selected
  let selected = eruptions[currentIndex];

  // 1. aggiunge illustrazione di sfondo
  drawVolcanoTypeBackground(selected.type);
  
  // 2. aggiunge mappa per sez. location
  drawMap(selected.lat, selected.lon);
  
  // 3. aggiunge Back button
  drawBackButton();

  // 4. aggiunge testo (titolo etc.)
  writeText();
  
  // 5. aggiunge elementi per navigazione negli anni 
  drawYearNavigator(selected.year);
  
  // 6. aggiunge la descrizione della tipologia di vulcano
  drawVolcanoDescription(selected.type);
}

// restituisce il valore del parametro x presente nell'URL
function getQueryParam(param) {
  let urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/* FORMATTAZIONE ANNO - 
funzione per formattare l'anno con AD/BC */
function formatYear(year) {
  if (year < 0) {
    return Math.abs(year) + " BC";
  } else {
    return Math.abs(year) + " AD";
  }
}

/* NORMALIZZAZIONE TESTO - 
funzione per normalizzare, rimuovendo spazi extra e convertendo in minuscolo */
function normalizeType(typeStr) {
  if (!typeStr) return "";
  return typeStr.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,;]/g, '');
}

/* RESTITUZIONE DESCRIZIONE - 
funzione per ottenere la descrizione del vulcano */
function getVolcanoDescription(type) {
  let normalizedType = normalizeType(type);
  
  // descrizioni per le diverse tipologie di vulcano
  if (normalizedType.includes("caldera")) {
    return "Large, roughly circular depression formed when a volcano's magma chamber is emptied by eruption or subsurface magma movement, causing the overlying rock roof to collapse.";
  }
  else if (normalizedType.includes("cinder cone") || normalizedType.includes("cinder")) {
    return "Smallest and most common type of volcano, built from accumulation of pyroclastic fragments (cinders, ash, scoria) ejected from a single vent.";
  }
  else if (normalizedType.includes("complex volcano") || normalizedType.includes("complex")) {
    return "Mixed volcanic landform consisting of related volcanic centers with associated lava flows and pyroclastic deposits.";
  }
  else if (normalizedType.includes("crater rows") || normalizedType.includes("crater")) {
    return "Linear alignments of small volcanic cones and craters that form along active fissures, typically composed of spatter and cinder cones.";
  }
  else if (normalizedType.includes("fissure vent") || normalizedType.includes("fissure")) {
    return "Linear volcanic opening through which lava erupts, typically with little explosive activity.";
  }
  else if (normalizedType.includes("lava cone")) {
    return "Small, steep-sided cone built from welded fragments of molten lava called spatter, which adhere together upon impact near a volcanic vent.";
  }
  else if (normalizedType.includes("lava dome")) {
    return "Circular, mound-shaped volcanic protrusion formed by slow extrusion of highly viscous, silica-rich lava that accumulates around the vent.";
  }
  else if (normalizedType.includes("maar")) {
    return "Broad, low-relief volcanic crater formed by phreatomagmatic eruptions when groundwater comes into contact with hot magma.";
  }
  else if (normalizedType.includes("pumice cone") || normalizedType.includes("pumice")) {
    return "Volcanic cone built from accumulation of lapilli-to-block-sized pumice deposits ejected from moderate-intensity explosive eruptions.";
  }
  else if (normalizedType.includes("pyroclastic cone") || normalizedType.includes("pyroclastic")) {
    return "General term for volcanic cones constructed from accumulation of explosively ejected fragmental material around a vent.";
  }
  else if (normalizedType.includes("pyroclastic shield")) {
    return "Uncommon type of shield volcano formed primarily from pyroclastic and highly explosive eruptions rather than fluid lava flows.";
  }
  else if (normalizedType.includes("shield volcano") || normalizedType.includes("shield")) {
    return "Large volcano with low, gently sloping profile (typically 2–10 degrees), formed by eruption of highly fluid, low-viscosity basaltic lava.";
  }
  else if (normalizedType.includes("stratovolcano") || normalizedType.includes("strato")) {
    return "Tall, conical volcano built from many alternating layers of hardened lava, ash, and pyroclastic material deposited during successive eruptions.";
  }
  else if (normalizedType.includes("subglacial volcano") || normalizedType.includes("subglacial")) {
    return "Volcanic landform produced by eruptions beneath glaciers or ice sheets, where magma melts overlying ice and rapidly cools lava.";
  }
  else if (normalizedType.includes("submarine volcano") || normalizedType.includes("submarine")) {
    return "Volcanic eruption occurring beneath the ocean surface, more prevalent than subaerial volcanism.";
  }
  else if (normalizedType.includes("tuff cone") || normalizedType.includes("tuff")) {
    return "Pyroclastic cone composed primarily of consolidated volcanic ash (tuff) formed through phreatomagmatic eruptions.";
  }
  else if (normalizedType.includes("volcanic field") || normalizedType.includes("volcanic")) {
    return "Geographic area containing clusters of up to 100 or more volcanoes, typically 30–80 kilometers in diameter.";
  }
  else if (normalizedType.includes("compound")) {
    return "Compound volcano - a volcanic center that has experienced multiple eruptions from different vents.";
  }
  else {
    return "Volcanic formation with unique geological characteristics.";
  }
}

/* ILLUSTRAZIONE TIPOLOGIA -
illustrazione vulcano come SFONDO */
function drawVolcanoTypeBackground(typeRaw) {
  let type = normalizeType(typeRaw);
  
  push();
  translate(width * 0.25, height / 2);
  imageMode(CENTER);
  
  // riduzione opacità!
  tint(255, 100);
  
  let imgWidth = min(1100, width * 0.95);
  let imgHeight = imgWidth * (750/1000);

  // cambio immagine a seconda della tipologia di vulcano
  switch(true) {
    case type.includes("stratovolcano"):
      image(stratoImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("caldera"):
      image(calderaImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("cinder"):
      image(cinderImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("shield"):
      image(shieldImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("complex"):
      image(complexImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("compound"):
      image(compoundImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("fissure"):
      image(fissureImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("lava cone"):
      image(lava_coneImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("lava dome"):
      image(lava_domeImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("maar"):
      image(maarImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("pumice"):
      image(pumiceImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("pyroclastic cone"):
      image(pyroclastic_coneImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("pyroclastic shield"):
      image(pyroclastic_shieldImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("subglacial"):
      image(subglacialImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("submarine"):
      image(submarineImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("tuff"):
      image(tuffImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("volcanic"):
      image(volcanic_fieldImg, 0, 0, imgWidth, imgHeight);
      break;
      
    case type.includes("crater"):
      image(craterImg, 0, 0, imgWidth, imgHeight);
      break;
  }
  
  tint(255, 255);
  pop();
}

/* AGGIUNTA DESCRIZIONE -
funzione per disegnare la descrizione del vulcano */
function drawVolcanoDescription(typeRaw) {
  let margin = 60;
  let descriptionY = 310;
  
  // INIZIO: il testo è allineato al punto d'inizio della mappa
  let mapW = 320;
  
  // LARGHEZZA: il testo va a capo quando raggiunge il bordo della mappa
  let textWidthValue = mapW;
  
  // TESTO: titolo del tipo di vulcano
  push();
  fill(245, 40, 0);
  textSize(20);
  textAlign(LEFT, TOP);
  text(typeRaw, margin, descriptionY);
  pop();
  
  // TESTO: descrizione (sempre a capo quando raggiunge il bordo della mappa)
  let description = getVolcanoDescription(typeRaw);
  push();
  fill(0);
  textSize(14);
  textLeading(16);
  textAlign(LEFT, TOP);
  
  // TESTO / DIM. = larghezza fissa pari alla larghezza della mappa
  text(description, margin, descriptionY + 40, textWidthValue);
  pop();
}

/* AGGIUNTA TITOLO -
funzione per scrivere titolo*/
function writeText() {
  let margin = 60;
  
  // TESTO: prima riga - "THE IMPACT OF"
  fill(0);
  textAlign(LEFT, TOP);
  textSize(48);
  textStyle(BOLD);
  let y1 = 75;
  text("THE IMPACT OF ", margin, y1);

  // TESTO: seconda riga - nome del vulcano in rosso
  fill(245, 40, 0);
  let volcanoName = selectedName ? selectedName.toUpperCase() : "UNKNOWN";
  let y2 = y1 + 55;
  text(volcanoName, margin, y2);

  // TESTO: "IN" in nero sulla stessa riga
  fill(0);
  text(" IN", margin + textWidth(volcanoName), y2);
}

/* AGGIUNTA MAPPA -
funzione per aggiungere la mappa  */
function drawMap(lat, lon) {
  let margin = 60;
  let mapW = 320;
  let mapH = 180;
  let mapX = margin;
  let mapY = height - mapH - margin;
  let cornerRadius = 10;

  // TESTO: titolo "location"
  let locationY = mapY - 40; 
  push();
  fill(245, 40, 0); 
  textSize(20);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("Location", mapX, locationY);
  pop();

  // BASE: sfondo bianco semi-trasparente 
  push();
  fill(255, 230);
  noStroke();
  rect(mapX - 5, mapY - 5, mapW + 10, mapH + 10, cornerRadius + 2);
  pop();

  // BASE: cornice rossa
  push();
  stroke(245, 40, 0);
  strokeWeight(1);
  noFill();
  rect(mapX, mapY, mapW, mapH, cornerRadius);
  pop();

  // MAPPA: insieme di elementi per mappa STRETCHATA 
  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.roundRect(mapX + 2, mapY + 2, mapW - 4, mapH - 4, cornerRadius - 2);
  drawingContext.clip();
  
  // STRETCH nello specifico
  image(worldMap, mapX + 2, mapY + 2, mapW - 4, mapH - 4);
  
  drawingContext.restore();
  pop();

  // MAPPA: calcolo posizione con STRETCH
  let xNormal = map(lon, -180, 180, mapX, mapX + mapW);
  let yNormal = map(lat, 90, -90, mapY, mapY + mapH);
  
  // STRETCH: PARAMETRI!
  let stretchX = 0.85;
  let offsetX = -40;
  let stretchY = 1.0;
  let offsetY = 10;
  
  // MAPPA: calcolo posizione punto con stretch
  let x = (xNormal - (mapX + mapW/2)) * stretchX + (mapX + mapW/2) + offsetX;
  let y = (yNormal - (mapY + mapH/2)) * stretchY + (mapY + mapH/2) + offsetY;
  
  // MAPPA / STILE: effetto FLUO/NEON 
  push();
  noStroke();
  
  // 1. glow esterno (3 livelli per effetto fluo)
  for (let i = 0; i < 3; i++) {
    let size = 35 + i * 15; // raggio crescente
    let alpha = map(i, 0, 2, 40, 10); // maggiore trasparenza
    
    fill(255, 100 + i * 20, 0, alpha);
    ellipse(x, y, size, size);
  }
  
  // 2. anello intermedio
  strokeWeight(2);
  stroke(245, 40, 0);
  noFill();
  ellipse(x, y, 7, 7);
  
  // 3. nucleo principale
  noStroke();
  fill(245, 40, 0); 
  ellipse(x, y, 6, 6);
  
  // 4. bordo centrale 
  fill(255, 40, 0); 
  ellipse(x, y, 5, 5);
  
  // 5. puntino interno (effetto hot-spot)
  fill(245, 40, 0);
  ellipse(x, y, 4, 4);
  
  pop();
}

function drawBackButton() {
  noStroke();
  fill(0);
  textSize(18);
  textAlign(LEFT, TOP);
  text("← BACK", 20, 20);
}

/* BACK BUTTON -
funzione per tornare indietro all'index */
function drawYearNavigator(year) {
  let margin = 60;
  let y = 230;
  let navigatorX = margin;
  
  textSize(48);
  let leftArrowWidth = textWidth("<");
  textSize(72);
  let yearFormatted = formatYear(year);
  let yearWidth = textWidth(yearFormatted);
  textSize(48);
  let rightArrowWidth = textWidth(">");
  
  // altezza e padding cornice
  let spaceBetween = 40;
  let framePadding = 15; 
  let frameHeight = 70; 
  
  textAlign(LEFT, CENTER);
  fill(0);

  // FRECCIA SINISTRA / DIM.
  let leftArrowX = navigatorX;
  let leftFrameX = leftArrowX - framePadding;
  let leftFrameY = y - frameHeight/2;
  
  // FRECCIA SINISTRA: cornice
  push();
  stroke(245, 40, 0); // Arancione/rosso
  strokeWeight(1);
  noFill();
  rect(leftFrameX, leftFrameY, leftArrowWidth + framePadding*2, frameHeight, 10); // Bordi arrotondati 10px
  pop();
  
  // FRECCIA SINISTRA: disegno "<"
  push();
  fill(245, 40, 0);
  textSize(48);
  text("<", leftArrowX, y);
  pop();

  // TESTO: rappresentazione anno con formattazione
  push();
  fill(245, 40, 0);
  textSize(72);
  
  let yearX = leftArrowX + leftArrowWidth + spaceBetween;
  text(yearFormatted, yearX, y);
  
  let rightArrowX = yearX + yearWidth + spaceBetween;
  pop();

  // FRECCIA DESTRA / DIM.
  let rightFrameX = rightArrowX - framePadding;
  let rightFrameY = y - frameHeight/2;
  
  // FRECCIA DESTRA: cornice
  push();
  stroke(245, 40, 0); 
  strokeWeight(1);
  noFill();
  rect(rightFrameX, rightFrameY, rightArrowWidth + framePadding*2, frameHeight, 10); // Bordi arrotondati 10px
  pop();
  
  // FRECCIA DESTRA: disegno ">"
  push();
  fill(245, 40, 0);
  textSize(48);
  text(">", rightArrowX, y);
  pop();
}
/* INTERAZIONI -
funzione per interazioni e collegamenti */
function mousePressed() {
  // BACK BUTTON
  if (mouseX > 15 && mouseX < 105 && mouseY > 15 && mouseY < 45) {
    window.location.href = "index.html";
    return;
  }

  // NAV. ANNI / DIM: calcolo posizione
  let margin = 60;
  let y = 230;
  let navigatorX = margin;
  
  // sinistra
  textSize(48);
  let leftArrowWidth = textWidth("<");
  let framePadding = 15;
  let frameHeight = 70;
  let leftArrowX = navigatorX;
  let leftFrameX = leftArrowX - framePadding;
  let leftFrameY = y - frameHeight/2;
  
  // centro
  textSize(72);
  let yearFormatted = formatYear(selectedYear);
  let yearWidth = textWidth(yearFormatted);
  let yearX = leftArrowX + leftArrowWidth + 40;
  
  // destra
  textSize(48);
  let rightArrowWidth = textWidth(">");
  let rightArrowX = yearX + yearWidth + 40;
  let rightFrameX = rightArrowX - framePadding;
  let rightFrameY = y - frameHeight/2;

  // FRECCIA SINISTRA: cliccabilità (area cornice)
  if (mouseX > leftFrameX && 
      mouseX < leftFrameX + leftArrowWidth + framePadding*2 &&
      mouseY > leftFrameY && 
      mouseY < leftFrameY + frameHeight) {
    if (currentIndex > 0) {
      currentIndex--;
      selectedYear = eruptions[currentIndex].year;
      selectedNumber = eruptions[currentIndex].number;
    }
    return;
  }

  // FRECCIA DESTRA: cliccabilità (area cornice)
  if (mouseX > rightFrameX && 
      mouseX < rightFrameX + rightArrowWidth + framePadding*2 &&
      mouseY > rightFrameY && 
      mouseY < rightFrameY + frameHeight) {
    if (currentIndex < eruptions.length - 1) {
      currentIndex++;
      selectedYear = eruptions[currentIndex].year;
      selectedNumber = eruptions[currentIndex].number;
    }
    return;
  }
}

/* RESPONSIVENESS -
funzione per far si che la finestra sia responsive */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
