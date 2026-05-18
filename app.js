// =========================================================================
//  1. DECLARACIÓN DE CROMOS BASE Y SISTEMA (.JPG ASIGNADOS)
// =========================================================================
const DATOS_RAICES_CROMOS = [
    { id: 1, nombre: "Molly, Estrella de las Arenas", rareza: "epico", img: "img/1.jpg" },
    { id: 2, nombre: "Molly, Guardiana del Sol Poniente", rareza: "epico", img: "img/2.jpg" },
    { id: 3, nombre: "Hiyon, Hechicera del Viento de Sakura", rareza: "raro", img: "img/3.jpg" },
    { id: 4, nombre: "Molly, Guardiana Espiritual", rareza: "comun", img: "img/4.jpg" }
];

const TOTAL_FOTOS_SISTEMA = 12;

const TODOS_LOS_CROMOS = Array.from({ length: TOTAL_FOTOS_SISTEMA }, (_, index) => {
    const num = index + 1;
    const coincidencia = DATOS_RAICES_CROMOS.find(c => c.id === num);
    if (coincidencia) return coincidencia;

    return {
        id: num,
        nombre: `Crónica Especial #${num}`,
        rareza: num % 3 === 0 ? "epico" : (num % 2 === 0 ? "raro" : "comun"),
        img: `img/${num}.jpg`
    };
});

// =========================================================================
//  2. ESTADO INICIAL PARA UN NUEVO USUARIO (0 PUNTOS / 0 CARTAS)
// =========================================================================
let usuario = {
    nombre: "Nuevo Jugador",
    puntos: 0,               
    misionesCompletadas: 0,   
    gemas: 0,
    gemasRaras: 0,
    gemasEpicas: 0,
    misCromosIds: [], // Inicialmente vacío para que se registren
    avatarCromoId: null
};

let cardMenuAbiertoId = null;

// Referencias del DOM
const btnTabCofres = document.getElementById('tab-btn-cofres');
const btnTabPerfil = document.getElementById('tab-btn-perfil');
const btnTabCromos = document.getElementById('tab-btn-cromos');
const viewCofres = document.getElementById('view-cofres');
const viewPerfil = document.getElementById('view-perfil');
const viewCromos = document.getElementById('view-cromos');

// =========================================================================
//  3. INICIALIZACIÓN Y NAVEGACIÓN
// =========================================================================
function iniciarJuego() {
    const guardadoLocal = localStorage.getItem('sekai_chronicles_save');
    if (guardadoLocal) {
        usuario = JSON.parse(guardadoLocal);
    }

    // Evento de Editar / Registrar Nombre
    const btnEditar = document.getElementById('btn-editar-nombre');
    if (btnEditar) {
        btnEditar.addEventListener('click', (e) => {
            e.stopPropagation();
            const nuevoNick = prompt("Escribe tu Nickname de Jugador:", usuario.nombre === "Nuevo Jugador" ? "" : usuario.nombre);
            if (nuevoNick && nuevoNick.trim() !== "") {
                usuario.nombre = nuevoNick.trim().substring(0, 14);
                
                // Si era un usuario completamente nuevo, le damos un paquete de bienvenida
                if(usuario.puntos === 0 && usuario.misCromosIds.length === 0) {
                    usuario.puntos = 400; // Suficiente para abrir cofres
                    usuario.misCromosIds = [1]; // Su primera carta base
                    usuario.avatarCromoId = 1;
                }

                guardarDatosEnLocal();
                actualizarPerfilVisual();
                mostrarNotificacionPremium(`✨ BIENVENIDO: ${usuario.nombre}`);
            }
        });
    }

    // Botón de Mazmorra
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

    // Enlaces de Navegación
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
    if (!track) return;
    track.innerHTML = '';

    TODOS_LOS_CROMOS.slice(0, 4).forEach(cromo => {
        track.innerHTML += `
            <div class="carousel-card">
                <div class="card-img-box">
                    <img src="${cromo.img}" alt="${cromo.nombre}" onerror="this.style.display='none';">
                </div>
                <span>${cromo.nombre.split(',')[0]}</span>
            </div>`;
    });
}

// =========================================================================
//  4. SISTEMA DE APERTURA GACHA (COFRES)
// =========================================================================
const btnAbrirEvento = document.getElementById('btn-abrir-evento');
const btnAbrirDiario = document.getElementById('btn-abrir-diario');
if (btnAbrirEvento) btnAbrirEvento.onclick = () => ejecutarGachaInvocacion(200, 'evento');
if (btnAbrirDiario) btnAbrirDiario.onclick = () => ejecutarGachaInvocacion(400, 'diario');

function ejecutarGachaInvocacion(costo, tipo) {
    if (usuario.nombre === "Nuevo Jugador") {
        mostrarNotificacionPremium("❌ DEBES REGISTRAR TU NOMBRE PRIMERO");
        return;
    }
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
            <div class="card-container-relative" style="max-width: 130px; margin: 10px auto;">
                <div class="card-preview">
                    <div class="card-header ${cromo.rareza}">${cromo.rareza.toUpperCase()}</div>
                    <div class="card-img-box">
                        <img src="${cromo.img}" onerror="this.style.display='none';">
                    </div>
                    <div class="card-footer"><b>${cromo.nombre}</b></div>
                </div>
            </div>`;
        modal.classList.remove('hidden');
    }
    if (cerrar) cerrar.onclick = () => modal.classList.add('hidden');
}

// =========================================================================
//  5. CONTROLADORES DE RENDERIZADO VISUAL
// =========================================================================
function actualizarPerfilVisual() {
    const domUser = document.getElementById('display-username');
    const domPuntos = document.getElementById('profile-points-count');
    const domCardsCount = document.getElementById('profile-card-count');
    const btnEditar = document.getElementById('btn-editar-nombre');

    if (domUser) domUser.textContent = usuario.nombre;
    if (domPuntos) domPuntos.textContent = usuario.puntos;
    if (domCardsCount) domCardsCount.textContent = `${usuario.misCromosIds.length}/${TOTAL_FOTOS_SISTEMA}`;
    if (btnEditar) btnEditar.textContent = usuario.nombre === "Nuevo Jugador" ? "Registrarse" : "Editar";

    const gComun = document.getElementById('gem-count-comun');
    const gRara = document.getElementById('gem-count-rara');
    const gEpica = document.getElementById('gem-count-epica');
    if(gComun) gComun.textContent = usuario.gemas;
    if(gRara) gRara.textContent = usuario.gemasRaras;
    if(gEpica) gEpica.textContent = usuario.gemasEpicas;

    const cajaAvatar = document.getElementById('profile-avatar-display');
    if (cajaAvatar) {
        if (usuario.avatarCromoId) {
            const infoAvatar = TODOS_LOS_CROMOS.find(c => c.id === usuario.avatarCromoId);
            if (infoAvatar) {
                cajaAvatar.innerHTML = `
                    <div class="card-preview">
                        <div class="card-header ${infoAvatar.rareza}">${infoAvatar.rareza.toUpperCase()}</div>
                        <div class="card-img-box">
                            <img src="${infoAvatar.img}" onerror="this.style.display='none';">
                        </div>
                        <div class="card-footer"><b>${infoAvatar.nombre}</b></div>
                    </div>`;
            }
        } else {
            cajaAvatar.innerHTML = `
                <div class="card-preview">
                    <div class="card-header comun">VACÍO</div>
                    <div class="card-img-box"></div>
                    <div class="card-footer"><b>Sin Avatar Activo</b></div>
                </div>`;
        }
    }
}

function renderizarAlbumCompleto() {
    const grid = document.getElementById('album-grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    const misCromosReales = TODOS_LOS_CROMOS.filter(cromo => usuario.misCromosIds.includes(cromo.id));
    misCromosReales.sort((a, b) => a.id - b.id);

    if (misCromosReales.length === 0) {
        grid.innerHTML = `<div style="grid-column: span 3; text-align:center; color:#62717e; padding:20px;">Tu álbum está vacío. ¡Abre cofres!</div>`;
        return;
    }

    misCromosReales.forEach(cromo => {
        const abierto = cardMenuAbiertoId === cromo.id;

        grid.innerHTML += `
            <div class="card-container-relative" onclick="conmutarMenuFila(${cromo.id}, event)">
                <div class="card-preview">
                    <div class="card-header ${cromo.rareza}">${cromo.rareza.toUpperCase()}</div>
                    <div class="card-img-box">
                        <img src="${cromo.img}" alt="${cromo.nombre}" onerror="this.style.display='none';">
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
