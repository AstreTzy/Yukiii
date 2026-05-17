// =========================================================================
//  1. CONFIGURACIÓN AUTOMÁTICA POR NÚMEROS (SEKAI CHRONICLES)
// =========================================================================

// 👇 Cambia este número según la cantidad de fotos que tengas en tu carpeta img/
const TOTAL_FOTOS_SUBIDAS = 9; 

// Generador inteligente de cromos
const TODOS_LOS_CROMOS = Array.from({ length: TOTAL_FOTOS_SUBIDAS }, (_, index) => {
    const numero = index + 1;
    
    // Distribuye rarezas automáticamente para el diseño de las tarjetas
    let rarezaCard = "comun";
    if (numero % 3 === 0) rarezaCard = "epico";
    else if (numero % 2 === 0) rarezaCard = "raro";

    return {
        id: numero,
        obra: "Manhwa Colección",
        nombre: `Cromo #${numero}`,
        rareza: rarezaCard,
        img: `img/${numero}.png` // Busca automáticamente: img/1.png, img/2.png, etc.
    };
});

// Desbloquea en automático todas las fotos para la lista del usuario
const listaIdsAutomaticos = Array.from({ length: TOTAL_FOTOS_SUBIDAS }, (_, i) => i + 1);

// =========================================================================
//  2. ESTRUCTURA DE DATOS INTERNA (YUKI)
// =========================================================================
let usuario = {
    nombre: "yuki",
    puntos: 786,               
    misionesCompletadas: 7,   
    gemas: 10,
    gemasRaras: 0,
    gemasEpicas: 0,
    misCromosIds: listaIdsAutomaticos, 
    avatarCromoId: 1,         
    ultimoReinicioDia: ""
};

// Elementos de la Interfaz (DOM)
const btnTabCofres = document.getElementById('tab-btn-cofres');
const btnTabPerfil = document.getElementById('tab-btn-perfil');
const btnTabCromos = document.getElementById('tab-btn-cromos');
const viewCofres = document.getElementById('view-cofres');
const viewPerfil = document.getElementById('view-perfil');
const viewCromos = document.getElementById('view-cromos');

// ID de la carta que tiene el menú abierto actualmente
let cardMenuAbiertoId = null;

// =========================================================================
//  3. INICIALIZACIÓN DEL SISTEMA
// =========================================================================
function iniciarSistema() {
    const guardado = localStorage.getItem('sekai_chronicles_save');
    const pantallaBienvenida = document.getElementById('welcome-screen');

    if (guardado) { 
        usuario = JSON.parse(guardado); 
        // Sincroniza fotos nuevas automáticamente si se agregaron más a GitHub
        listaIdsAutomaticos.forEach(id => {
            if (!usuario.misCromosIds.includes(id)) usuario.misCromosIds.push(id);
        });
        if (pantallaBienvenida) pantallaBienvenida.classList.add('hidden');
    } else {
        if (pantallaBienvenida) pantallaBienvenida.classList.remove('hidden');
    }
    
    // Mantiene las imágenes de los cofres estables
    const chestImg1 = document.querySelector('.main-chest-img');
    if(chestImg1) chestImg1.src = "https://cdn-icons-png.flaticon.com/512/3082/3082031.png";
    
    const chests = document.querySelectorAll('.main-chest-img');
    if(chests[1]) chests[1].src = "https://cdn-icons-png.flaticon.com/512/1041/1041446.png";

    comprobarReinicioTiempo();
    generarCarruselAutomatico();
    guardarYActualizar();
    actualizarPerfilVisual();
}

function generarCarruselAutomatico() {
    const track = document.getElementById('carrusel-dinamico');
    if (track) {
        track.innerHTML = ''; 
        TODOS_LOS_CROMOS.forEach(cromo => {
            track.innerHTML += `
                <div class="carousel-card">
                    <img src="${cromo.img}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1041/1041446.png'">
                    <span>${cromo.nombre}</span>
                </div>`;
        });
    }
}

function comprobarReinicioTiempo() {
    const hoy = new Date().toDateString();
    if (usuario.ultimoReinicioDia !== hoy) {
        usuario.ultimoReinicioDia = hoy;
        guardarYActualizar();
    }
}

// =========================================================================
//  4. SISTEMA DE NAVEGACIÓN ENTRE PESTAÑAS
// =========================================================================
if(btnTabCofres) btnTabCofres.addEventListener('click', () => cambiarPestaña(btnTabCofres, viewCofres));
if(btnTabPerfil) btnTabPerfil.addEventListener('click', () => { cambiarPestaña(btnTabPerfil, viewPerfil); actualizarPerfilVisual(); });
if(btnTabCromos) btnTabCromos.addEventListener('click', () => { cambiarPestaña(btnTabCromos, viewCromos); renderizarAlbum(); });

function cambiarPestaña(boton, vista) {
    [btnTabCofres, btnTabPerfil, btnTabCromos].forEach(b => { if(b) b.classList.remove('active'); });
    [viewCofres, viewPerfil, viewCromos].forEach(v => { if(v) v.classList.add('hidden'); });
    if(boton) boton.classList.add('active'); 
    if(vista) vista.classList.remove('hidden');
    cardMenuAbiertoId = null; // Cierra menús al cambiar de pestaña
}

// Botón de Mazmorra
const btnMision = document.getElementById('btn-hacer-mision');
if(btnMision) {
    btnMision.addEventListener('click', () => {
        usuario.puntos += 25;
        usuario.misionesCompletadas++;
        guardarYActualizar();
        actualizarPerfilVisual();
        alert("¡Mazmorra superada! +25 Puntos de Alma");
    });
}

function guardarYActualizar() {
    localStorage.setItem('sekai_chronicles_save', JSON.stringify(usuario));
}

// =========================================================================
//  5. INTERFACES VISUALES Y MENÚ INTERACTIVO (VENDER / AVATAR)
// =========================================================================
function actualizarPerfilVisual() {
    const elUser = document.getElementById('display-username');
    const elMisiones = document.getElementById('stats-misiones');
    const elPuntos = document.getElementById('profile-points-count');
    const elCromos = document.getElementById('profile-card-count');

    if(elUser) elUser.textContent = usuario.nombre;
    if(elMisiones) elMisiones.textContent = usuario.misionesCompletadas;
    if(elPuntos) elPuntos.textContent = usuario.puntos;
    if(elCromos) elCromos.textContent = `${usuario.misCromosIds.length}/300`;
    
    const contenedorAvatar = document.getElementById('profile-avatar-display');
    if (contenedorAvatar && usuario.avatarCromoId) {
        const infoCromo = TODOS_LOS_CROMOS.find(c => c.id === usuario.avatarCromoId);
        if (infoCromo) {
            contenedorAvatar.innerHTML = `
                <div class="card-preview">
                    <div class="card-img-box">
                        <img src="${infoCromo.img}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1041/1041446.png'">
                    </div>
                </div>`;
            return;
        }
    }
    if(contenedorAvatar) contenedorAvatar.innerHTML = `<div class="no-avatar-msg">Selecciona un Cromo en tu Álbum</div>`;
}

function renderizarAlbum() {
    const grid = document.getElementById('album-grid-container');
    if (!grid) return;
    grid.innerHTML = '';
    
    usuario.misCromosIds.forEach(id => {
        const cromo = TODOS_LOS_CROMOS.find(c => c.id === id);
        if (!cromo) return;

        const esMenuAbierto = cardMenuAbiertoId === id;

        // Genera el bloque de la carta estructurado
        grid.innerHTML += `
            <div class="card-container-relative" onclick="toggleMenuCarta(${cromo.id}, event)">
                <div class="card-preview">
                    <div class="card-header-action">${esMenuAbierto ? '-' : '+'}</div>
                    <div class="card-img-box">
                        <img src="${cromo.img}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1041/1041446.png'">
                    </div>
                    <div class="card-footer">
                        <b>${cromo.nombre}</b>
                    </div>
                    
                    <div class="card-hover-menu ${esMenuAbierto ? 'visible' : 'hidden'}">
                        <button class="menu-option-btn color-vender" onclick="accionVender(${cromo.id}, event)">Vender (500 exp.)</button>
                        <button class="menu-option-btn color-avatar" onclick="accionDefinirAvatar(${cromo.id}, event)">Establecer de Avatar</button>
                        <button class="menu-option-btn color-gema" onclick="accionUsarGema(${cromo.id}, event)">Usar Gema Rara</button>
                    </div>
                </div>
            </div>`;
    });
}

// Acciones interactivos del menú flotante
window.toggleMenuCarta = function(id, event) {
    // Si se hizo clic en un botón interno del menú, no cerrar ni reabrir nada
    if (event.target.classList.contains('menu-option-btn')) return;
    
    cardMenuAbiertoId = (cardMenuAbiertoId === id) ? null : id;
    renderizarAlbum();
};

window.accionVender = function(id, event) {
    event.stopPropagation();
    alert(`¡Tarjeta #${id} vendida con éxito! +500 EXP.`);
    cardMenuAbiertoId = null;
    renderizarAlbum();
};

window.accionDefinirAvatar = function(id, event) {
    event.stopPropagation();
    usuario.avatarCromoId = id;
    guardarYActualizar();
    alert(`¡Cromo #${id} establecido como tu foto de perfil!`);
    cardMenuAbiertoId = null;
    renderizarAlbum();
};

window.accionUsarGema = function(id, event) {
    event.stopPropagation();
    alert(`Has usado una Gema Rara en el cromo #${id}.`);
    cardMenuAbiertoId = null;
    renderizarAlbum();
};

// Arranca el juego con los sistemas completos
iniciarSistema();
