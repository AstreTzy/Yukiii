// =========================================================================
//  1. CONFIGURACIÓN DE CROMOS REALES (Probabilidades y Atributos)
// =========================================================================

// 👇 Cantidad real de imágenes en tu carpeta img/
const TOTAL_FOTOS_SUBIDAS = 13; 

// Base de datos de tus cromos indexados por número
const TODOS_LOS_CROMOS = Array.from({ length: TOTAL_FOTOS_SUBIDAS }, (_, index) => {
    const numero = index + 1;
    
    // Asignación automática de rarezas
    let rarezaCard = "comun";
    if (numero % 3 === 0) rarezaCard = "epico";
    else if (numero % 2 === 0) rarezaCard = "raro";

    return {
        id: numero,
        nombre: `Cromo #${numero}`,
        rareza: rarezaCard,
        img: `img/${numero}.png` 
    };
});

// =========================================================================
//  2. ESTRUCTURA DE DATOS INTERNA DEL JUGADOR
// =========================================================================
let usuario = {
    nombre: "Pepinito",
    puntos: 5700,               
    misionesCompletadas: 0,   
    gemas: 10,
    gemasRaras: 0,
    gemasEpicas: 0,
    misCromosIds: [1, 2, 3, 4, 5, 6, 7], // Inventario Inicial
    avatarCromoId: 6,                     // ID del avatar por defecto
    ultimoReinicioDia: ""
};

let cardMenuAbiertoId = null;

// Elementos de Interfaz (DOM)
const btnTabCofres = document.getElementById('tab-btn-cofres');
const btnTabPerfil = document.getElementById('tab-btn-perfil');
const btnTabCromos = document.getElementById('tab-btn-cromos');
const viewCofres = document.getElementById('view-cofres');
const viewPerfil = document.getElementById('view-perfil');
const viewCromos = document.getElementById('view-cromos');

// =========================================================================
//  3. INICIALIZACIÓN DEL JUEGO
// =========================================================================
function iniciarSistema() {
    const guardado = localStorage.getItem('sekai_chronicles_save');
    const pantallaBienvenida = document.getElementById('welcome-screen');

    if (guardado) { 
        usuario = JSON.parse(guardado); 
        if (pantallaBienvenida) pantallaBienvenida.classList.add('hidden');
    } else {
        if (pantallaBienvenida) pantallaBienvenida.classList.remove('hidden');
    }
    
    // Registro de nuevo usuario
    const btnCrearUsuario = document.getElementById('btn-crear-usuario');
    const inputNuevoUsuario = document.getElementById('input-nuevo-usuario');
    if (btnCrearUsuario && inputNuevoUsuario) {
        btnCrearUsuario.addEventListener('click', () => {
            const nombreIngresado = inputNuevoUsuario.value.trim();
            if (nombreIngresado !== "") usuario.nombre = nombreIngresado;
            usuario.puntos = 3000; 
            guardarYActualizar();
            actualizarPerfilVisual();
            if (pantallaBienvenida) pantallaBienvenida.classList.add('hidden');
        });
    }

    // Enlace de los botones de Invocación
    const btnAbrirEvento = document.getElementById('btn-abrir-evento');
    const btnAbrirDiario = document.getElementById('btn-abrir-diario');
    
    if (btnAbrirEvento) btnAbrirEvento.addEventListener('click', () => abrirCofre('evento', 200));
    if (btnAbrirDiario) btnAbrirDiario.addEventListener('click', () => abrirCofre('diario', 400));

    generarCarruselAutomatico();
    actualizarPerfilVisual();
}

function guardarYActualizar() {
    localStorage.setItem('sekai_chronicles_save', JSON.stringify(usuario));
}

function generarCarruselAutomatico() {
    const track = document.getElementById('carrusel-dinamico');
    if (track) {
        track.innerHTML = ''; 
        TODOS_LOS_CROMOS.slice(0, 5).forEach(cromo => {
            track.innerHTML += `
                <div class="carousel-card">
                    <img src="${cromo.img}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1041/1041446.png'">
                    <span>${cromo.nombre}</span>
                </div>`;
        });
    }
}

// =========================================================================
//  4. SISTEMA GACHA (INVOCACIÓN)
// =========================================================================
function abrirCofre(tipoCofre, costo) {
    if (usuario.puntos < costo) {
        alert("❌ No tienes suficientes Puntos.");
        return;
    }

    usuario.puntos -= costo;

    let rarezaObtenida = "comun";
    const rand = Math.random() * 100;

    if (tipoCofre === 'diario') {
        if (rand < 25) rarezaObtenida = "epico";       
        else if (rand < 65) rarezaObtenida = "raro";   
    } else {
        if (rand < 10) rarezaObtenida = "epico";       
        else if (rand < 40) rarezaObtenida = "raro";   
    }

    const poolCartas = TODOS_LOS_CROMOS.filter(c => c.rareza === rarezaObtenida);
    const cromoGanado = poolCartas[Math.floor(Math.random() * poolCartas.length)];

    if (!usuario.misCromosIds.includes(cromoGanado.id)) {
        usuario.misCromosIds.push(cromoGanado.id);
    }

    guardarYActualizar();
    actualizarPerfilVisual();
    mostrarModalRecompensa(cromoGanado);
}

function mostrarModalRecompensa(cromo) {
    const modal = document.getElementById('reward-modal');
    const modalBody = document.getElementById('modal-body-content');
    const btnCerrar = document.getElementById('btn-cerrar-modal');

    if (modal && modalBody) {
        modalBody.innerHTML = `
            <p style="color: #cbd4db; font-size: 14px;">Has obtenido:</p>
            <div class="card-container-relative" style="max-width: 150px; margin: 0 auto; height: 230px;">
                <div class="card-preview">
                    <div class="card-header ${cromo.rareza}">${cromo.rareza.toUpperCase()}</div>
                    <div class="card-img-box">
                        <img src="${cromo.img}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1041/1041446.png'">
                    </div>
                    <div class="card-footer">
                        <b>${cromo.nombre}</b>
                    </div>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    }

    if (btnCerrar) {
        btnCerrar.onclick = () => { modal.classList.add('hidden'); };
    }
}

// =========================================================================
//  5. SISTEMA DE PESTAÑAS Y NAVEGACIÓN
// =========================================================================
if(btnTabCofres) btnTabCofres.addEventListener('click', () => cambiarPestaña(btnTabCofres, viewCofres));
if(btnTabPerfil) btnTabPerfil.addEventListener('click', () => { cambiarPestaña(btnTabPerfil, viewPerfil); actualizarPerfilVisual(); });
if(btnTabCromos) btnTabCromos.addEventListener('click', () => { cambiarPestaña(btnTabCromos, viewCromos); renderizarAlbum(); });

function cambiarPestaña(boton, vista) {
    [btnTabCofres, btnTabPerfil, btnTabCromos].forEach(b => { if(b) b.classList.remove('active'); });
    [viewCofres, viewPerfil, viewCromos].forEach(v => { if(v) v.classList.add('hidden'); });
    if(boton) boton.classList.add('active'); 
    if(vista) vista.classList.remove('hidden');
    cardMenuAbiertoId = null; 
}

const btnMision = document.getElementById('btn-hacer-mision');
if(btnMision) {
    btnMision.addEventListener('click', () => {
        usuario.puntos += 250; 
        usuario.misionesCompletadas++;
        guardarYActualizar();
        actualizarPerfilVisual();
        alert("⚔️ ¡Mazmorra completada! +250 Puntos");
    });
}

// =========================================================================
//  6. RENDERIZADO VISUAL
// =========================================================================
function actualizarPerfilVisual() {
    const elUser = document.getElementById('display-username');
    const elMisiones = document.getElementById('stats-misiones');
    const elPuntos = document.getElementById('profile-points-count');
    const elCromos = document.getElementById('profile-card-count');

    if(elUser) elUser.textContent = usuario.nombre;
    if(elMisiones) elMisiones.textContent = usuario.misionesCompletadas;
    if(elPuntos) elPuntos.textContent = usuario.puntos;
    if(elCromos) elCromos.textContent = `${usuario.misCromosIds.length}/${TOTAL_FOTOS_SUBIDAS}`;
    
    const elGemaComun = document.getElementById('gem-count-comun');
    const elGemaRara = document.getElementById('gem-count-rara');
    const elGemaEpica = document.getElementById('gem-count-epica');
    if(elGemaComun) elGemaComun.textContent = usuario.gemas;
    if(elGemaRara) elGemaRara.textContent = usuario.gemasRaras;
    if(elGemaEpica) elGemaEpica.textContent = usuario.gemasEpicas;

    const contenedorAvatar = document.getElementById('profile-avatar-display');
    if (contenedorAvatar && usuario.avatarCromoId) {
        const infoCromo = TODOS_LOS_CROMOS.find(c => c.id === usuario.avatarCromoId);
        if (infoCromo) {
            contenedorAvatar.innerHTML = `
                <div class="card-preview">
                    <div class="card-header ${infoCromo.rareza}">${infoCromo.rareza.toUpperCase()}</div>
                    <div class="card-img-box">
                        <img src="${infoCromo.img}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1041/1041446.png'">
                    </div>
                    <div class="card-footer">
                        <b>${infoCromo.nombre}</b>
                    </div>
                </div>`;
            return;
        }
    }
}

function renderizarAlbum() {
    const grid = document.getElementById('album-grid-container');
    if (!grid) return;
    grid.innerHTML = '';
    
    usuario.misCromosIds.forEach(id => {
        const cromo = TODOS_LOS_CROMOS.find(c => c.id === id);
        if (!cromo) return;

        const esMenuAbierto = cardMenuAbiertoId === id;

        grid.innerHTML += `
            <div class="card-container-relative" onclick="toggleMenuCarta(${cromo.id}, event)">
                <div class="card-preview">
                    <div class="card-header ${cromo.rareza}">${cromo.rareza.toUpperCase()}</div>
                    <div class="card-img-box">
                        <img src="${cromo.img}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1041/1041446.png'">
                    </div>
                    <div class="card-footer">
                        <b>${cromo.nombre}</b>
                    </div>
                    
                    <div class="card-action-menu ${esMenuAbierto ? 'visible' : 'hidden'}">
                        <button class="btn-action-menu" onclick="accionVender(${cromo.id}, event)">Vender (+150 pts)</button>
                        <button class="btn-action-menu" onclick="accionDefinirAvatar(${cromo.id}, event)">Establecer Avatar</button>
                        <button class="btn-action-menu" onclick="accionUsarGema(${cromo.id}, event)">Usar Gema Rara</button>
                    </div>
                </div>
            </div>`;
    });
}

// =========================================================================
//  7. ACCIONES DEL MENÚ FLOTANTE
// =========================================================================
window.toggleMenuCarta = function(id, event) {
    if (event.target.classList.contains('btn-action-menu')) return;
    cardMenuAbiertoId = (cardMenuAbiertoId === id) ? null : id;
    renderizarAlbum();
};

window.accionVender = function(id, event) {
    event.stopPropagation();
    if (usuario.avatarCromoId === id) {
        alert("❌ No puedes vender tu cromo de avatar actual.");
        return;
    }
    usuario.misCromosIds = usuario.misCromosIds.filter(cId => cId !== id);
    usuario.puntos += 150; 
    cardMenuAbiertoId = null;
    guardarYActualizar();
    renderizarAlbum();
    actualizarPerfilVisual();
    alert("¡Cromo vendido! +150 Puntos.");
};

window.accionDefinirAvatar = function(id, event) {
    event.stopPropagation();
    usuario.avatarCromoId = id;
    guardarYActualizar();
    cardMenuAbiertoId = null;
    renderizarAlbum();
    alert("¡Avatar actualizado!");
};

window.accionUsarGema = function(id, event) {
    event.stopPropagation();
    if (usuario.gemas > 0) {
        usuario.gemas--;
        guardarYActualizar();
        renderizarAlbum();
        actualizarPerfilVisual();
        alert(`¡Gema usada en el cromo #${id}!`);
    } else {
        alert("❌ No te quedan Gemas Raras.");
    }
};

iniciarSistema();
