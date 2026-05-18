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
//  2. ESTADO INICIAL PARA UN NUEVO USUARIO
// =========================================================================
let usuario = {
    nombre: "Nuevo Jugador",
    puntos: 0,               
    misionesCompletadas: 0,   
    gemas: 0,       
    gemasRaras: 0,  
    gemasEpicas: 0, 
    misCromosIds: [], 
    avatarCromoId: null,
    // Límites Reales agregados al Save
    diariosDisponibles: 1,
    eventosDisponibles: 3,
    ultimoBloqueoMision: 0 
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

    // Asegurar compatibilidad de variables nuevas si el save es viejo
    if (usuario.diariosDisponibles === undefined) usuario.diariosDisponibles = 1;
    if (usuario.eventosDisponibles === undefined) usuario.eventosDisponibles = 3;
    if (usuario.ultimoBloqueoMision === undefined) usuario.ultimoBloqueoMision = 0;

    // Registro del Jugador
    const btnEditar = document.getElementById('btn-editar-nombre');
    if (btnEditar) {
        btnEditar.addEventListener('click', (e) => {
            e.stopPropagation();
            const nuevoNick = prompt("Escribe tu Nickname de Jugador:", usuario.nombre === "Nuevo Jugador" ? "" : usuario.nombre);
            if (nuevoNick && nuevoNick.trim() !== "") {
                usuario.nombre = nuevoNick.trim().substring(0, 14);
                
                if(usuario.puntos === 0 && usuario.misCromosIds.length === 0) {
                    usuario.puntos = 600; 
                    usuario.misCromosIds = [4]; 
                    usuario.avatarCromoId = 4;
                }

                guardarDatosEnLocal();
                actualizarPerfilVisual();
                mostrarNotificacionPremium(`✨ BIENVENIDO: ${usuario.nombre}`);
            }
        });
    }

    // Mecánica Mazmorra con Cooldown Real de 15 Segundos
    const btnMision = document.getElementById('btn-hacer-mision');
    if (btnMision) {
        btnMision.onclick = () => {
            const ahora = Date.now();
            const tiempoRestante = Math.ceil((usuario.ultimoBloqueoMision - ahora) / 1000);

            if (tiempoRestante > 0) {
                mostrarNotificacionPremium(`⏳ MAZMORRA EN COOLDOWN: Espera ${tiempoRestante}s`);
                return;
            }

            usuario.puntos += 50;
            usuario.misionesCompletadas++;
            usuario.ultimoBloqueoMision = Date.now() + 15000; // 15 seg de espera

            guardarDatosEnLocal();
            actualizarPerfilVisual();
            procesarBotonMazmorraVisual();
            mostrarNotificacionPremium("⚔️ ¡MAZMORRA SUPERADA! +50 Puntos de Alma");
        };
    }

    if (btnTabCofres) btnTabCofres.onclick = () => alternarVistas(btnTabCofres, viewCofres);
    if (btnTabPerfil) btnTabPerfil.onclick = () => { alternarVistas(btnTabPerfil, viewPerfil); actualizarPerfilVisual(); };
    if (btnTabCromos) btnTabCromos.onclick = () => { alternarVistas(btnTabCromos, viewCromos); renderizarAlbumCompleto(); };

    generarMiniCarrusel();
    actualizarPerfilVisual();
    procesarBotonMazmorraVisual();
    actualizarBadgesCofres();
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

function procesarBotonMazmorraVisual() {
    const btnMision = document.getElementById('btn-hacer-mision');
    if (!btnMision) return;

    const actualizarContador = () => {
        const ahora = Date.now();
        const tRestante = Math.ceil((usuario.ultimoBloqueoMision - ahora) / 1000);
        if (tRestante > 0) {
            btnMision.disabled = true;
            btnMision.textContent = `⏳ Explorando... (${tRestante}s)`;
            setTimeout(actualizarContador, 1000);
        } else {
            btnMision.disabled = false;
            btnMision.textContent = "⚔️ Entrar a Mazmorra (+PA)";
        }
    };
    actualizarContador();
}

function actualizarBadgesCofres() {
    const badgeE = document.getElementById('badge-evento');
    const badgeD = document.getElementById('badge-diario');
    const btnE = document.getElementById('btn-abrir-evento');
    const btnD = document.getElementById('btn-abrir-diario');

    if(badgeE) badgeE.textContent = `${usuario.eventosDisponibles} Cofres Disponibles`;
    if(badgeD) badgeD.textContent = `${usuario.diariosDisponibles} Cofre Disponible`;

    if(btnE) btnE.disabled = (usuario.eventosDisponibles <= 0);
    if(btnD) btnD.disabled = (usuario.diariosDisponibles <= 0);
}

// =========================================================================
//  4. SISTEMA DE APERTURA GACHA (CON CONTROL DE LÍMITES REALES)
// =========================================================================
const btnAbrirEvento = document.getElementById('btn-abrir-evento');
const btnAbrirDiario = document.getElementById('btn-abrir-diario');
if (btnAbrirEvento) btnAbrirEvento.onclick = () => ejecutarGachaInvocacion(400, 'evento');
if (btnAbrirDiario) btnAbrirDiario.onclick = () => ejecutarGachaInvocacion(200, 'diario');

function ejecutarGachaInvocacion(costo, tipo) {
    if (usuario.nombre === "Nuevo Jugador") {
        mostrarNotificacionPremium("❌ DEBES REGISTRAR TU NOMBRE PRIMERO");
        return;
    }
    if (tipo === 'diario' && usuario.diariosDisponibles <= 0) {
        mostrarNotificacionPremium("❌ NO TE QUEDAN INTENTOS DIARIOS");
        return;
    }
    if (tipo === 'evento' && usuario.eventosDisponibles <= 0) {
        mostrarNotificacionPremium("❌ NO TE QUEDAN INTENTOS DE EVENTO");
        return;
    }
    if (usuario.puntos < costo) {
        mostrarNotificacionPremium("❌ PUNTOS DE ALMA INSUFICIENTES");
        return;
    }

    usuario.puntos -= costo;
    
    if(tipo === 'diario') usuario.diariosDisponibles--;
    else usuario.eventosDisponibles--;

    let rarezaSuerte = "comun";
    const tiroDado = Math.random() * 100;

    if (tipo === 'evento') {
        if (tiroDado < 20) rarezaSuerte = "epico";       
        else if (tiroDado < 60) rarezaSuerte = "raro";   
    } else { 
        if (tiroDado < 5) rarezaSuerte = "epico";        
        else if (tiroDado < 30) rarezaSuerte = "raro";   
    }

    const cartasFiltradas = TODOS_LOS_CROMOS.filter(c => c.rareza === rarezaSuerte);
    const cromoInvocado = cartasFiltradas[Math.floor(Math.random() * cartasFiltradas.length)];

    usuario.misCromosIds.push(cromoInvocado.id);

    guardarDatosEnLocal();
    actualizarPerfilVisual();
    actualizarBadgesCofres();
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
//  5. CONTROLADORES DE RENDERIZADO VISUAL Y ESTADÍSTICAS REALES
// =========================================================================
function actualizarPerfilVisual() {
    const domUser = document.getElementById('display-username');
    const domPuntos = document.getElementById('profile-points-count');
    const domCardsCount = document.getElementById('profile-card-count');
    const btnEditar = document.getElementById('btn-editar-nombre');
    const barFill = document.getElementById('profile-bar-fill');
    const textPercent = document.getElementById('progress-text-percent');
    const domRank = document.getElementById('profile-rank-level');

    const cromosUnicos = [...new Set(usuario.misCromosIds)];

    // Corrección lógica: Rango basado en misiones completadas reales
    const rangoCalculado = Math.floor(usuario.misionesCompletadas / 5) + 1;
    if (domRank) domRank.textContent = rangoCalculado;

    if (domUser) domUser.textContent = usuario.nombre;
    if (domPuntos) domPuntos.textContent = usuario.puntos;
    if (domCardsCount) domCardsCount.textContent = `${cromosUnicos.length}/${TOTAL_FOTOS_SISTEMA}`;
    if (btnEditar) btnEditar.textContent = usuario.nombre === "Nuevo Jugador" ? "Registrarse" : "Editar";

    // ARREGLO BUG BARRA: Cálculo real inyectado directamente en el DOM
    const porcentajeProgreso = ((cromosUnicos.length / TOTAL_FOTOS_SISTEMA) * 100).toFixed(2);
    if (barFill) barFill.style.width = `${porcentajeProgreso}%`;
    if (textPercent) textPercent.textContent = `${porcentajeProgreso} %`;

    // Actualización de contadores de gemas
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
        }
    }
}

function renderizarAlbumCompleto() {
    const grid = document.getElementById('album-grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    if (usuario.misCromosIds.length === 0) {
        grid.innerHTML = `<div style="grid-column: span 3; text-align:center; color:#62717e; padding:20px;">Tu álbum está vacío. ¡Abre cofres!</div>`;
        return;
    }

    const conteoCards = {};
    usuario.misCromosIds.forEach(id => {
        conteoCards[id] = (conteoCards[id] || 0) + 1;
    });

    const idsUnicosOrdenados = Object.keys(conteoCards).map(Number).sort((a, b) => a - b);

    idsUnicosOrdenados.forEach(id => {
        const cromo = TODOS_LOS_CROMOS.find(c => c.id === id);
        if (!cromo) return;

        const abierto = cardMenuAbiertoId === cromo.id;
        const cantidad = conteoCards[id];

        grid.innerHTML += `
            <div class="card-container-relative" onclick="conmutarMenuFila(${cromo.id}, event)">
                <div class="card-preview">
                    <div class="card-badge-quantity">x${cantidad}</div>
                    <div class="card-header ${cromo.rareza}">${cromo.rareza.toUpperCase()}</div>
                    <div class="card-img-box">
                        <img src="${cromo.img}" alt="${cromo.nombre}" onerror="this.style.display='none';">
                    </div>
                    <div class="card-footer"><b>${cromo.nombre}</b></div>
                    
                    <div class="card-action-menu ${abierto ? 'visible' : 'hidden'}">
                        <button class="btn-action-menu" onclick="ejecutarVentaTarjeta(${cromo.id}, event)">Reciclar (Gemas + PA)</button>
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
        const copias = usuario.misCromosIds.filter(cId => cId === id).length;
        if (copias <= 1) {
            mostrarNotificacionPremium("❌ TU AVATAR REQUERIRÍA QUEDARSE SIN CARTAS");
            return;
        }
    }

    const cromo = TODOS_LOS_CROMOS.find(c => c.id === id);
    if (!cromo) return;

    // ELIMINAR EXCLUSIVAMENTE UN SOLO CROMO DUPLICADO (Bug solucionado)
    const indiceASacar = usuario.misCromosIds.indexOf(id);
    if (indiceASacar > -1) {
        usuario.misCromosIds.splice(indiceASacar, 1);
    }

    let recompensaTxt = "";
    usuario.puntos += 100; 

    if (cromo.rareza === "epico") {
        usuario.gemasEpicas += 1;
        recompensaTxt = "💎 +1 Gema Épica & +100 PA";
    } else if (cromo.rareza === "raro") {
        usuario.gemasRaras += 1;
        recompensaTxt = "🔷 +1 Gema Rara & +100 PA";
    } else {
        usuario.gemas += 1;
        recompensaTxt = "🟢 +1 Gema Común & +100 PA";
    }

    cardMenuAbiertoId = null;
    guardarDatosEnLocal();
    renderizarAlbumCompleto();
    actualizarPerfilVisual();
    mostrarNotificacionPremium(`💰 RECICLADO: ${recompensaTxt}`);
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

// =========================================================================
//  6. LÓGICA DE LA TIENDA DE INTERCAMBIO DE GEMAS (NUEVO)
// =========================================================================
window.comprarPuntosConGemas = function(tipoGema) {
    if (usuario.nombre === "Nuevo Jugador") {
        mostrarNotificacionPremium("❌ REGÍSTRATE PRIMERO EN MIS DATOS");
        return;
    }

    if (tipoGema === 'comun') {
        if (usuario.gemas < 5) { mostrarNotificacionPremium("❌ NECESITAS 5 GEMAS COMUNES"); return; }
        usuario.gemas -= 5;
        usuario.puntos += 150;
        mostrarNotificacionPremium("🟢 INTERCAMBIO: +150 Puntos de Alma");
    } else if (tipoGema === 'rara') {
        if (usuario.gemasRaras < 3) { mostrarNotificacionPremium("❌ NECESITAS 3 GEMAS RARAS"); return; }
        usuario.gemasRaras -= 3;
        usuario.puntos += 250;
        mostrarNotificacionPremium("🔷 INTERCAMBIO: +250 Puntos de Alma");
    } else if (tipoGema === 'epica') {
        if (usuario.gemasEpicas < 1) { mostrarNotificacionPremium("❌ NECESITAS 1 GEMA ÉPICA"); return; }
        usuario.gemasEpicas -= 1;
        usuario.puntos += 400;
        mostrarNotificacionPremium("💎 INTERCAMBIO: +400 Puntos de Alma (¡1 Tiro Gratis!)");
    }

    guardarDatosEnLocal();
    actualizarPerfilVisual();
    if (!viewCromos.classList.contains('hidden')) renderizarAlbumCompleto();
};

iniciarJuego();
