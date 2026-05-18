// =========================================================================
//  1. COMENTARIOS Y DECLARACIÓN DE CARTAS REALES
// =========================================================================
const DATOS_RAICES_CROMOS = [
    { id: 1, nombre: "Molly, Estrella de las Arenas", rareza: "epico", img: "img/1.png" },
    { id: 2, nombre: "Molly, Guardiana del Sol Poniente", rareza: "epico", img: "img/2.png" },
    { id: 3, nombre: "Hiyon, Hechicera del Viento de Sakura", rareza: "raro", img: "img/3.png" },
    { id: 4, nombre: "Molly, Guardiana Espiritual", rareza: "comun", img: "img/4.png" }
];

// Cantidad máxima total de cartas añadidas a tu juego
const TOTAL_FOTOS_SISTEMA = 12;

const TODOS_LOS_CROMOS = Array.from({ length: TOTAL_FOTOS_SISTEMA }, (_, index) => {
    const num = index + 1;
    const coincidencia = DATOS_RAICES_CROMOS.find(c => c.id === num);
    if (coincidencia) return coincidencia;

    return {
        id: num,
        nombre: `Crónica Especial #${num}`,
        rareza: num % 3 === 0 ? "epico" : (num % 2 === 0 ? "raro" : "comun"),
        img: `img/${num}.png`
    };
});

// =========================================================================
//  2. ESTADO INICIAL DEL JUGADOR
// =========================================================================
let usuario = {
    nombre: "yuki",
    puntos: 311,               
    misionesCompletadas: 0,   
    gemas: 10,
    gemasRaras: 0,
    gemasEpicas: 0,
    misCromosIds: [1, 2, 3, 4], // Inventario real de inicio
    avatarCromoId: 1
};

let cardMenuAbiertoId = null;

// Selectores del DOM
const btnTabCofres = document.getElementById('tab-btn-cofres');
const btnTabPerfil = document.getElementById('tab-btn-perfil');
const btnTabCromos = document.getElementById('tab-btn-cromos');
const viewCofres = document.getElementById('view-cofres');
const viewPerfil = document.getElementById('view-perfil');
const viewCromos = document.getElementById('view-cromos');

// =========================================================================
//  3. CONTROLADORES PRINCIPALES Y LOGS
// =========================================================================
function iniciarJuego() {
    const guardadoLocal = localStorage.getItem('sekai_chronicles_save');
    if (guardadoLocal) {
        usuario = JSON.parse(guardadoLocal);
    }

    // Editar Nombre de Usuario
    const btnEditar = document.getElementById('btn-editar-nombre');
    if (btnEditar) {
        btnEditar.addEventListener('click', (e) => {
            e.stopPropagation();
            const nuevoNick = prompt("Escribe tu nuevo Nickname de Jugador:", usuario.nombre);
            if (nuevoNick && nuevoNick.trim() !== "") {
                usuario.nombre = nuevoNick.trim().substring(0, 14);
                guardarDatosEnLocal();
                actualizarPerfilVisual();
                mostrarNotificacionPremium(`✨ BIENVENIDO: ${usuario.nombre}`);
            }
        });
    }

    // Sistema de Mazmorras
    const btnMision = document.getElementById('btn-hacer-mision');
    if (btnMision) {
        btnMision.onclick = () => {
            usuario.puntos += 25;
            usuario.misionesCompletadas++;
            guardarDatosEnLocal();
            actualizarPerfilVisual();
            mostrarNotificacionPremium("⚔️ ¡MAZMORRA SUPERADA! +25 Puntos de Alma");
        };
    }

    // Enlaces de Navegación de Pestañas
    if (btnTabCofres) btnTabCofres.onclick = () => alternarVistas(btnTabCofres, viewCofres);
    if (btnTabPerfil) btnTabPerfil.onclick = () => { alternarVistas(btnTabPerfil, viewPerfil); actualizarPerfilVisual(); };
    if (btnTabCromos) btnTabCromos.onclick = () => { alternarVistas(btnTabCromos, viewCromos); renderizarAlbumCompleto(); };

    generarMiniCarrusel();
    actualizarPerfilVisual();
}

function guardarDatosEnLocal() {
    localStorage.setItem('sekai_chronicles_save', JSON.stringify(usuario));
}

function mostrarNotificacionPremium(texto) {
    const toast = document.getElementById('epic-notification');
    if (toast) {
        toast.textContent = texto;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 2200);
    }
}

function alternarVistas(botonActivo, vistaActiva) {
    [btnTabCofres, btnTabPerfil, btnTabCromos].forEach(b => b?.classList.remove('active'));
    [viewCofres, viewPerfil, viewCromos].forEach(v => v?.classList.add('hidden'));
    botonActivo?.classList.add('active');
    vistaActiva?.classList.remove('hidden');
    cardMenuAbiertoId = null;
}

function generarMiniCarrusel() {
    const track = document.getElementById('carrusel-dinamico');
    if (track) {
        track.innerHTML = '';
        TODOS_LOS_CROMOS.slice(0, 4).forEach(cromo => {
            track.innerHTML += `
                <div class="carousel-card">
                    <div class="card-img-box">
                        <img src="${cromo.img}">
                    </div>
                    <span>${cromo.nombre.split(',')[0]}</span>
                </div>`;
        });
    }
}

// =========================================================================
//  4. EJECUCIÓN GACHA DE LOS COFRES
// =========================================================================
const btnAbrirEvento = document.getElementById('btn-abrir-evento');
const btnAbrirDiario = document.getElementById('btn-abrir-diario');
if (btnAbrirEvento) btnAbrirEvento.onclick = () => ejecutarGachaInvocacion(200, 'evento');
if (btnAbrirDiario) btnAbrirDiario.onclick = () => ejecutarGachaInvocacion(400, 'diario');

function ejecutarGachaInvocacion(costo, tipo) {
    if (usuario.puntos < costo) {
        mostrarNotificacionPremium("❌ PUNTOS DE ALMA INSUFICIENTES");
        return;
    }

    usuario.puntos -= costo;
    let rarezaSuerte = "comun";
    const tiroDado = Math.random() * 100;

    if (tipo === 'diario') {
        if (tiroDado < 25) rarezaSuerte = "epico";
        else if (tiroDado < 70) rarezaSuerte = "raro";
    } else {
        if (tiroDado < 15) rarezaSuerte = "epico";
        else if (tiroDado < 50) rarezaSuerte = "raro";
    }

    const cartasFiltradas = TODOS_LOS_CROMOS.filter(c => c.rareza === rarezaSuerte);
    const cromoInvocado = cartasFiltradas[Math.floor(Math.random() * cartasFiltradas.length)];

    if (!usuario.misCromosIds.includes(cromoInvocado.id)) {
        usuario.misCromosIds.push(cromoInvocado.id);
    }

    guardarDatosEnLocal();
    actualizarPerfilVisual();
    desplegarModalInvocacion(cromoInvocado);
}

function desplegarModalInvocacion(cromo) {
    const modal = document.getElementById('reward-modal');
    const cuerpo = document.getElementById('modal-body-content');
    const cerrar = document.getElementById('btn-cerrar-modal');

    if (modal && cuerpo) {
        cuerpo.innerHTML = `
            <div class="card-container-relative" style="max-width: 140px; margin: 10px auto;">
                <div class="card-preview">
                    <div class="card-header ${cromo.rareza}">${cromo.rareza.toUpperCase()}</div>
                    <div class="card-img-box"><img src="${cromo.img}"></div>
                    <div class="card-footer"><b>${cromo.nombre}</b></div>
                </div>
            </div>`;
        modal.classList.remove('hidden');
    }
    if (cerrar) cerrar.onclick = () => modal.classList.add('hidden');
}

// =========================================================================
//  5. RENDERIZADO DEL INVENTARIO REAL
// =========================================================================
function actualizarPerfilVisual() {
    const domUser = document.getElementById('display-username');
    const domPuntos = document.getElementById('profile-points-count');
    const domCardsCount = document.getElementById('profile-card-count');

    if (domUser) domUser.textContent = usuario.nombre;
    if (domPuntos) domPuntos.textContent = usuario.puntos;
    if (domCardsCount) domCardsCount.textContent = `${usuario.misCromosIds.length}/${TOTAL_FOTOS_SISTEMA}`;

    const gComun = document.getElementById('gem-count-comun');
    const gRara = document.getElementById('gem-count-rara');
    const gEpica = document.getElementById('gem-count-epica');
    if(gComun) gComun.textContent = usuario.gemas;
    if(gRara) gRara.textContent = usuario.gemasRaras;
    if(gEpica) gEpica.textContent = usuario.gemasEpicas;

    const cajaAvatar = document.getElementById('profile-avatar-display');
    if (cajaAvatar && usuario.avatarCromoId) {
        const infoAvatar = TODOS_LOS_CROMOS.find(c => c.id === usuario.avatarCromoId);
        if (infoAvatar) {
            cajaAvatar.innerHTML = `
                <div class="card-preview">
                    <div class="card-header ${infoAvatar.rareza}">${infoAvatar.rareza.toUpperCase()}</div>
                    <div class="card-img-box"><img src="${infoAvatar.img}"></div>
                    <div class="card-footer"><b>${infoAvatar.nombre}</b></div>
                </div>`;
        }
    }
}

function renderizarAlbumCompleto() {
    const grid = document.getElementById('album-grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    // CONDICIÓN IMPORTANTE: Renderiza solo las cartas compradas/ganadas por el ID del usuario
    const misCromosReales = TODOS_LOS_CROMOS.filter(cromo => usuario.misCromosIds.includes(cromo.id));
    misCromosReales.sort((a, b) => a.id - b.id);

    if (misCromosReales.length === 0) {
        grid.innerHTML = `<div style="grid-column: span 3; text-align:center; color:#62717e; padding:20px;">Álbum vacío.</div>`;
        return;
    }

    misCromosReales.forEach(cromo => {
        const abierto = cardMenuAbiertoId === cromo.id;

        grid.innerHTML += `
            <div class="card-container-relative" onclick="conmutarMenuFila(${cromo.id}, event)">
                <div class="card-preview">
                    <div class="card-header ${cromo.rareza}">${cromo.rareza.toUpperCase()}</div>
                    <div class="card-img-box">
                        <img src="${cromo.img}" onerror="this.style.opacity='0'; this.style.visibility='hidden';">
                    </div>
                    <div class="card-footer"><b>${cromo.nombre}</b></div>
                    
                    <div class="card-action-menu ${abierto ? 'visible' : 'hidden'}">
                        <button class="btn-action-menu" onclick="ejecutarVentaTarjeta(${cromo.id}, event)">Vender (100 pts.)</button>
                        <button class="btn-action-menu" onclick="fijarComoAvatarPrincipal(${cromo.id}, event)">Establecer Avatar</button>
                    </div>
                </div>
            </div>`;
    });
}

window.conmutarMenuFila = function(id, e) {
    if (e.target.classList.contains('btn-action-menu')) return;
    cardMenuAbiertoId = (cardMenuAbiertoId === id) ? null : id;
    renderizarAlbumCompleto();
};

window.ejecutarVentaTarjeta = function(id, e) {
    e.stopPropagation();
    if (usuario.avatarCromoId === id) {
        mostrarNotificacionPremium("❌ TU AVATAR NO PUEDE SER VENDIDO");
        return;
    }
    usuario.misCromosIds = usuario.misCromosIds.filter(c => c !== id);
    usuario.puntos += 100;
    cardMenuAbiertoId = null;
    guardarDatosEnLocal();
    renderizarAlbumCompleto();
    actualizarPerfilVisual();
    mostrarNotificacionPremium("💰 CROMO RECICLADO +100 PA");
};

window.fijarComoAvatarPrincipal = function(id, e) {
    e.stopPropagation();
    usuario.avatarCromoId = id;
    guardarDatosEnLocal();
    cardMenuAbiertoId = null;
    renderizarAlbumCompleto();
    actualizarPerfilVisual();
    mostrarNotificacionPremium("👤 INTERFAZ DE AVATAR VINCULADA");
};

iniciarJuego();
