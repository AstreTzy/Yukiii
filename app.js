// CONTROL DE DATOS DEL JUGADOR
let puntosDeAlma = 3761;

// VARIABLES PARA EL SENSOR DE ARRASTRE (SWIPE)
let arrastreInicialY = 0;
let interactuandoConSobre = false;

// 1. SISTEMA DE NAVEGACIÓN ENTRE PESTAÑAS
function cambiarPestaña(nombrePestaña) {
  // Desactivar todas las pestañas de navegación
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
  // Ocultar todas las secciones globales
  document.querySelectorAll('.seccion-app').forEach(s => s.classList.add('oculto'));

  // Activar la pestaña correcta
  if (nombrePestaña === 'cofres') {
    document.querySelectorAll('.tab')[0].classList.add('activo');
    document.getElementById('pestaña-cofres').classList.remove('oculto');
  } else if (nombrePestaña === 'datos') {
    document.querySelectorAll('.tab')[1].classList.add('activo');
    document.getElementById('pestaña-datos').classList.remove('oculto');
  } else if (nombrePestaña === 'cromos') {
    document.querySelectorAll('.tab')[2].classList.add('activo');
    document.getElementById('pestaña-cromos').classList.remove('oculto');
  }
}

// 2. LÓGICA DE SELECCIÓN EN EL CARRUSEL 3D
function seleccionarCofre(elementoClickado, tipoCofre) {
  const items = document.querySelectorAll('.cofre-item');
  items.forEach(item => {
    item.classList.remove('activo');
    item.classList.add('lateral');
  });

  elementoClickado.classList.remove('lateral');
  elementoClickado.classList.add('activo');

  // Actualizar de forma dinámica la imagen del sobre interactivo según la selección
  const rutaImg = elementoClickado.querySelector('img').src;
  document.getElementById('sobreTapa').style.backgroundImage = `url('${rutaImg}')`;
  document.getElementById('sobreCuerpo').style.backgroundImage = `url('${rutaImg}')`;
}

// 3. INICIO DEL PROCESO DE APERTURA (VALIDACIÓN Y DESCUENTO)
function comenzarApertura() {
  if (puntosDeAlma < 400) {
    alert("No tienes suficientes Puntos de Alma.");
    return;
  }

  // Ejecutar el descuento de puntos
  puntosDeAlma -= 400;
  document.getElementById('pts-alma-txt').innerText = puntosDeAlma;

  // Cambiar de pantalla hacia el Gesto táctil
  document.getElementById('pantalla-carrusel').classList.add('oculto');
  document.getElementById('pantalla-swipe').classList.remove('oculto');

  inicializarGestoSwipe();
}

// 4. DETECTOR DEL DESLIZAMIENTO VERTICAL (POKÉMON POCKET STYLE)
function inicializarGestoSwipe() {
  const sobre = document.getElementById('sobreInteractivo');
  const tapa = document.getElementById('sobreTapa');

  const iniciarToque = (e) => {
    arrastreInicialY = e.touches ? e.touches[0].clientY : e.clientY;
    interactuandoConSobre = true;
  };

  const procesarMovimiento = (e) => {
    if (!interactuandoConSobre) return;

    const posicionActualY = e.touches ? e.touches[0].clientY : e.clientY;
    const distanciaRecorrada = arrastreInicialY - posicionActualY; // Pixeles movidos hacia arriba

    // Levantar la tapa proporcionalmente al arrastre del usuario
    if (distanciaRecorrada > 0 && distanciaRecorrada < 120) {
      tapa.style.transform = `translateY(-${distanciaRecorrada / 1.5}px)`;
    }

    // Si pasa los 120 píxeles de deslizamiento, el sobre se rompe por completo
    if (distanciaRecorrada > 120) {
      interactuandoConSobre = false;
      
      // Animación explosiva de rotura
      tapa.style.transform = 'translateY(-200px) rotate(-12deg)';
      tapa.style.opacity = '0';

      // Pasar a la visualización de las 5 cartas obtenidas
      setTimeout(() => {
        document.getElementById('pantalla-swipe').classList.add('oculto');
        document.getElementById('pantalla-resultados').classList.remove('oculto');
      }, 400);
    }
  };

  const soltarToque = () => {
    if (!interactuandoConSobre) return;
    interactuandoConSobre = false;
    tapa.style.transform = 'translateY(0)'; // Resetear si no jaló lo suficiente
  };

  // Eventos cruzados móviles / computadoras
  sobre.addEventListener('touchstart', iniciarToque);
  sobre.addEventListener('touchmove', procesarMovimiento);
  sobre.addEventListener('touchend', soltarToque);

  sobre.addEventListener('mousedown', iniciarToque);
  window.addEventListener('mousemove', procesarMovimiento);
  window.addEventListener('mouseup', soltarToque);
}

// 5. NAVEGAR A LA PRUEBA DE LA CARTA INTERACTIVA
function irAPruebaCarta() {
  document.getElementById('pantalla-resultados').classList.add('oculto');
  document.getElementById('pantalla-interactiva').classList.remove('oculto');
  inicializarFisicasCarta3D();
}

// 6. FÍSICAS DE LA CARTA 3D E ILUMINACIÓN DINÁMICA
function inicializarFisicasCarta3D() {
  const carta = document.getElementById('cartaMolly');
  const brillo = document.getElementById('capaBrillo');

  const ejecutarInclinacion = (e) => {
    const dimensiones = carta.getBoundingClientRect();
    const cursorX = e.touches ? e.touches[0].clientX : e.clientX;
    const cursorY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calcular coordenadas internas relativas a la carta
    const xRelativa = cursorX - dimensiones.left;
    const yRelativa = cursorY - dimensiones.top;

    // Convertir a porcentajes para desplazar el gradiente del reflejo de luz
    const pctX = (xRelativa / dimensiones.width) * 100;
    const pctY = (yRelativa / dimensiones.height) * 100;
    carta.style.setProperty('--x', `${pctX}%`);
    carta.style.setProperty('--y', `${pctY}%`);

    // Calcular los ángulos de rotación 3D (Máximo 30 grados)
    const inclinacionX = ((yRelativa / dimensiones.height) - 0.5) * -30;
    const inclinacionY = ((xRelativa / dimensiones.width) - 0.5) * 30;

    carta.style.transform = `rotateX(${inclinacionX}deg) rotateY(${inclinacionY}deg) scale(1.04)`;
  };

  const restaurarEstadoOriginal = () => {
    carta.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    carta.style.setProperty('--x', '50%');
    carta.style.setProperty('--y', '50%');
  };

  carta.addEventListener('mousemove', ejecutarInclinacion);
  carta.addEventListener('touchmove', ejecutarInclinacion);
  carta.addEventListener('mouseleave', restaurarEstadoOriginal);
  carta.addEventListener('touchend', restaurarEstadoOriginal);
}

// 7. CERRAR EL BUCLE Y VOLVER AL MENÚ DE COFRES
function finalizarGacha() {
  document.getElementById('pantalla-interactiva').classList.add('oculto');
  document.getElementById('pantalla-carrusel').classList.remove('oculto');

  // Resetear el sobre táctil por si vuelve a abrir otro más adelante
  const tapa = document.getElementById('sobreTapa');
  tapa.style.transform = 'translateY(0)';
  tapa.style.opacity = '1';
}
