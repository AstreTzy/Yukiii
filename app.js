// BANCO DE DATOS OFICIAL CON MANGAS/MANHWAS REALES DE TUS CAPTURAS
const TODOS_LOS_CROMOS = [
    { id: 1, obra: "¿¡Hay Diosas en Ingeniería?!", nombre: "Hayoon (lencería)", rareza: "comun", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300" },
    { id: 2, obra: "Dragon Ball Z", nombre: "Vegetto (ssj)", rareza: "raro", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300" },
    { id: 3, obra: "Dragon Ball Z", nombre: "Goku (navidad)", rareza: "raro", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300" },
    { id: 4, obra: "Entre Nosotros", nombre: "Si-Woon (lencería)", rareza: "comun", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300" },
    { id: 5, obra: "Komi-san wa Komyushou Desu", nombre: "Shouko Komi (navidad)", rareza: "epico", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300" },
    { id: 6, obra: "Me Comí a tu Madre Primero", nombre: "Lee Sohee (lencería)", rareza: "comun", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300" }
];

// MODELO DE ECONOMÍA INTEGRADO (EMPIEZAS CON 500 PUNTOS)
let usuario = {
    nombre: "santso",
    puntos: 500,
    misionesCompletadas: 0,
    g_comun: 10, g_rara: 0, g_epica: 0,
    disponiblesEvento: 2,
    disponiblesDiario: 1,
    misCromosIds: [1, 2], // Cartas de inicio para pruebas
    avatarCromoId: null,
    ultimoReinicioDia: ""
};

// Elementos de la Interfaz Web
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
    guardarYActualizar();
    
    // Duplicar elementos del carrusel para ciclo infinito suave
    const track = document.querySelector('.carousel-track');
    track.innerHTML += track.innerHTML;
}

// RELOJ CON REFRESH AUTOMÁTICO Y BONO DIARIO DE +500 PUNTOS DE ALMA
function comprobarReinicioTiempo() {
    const hoy = new Date().toDateString();
    if (usuario.ultimoReinicioDia !== hoy) {
        if (usuario.ultimoReinicioDia !== "") {
            usuario.puntos += 500; // RECOMPENSA DIARIA AUTOMÁTICA
            setTimeout(() => {
                document.getElementById('modal-title').textContent = "BENDICIÓN DIARIA";
                abrirModal("<h3>¡Portal diario activado!</h3><p>Has absorbido <b style='color:#e39d39;'>+500 Puntos de Alma</b>.</p>");
            }, 800);
        }
        usuario.disponiblesEvento = 2;
        usuario.disponiblesDiario = 1;
        usuario.ultimoReinicioDia = hoy;
        guardarYActualizar();
    }
}

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

// NAVEGACIÓN ENTRE PESTAÑAS
btnTabCofres.addEventListener('click', () => cambiarPestaña(btnTabCofres, viewCofres));
btnTabPerfil.addEventListener('click', () => { cambiarPestaña(btnTabPerfil, viewPerfil); actualizarPerfilVisual(); });
btnTabCromos.addEventListener('click', () => { cambiarPestaña(btnTabCromos, viewCromos); renderizarAlbum(); });

function cambiarPestaña(boton, vista) {
    [btnTabCofres, btnTabPerfil, btnTabCromos].forEach(b => b.classList.remove('active'));
    [viewCofres, viewPerfil, viewCromos].forEach(v => v.classList.add('hidden'));
    boton.classList.add('active'); vista.classList.remove('hidden');
}

// BOTÓN MISIONES (MAZMORRA) EXTRA DE PUNTOS
document.getElementById('btn-hacer-mision').addEventListener('click', () => {
    const ganancia = Math.floor(Math.random() * 31) + 20; // +20 a +50 puntos
    usuario.puntos += ganancia;
    usuario.misionesCompletadas++;
    guardarYActualizar();
    actualizarPerfilVisual();
    
    document.getElementById('modal-title').textContent = "MAZMORRA S-RANK";
    abrirModal(`<h3>¡Victoria!</h3><p>Derrotaste al jefe de la zona.<br>Recompensa espiritual: <b style='color:#5cb85c;'>+${ganancia} PA</b></p>`);
});

// COMPRA DE COFRES (CON DESCUENTOS EN VIVO)
document.getElementById('btn-abrir-evento').addEventListener('click', () => {
    if (usuario.puntos >= 500 && usuario.disponiblesEvento > 0) {
        usuario.puntos -= 500; usuario.disponiblesEvento--;
        const cromoSorteado = TODOS_LOS_CROMOS[Math.floor(Math.random() * 4)]; // Selecciona normales
        entregarPremio(cromoSorteado, 500);
    } else { alert("Puntos insuficientes (500 PA) o límite alcanzado."); }
});

document.getElementById('btn-abrir-diario').addEventListener('click', () => {
    if (usuario.puntos >= 1000 && usuario.disponiblesDiario > 0) {
        usuario.puntos -= 1000; usuario.disponiblesDiario--;
        const cromoSorteado = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        entregarPremio(cromoSorteado, 1000);
    } else { alert("Puntos insuficientes (1000 PA para Invocación Épica) o ya la abriste hoy."); }
});

function entregarPremio(carta, costo) {
    if (!usuario.misCromosIds.includes(carta.id)) { usuario.misCromosIds.push(carta.id); }
    guardarYActualizar();
    
    document.getElementById('modal-title').textContent = "INVOCACIÓN EXITOSA";
    abrirModal(`
        <div class="card-preview" style="width:110px; height:170px; margin: 15px auto 0 auto;">
            <div class="card-header ${carta.rareza}">Cromo ${carta.rareza}</div>
            <div class="card-img-box"><img src="${carta.img}"></div>
            <div class="card-footer"><b>${carta.obra}</b><span>${carta.nombre}</span></div>
        </div>
        <p style="color:#d9534f; font-size:13px; font-weight:bold; margin-top:15px;">Puntos Consumidos: -${costo} PA</p>
    `);
}

// ACTUALIZACIÓN DE INTERFAZ GENERAL
function guardarYActualizar() {
    document.getElementById('badge-evento').textContent = `${usuario.disponiblesEvento} Cofre Disponible`;
    document.getElementById('badge-diario').textContent = `${usuario.disponiblesDiario} Cofre Disponible`;
    document.getElementById('btn-abrir-evento').disabled = usuario.disponiblesEvento === 0;
    document.getElementById('btn-abrir-diario').disabled = usuario.disponiblesDiario === 0;
    
    localStorage.setItem('sekai_chronicles_save', JSON.stringify(usuario));
}

function actualizarPerfilVisual() {
    document.getElementById('display-username').textContent = usuario.nombre;
    document.getElementById('stats-misiones').textContent = usuario.misionesCompletadas;
    document.getElementById('profile-points-count').textContent = usuario.puntos;
    
    const obtenidos = usuario.misCromosIds.length;
    document.getElementById('profile-card-count').textContent = `${obtenidos}/300`;
    
    const pct = ((obtenidos / 300) * 100).toFixed(2);
    document.getElementById('progress-text-percent').textContent = `${pct} %`;
    document.getElementById('profile-bar-fill').style.width = `${pct}%`;
    
    // Cambiar la imagen de la medalla de rango según tus cartas obtenidas
    const medallaImg = document.getElementById('rank-medal-icon');
    if(obtenidos >= 5) { medallaImg.src = "https://cdn-icons-png.flaticon.com/512/4781/4781443.png"; } // Medalla Épica Violeta
    
    // Renderizar avatar seleccionado
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
    contenedorAvatar.innerHTML = `<div class="no-avatar-msg">Selecciona un cromo como avatar</div>`;
}

// RENDERIZAR ÁLBUM CON MENÚ INTERACTIVO COMPLETO (FOTO 2 Y FOTO 4)
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
                    <button class="btn-action-menu" onclick="venderCromo(${cromo.id})">Vender (500 exp.)</button>
                    <button class="btn-action-menu" onclick="establecerAvatar(${cromo.id})">Establecer de Avatar</button>
                    <button class="btn-action-menu" onclick="usarGema(${cromo.id})">Usar Gema Rara</button>
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
    usuario.puntos += 500; // Vender te da 500 puntos de vuelta
    if (usuario.avatarCromoId === id) usuario.avatarCromoId = null;
    guardarYActualizar(); renderizarAlbum();
    alert("Cromo vendido por +500 Puntos de Alma.");
};

window.establecerAvatar = function(id) {
    usuario.avatarCromoId = id;
    guardarYActualizar(); renderizarAlbum();
    alert("¡Cromo establecido como avatar de perfil!");
};

window.usarGema = function(id) {
    alert("Poder despertado. ¡Tu cromo ha sido bendecido con atributos extra!");
    conmutarMenuAccion(id);
};

// MODALES GLOBALES
function abrirModal(html) {
    document.getElementById('modal-body-content').innerHTML = html;
    modal.classList.remove('hidden');
}
document.getElementById('btn-cerrar-modal').addEventListener('click', () => modal.classList.add('hidden'));
document.getElementById('btn-editar-nombre').addEventListener('click', () => {
    const n = prompt("Nuevo Nick:", usuario.nombre);
    if(n) { usuario.nombre = n; actualizarPerfilVisual(); guardarYActualizar(); }
});

iniciarSistema();
