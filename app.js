// =========================================================================
//  CONFIGURACIÓN AUTOMÁTICA DEL JUEGO
// =========================================================================

// CAMBIA ESTE NÚMERO por la cantidad total de fotos que tengas en tu carpeta 'img'
const TOTAL_DE_CARTAS_EN_CARPETA = 4; 

const TODOS_LOS_CROMOS = [];

// Este ciclo lee y fabrica tus estampitas en orden: img/1.png, img/2.png, etc.
for (let i = 1; i <= TOTAL_DE_CARTAS_EN_CARPETA; i++) {
    // Si el número es 1, sabemos que es tu perrita Molly
    let nombreCromo = (i === 1) ? "Molly (Estrella de las Arenas)" : `Héroe Cósmico #${i}`;
    let obraCromo = (i === 1) ? "Crónicas de Molly" : "Ecos del Destino";
    let rarezaCromo = (i % 3 === 0) ? "epico" : (i % 2 === 0) ? "raro" : "comun";

    TODOS_LOS_CROMOS.push({
        id: i,
        obra: obraCromo,
        nombre: nombreCromo,
        rareza: rarezaCromo,
        img: `img/${i}.png` // Busca automáticamente en tu carpeta
    });
}

// Datos iniciales de tu partida (coherentes con tus estadísticas)
let usuario = {
    nombre: "Pepinito",
    puntos: 5300,             
    misionesCompletadas: 0,
    g_comun: 10, g_rara: 0, g_epica: 0,
    disponiblesEvento: 2,
    disponiblesDiario: 1,
    misCromosIds: [1],        // Empiezas con Molly (ID 1) ya desbloqueada
    avatarCromoId: 1,         // Molly puesta en tu perfil desde el inicio
    ultimoReinicioDia: ""
};

// =========================================================================
//  LOGICA DEL SISTEMA (ELEMENTOS DE LA INTERFAZ)
// =========================================================================

const btnTabCofres = document.getElementById('tab-btn-cofres');
const btnTabPerfil = document.getElementById('tab-btn-perfil');
const btnTabCromos = document.getElementById('tab-btn-cromos');
const viewCofres = document.getElementById('view-cofres');
const viewPerfil = document.getElementById('view-perfil');
const viewCromos = document.getElementById('view-cromos');
const modal = document.getElementById('reward-modal');

function iniciarSistema() {
    const guardado = localStorage.getItem('sekai_chronicles_save');
    if (guardado) { usuario = JSON.parse(guardado); }
    
    comprobarReinicioTiempo();
    generarCarruselAutomatico();
    guardarYActualizar();
}

// Llena el banner que se mueve solo con las imágenes cargadas
function generarCarruselAutomatico() {
    const track = document.getElementById('carrusel-dinamico');
    if (track) {
        track.innerHTML = ''; // Limpiar anteriores
        TODOS_LOS_CROMOS.forEach(cromo => {
            track.innerHTML += `
                <div class="carousel-card">
                    <img src="${cromo.img}" alt="${cromo.nombre}">
                    <span>${cromo.nombre}</span>
                </div>`;
        });
        // Duplicamos el track de cartas para crear el efecto infinito de giro continuo
        track.innerHTML += track.innerHTML;
    }
}

// Bendición diaria con +500 PA gratis al cambiar de día
function comprobarReinicioTiempo() {
    const hoy = new Date().toDateString();
    if (usuario.ultimoReinicioDia !== hoy) {
        if (usuario.ultimoReinicioDia !== "") {
            usuario.puntos += 500;
            setTimeout(() => {
                document.getElementById('modal-title').textContent = "BENDICIÓN DIARIA";
                abrirModal("<h3>¡Portal diario restaurado!</h3><p>Has absorbido <b style='color:#e39d39;'>+500 Puntos de Alma</b> de regalo.</p>");
            }, 800);
        }
        usuario.disponiblesEvento = 2;
        usuario.disponiblesDiario = 1;
        usuario.ultimoReinicioDia = hoy;
        guardarYActualizar();
    }
}

// Reloj temporizador de reinicios a las 24 hrs
setInterval(() => {
    const ahora = new Date();
    const mañana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    const diferencia = mañana - ahora;
    const horas = String(Math.floor((diferencia / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    const minutos = String(Math.floor((diferencia / 1000 / 60) % 60)).padStart(2, '0');
    const segundos = String(Math.floor((diferencia / 1000) % 60)).padStart(2, '0');
    
    const stringTiempo = `Siguiente reinicio en: ${horas}:${minutos}:${segundos}`;
    document.getElementById('timer-evento').textContent = stringTiempo;
    document.getElementById('timer-diario').textContent = stringTiempo;
}, 1000);

// Control de navegación
btnTabCofres.addEventListener('click', () => cambiarPestaña(btnTabCofres, viewCofres));
btnTabPerfil.addEventListener('click', () => { cambiarPestaña(btnTabPerfil, viewPerfil); actualizarPerfilVisual(); });
btnTabCromos.addEventListener('click', () => { cambiarPestaña(btnTabCromos, viewCromos); renderizarAlbum(); });

function cambiarPestaña(boton, vista) {
    [btnTabCofres, btnTabPerfil, btnTabCromos].forEach(b => b.classList.remove('active'));
    [viewCofres, viewPerfil, viewCromos].forEach(v => v.classList.add('hidden'));
    boton.classList.add('active'); vista.classList.remove('hidden');
}

// Mazmorras para farmear Puntos de Alma
document.getElementById('btn-hacer-mision').addEventListener('click', () => {
    const ganancia = Math.floor(Math.random() * 31) + 20; 
    usuario.puntos += ganancia;
    usuario.misionesCompletadas++;
    guardarYActualizar();
    actualizarPerfilVisual();
    
    document.getElementById('modal-title').textContent = "MAZMORRA COMPLETADA";
    abrirModal(`<h3>¡Victoria Total!</h3><p>Derrotaste al Guardián.<br>Esencia obtenida: <b style='color:#5cb85c;'>+${ganancia} Puntos de Alma</b></p>`);
});

// Apertura de cofres de invocación gacha
document.getElementById('btn-abrir-evento').addEventListener('click', () => {
    if (usuario.puntos >= 500 && usuario.disponiblesEvento > 0) {
        usuario.puntos -= 500; usuario.disponiblesEvento--;
        const cromoSorteado = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        entregarPremio(cromoSorteado, 500);
    } else { alert("Puntos insuficientes (500 PA) o alcanzaste tu límite diario."); }
});

document.getElementById('btn-abrir-diario').addEventListener('click', () => {
    if (usuario.puntos >= 1000 && usuario.disponiblesDiario > 0) {
        usuario.puntos -= 1000; usuario.disponiblesDiario--;
        const cromoSorteado = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        entregarPremio(cromoSorteado, 1000);
    } else { alert("Puntos insuficientes (1000 PA) o ya lo abriste hoy."); }
});

function entregarPremio(carta, costo) {
    if (!usuario.misCromosIds.includes(carta.id)) { usuario.misCromosIds.push(carta.id); }
    guardarYActualizar();
    
    document.getElementById('modal-title').textContent = "INVOCACIÓN EXITOSA";
    abrirModal(`
        <div class="card-preview" style="width:110px; height:170px; margin: 15px auto 0 auto;">
            <div class="card-header ${carta.rareza}" style="text-transform: capitalize;">${carta.rareza}</div>
            <div class="card-img-box"><img src="${carta.img}"></div>
            <div class="card-footer"><b>${carta.obra}</b><span>${carta.nombre}</span></div>
        </div>
        <p style="color:#d9534f; font-size:13px; font-weight:bold; margin-top:15px;">PA Consumidos: -${costo}</p>
    `);
}

function guardarYActualizar() {
    document.getElementById('badge-evento').textContent = `${usuario.disponiblesEvento} Cofres Disponibles`;
    document.getElementById('badge-diario').textContent = `${usuario.disponiblesDiario} Cofre Disponible`;
    document.getElementById('btn-abrir-evento').disabled = usuario.disponiblesEvento === 0;
    document.getElementById('btn-abrir-diario').disabled = usuario.disponiblesDiario === 0;
    
    localStorage.setItem('sekai_chronicles_save', JSON.stringify(usuario));
}

// Pintar los datos del usuario e inyectar el avatar activo
function actualizarPerfilVisual() {
    document.getElementById('display-username').textContent = usuario.nombre;
    document.getElementById('stats-misiones').textContent = usuario.misionesCompletadas;
    document.getElementById('profile-points-count').textContent = usuario.puntos;
    
    const obtenidos = usuario.misCromosIds.length;
    document.getElementById('profile-card-count').textContent = `${obtenidos}/300`;
    
    const pct = ((obtenidos / 300) * 100).toFixed(2);
    document.getElementById('progress-text-percent').textContent = `${pct} %`;
    document.getElementById('profile-bar-fill').style.width = `${pct}%`;
    
    // Cambiar la imagen de la medalla de rango según tu cantidad de cartas
    const medallaImg = document.getElementById('rank-medal-icon');
    if(obtenidos >= 5) { 
        medallaImg.src = "https://cdn-icons-png.flaticon.com/512/4781/4781443.png"; // S-Rank Violeta
    }
    
    const contenedorAvatar = document.getElementById('profile-avatar-display');
    if (usuario.avatarCromoId) {
        const infoCromo = TODOS_LOS_CROMOS.find(c => c.id === usuario.avatarCromoId);
        if (infoCromo) {
            contenedorAvatar.innerHTML = `
                <div class="card-preview" style="border:none; height:100%;">
                    <div class="card-img-box"><img src="${infoCromo.img}"></div>
                    <div class="card-footer"><b>${infoCromo.obra}</b><span>${infoCromo.nombre}</span></div>
                </div>`;
            return;
        }
    }
    contenedorAvatar.innerHTML = `<div class="no-avatar-msg">Selecciona un cromo como avatar en tu colección</div>`;
}

// Pintar el inventario de cartas desbloqueadas con menú desplegable en español
function renderizarAlbum() {
    document.getElementById('gem-count-comun').textContent = usuario.g_comun;
    document.getElementById('gem-count-rara').textContent = usuario.g_rara;
    document.getElementById('gem-count-epica').textContent = usuario.g_epica;
    
    const grid = document.getElementById('album-grid-container');
    grid.innerHTML = '';
    
    usuario.misCromosIds.forEach(id => {
        const cromo = TODOS_LOS_CROMOS.find(c => c.id === id);
        if (cromo) {
            const wrapper = document.createElement('div');
            wrapper.className = "card-container-relative";
            wrapper.innerHTML = `
                <div class="card-preview">
                    <div class="card-top-bar" onclick="conmutarMenuAccion(${cromo.id})">+</div>
                    <div class="card-img-box"><img src="${cromo.img}"></div>
                    <div class="card-footer"><b>${cromo.obra}</b><span>${cromo.nombre}</span></div>
                </div>
                <div class="card-action-menu hidden" id="menu-accion-${cromo.id}">
                    <button class="btn-action-menu" onclick="venderCromo(${cromo.id})">Vender (+500 PA)</button>
                    <button class="btn-action-menu" onclick="establecerAvatar(${cromo.id})">Establecer de Avatar</button>
                    <button class="btn-action-menu" onclick="despertarPoder(${cromo.id})">Despertar Poder</button>
                </div>
            `;
            grid.appendChild(wrapper);
        }
    });
}

window.conmutarMenuAccion = function(id) {
    const menu = document.getElementById(`menu-accion-${id}`);
    const bar = menu.previousElementSibling.querySelector('.card-top-bar');
    
    if(menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        bar.textContent = "-";
    } else {
        menu.classList.add('hidden');
        bar.textContent = "+";
    }
};

window.venderCromo = function(id) {
    usuario.misCromosIds = usuario.misCromosIds.filter(cid => cid !== id);
    usuario.puntos += 500; 
    if (usuario.avatarCromoId === id) usuario.avatarCromoId = null;
    guardarYActualizar(); renderizarAlbum();
    alert("Héroe vendido. Recibiste +500 Puntos de Alma.");
};

window.establecerAvatar = function(id) {
    usuario.avatarCromoId = id;
    guardarYActualizar(); renderizarAlbum();
    alert("¡Héroe asignado como tu foto de perfil principal!");
};

window.despertarPoder = function(id) {
    alert("¡Poder Despertado! Se han imbuido gemas cósmicas para aumentar las estadísticas del personaje.");
    conmutarMenuAccion(id);
};

function abrirModal(html) {
    document.getElementById('modal-body-content').innerHTML = html;
    modal.classList.remove('hidden');
}
document.getElementById('btn-cerrar-modal').addEventListener('click', () => modal.classList.add('hidden'));
document.getElementById('btn-editar-nombre').addEventListener('click', () => {
    const n = prompt("Cambiar Nickname de Usuario:", usuario.nombre);
    if(n) { usuario.nombre = n; actualizarPerfilVisual(); guardarYActualizar(); }
});

iniciarSistema();
