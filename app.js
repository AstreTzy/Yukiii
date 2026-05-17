// =========================================================================
//  CONFIGURACIÓN DE TU ÁLBUM DE CROMOS (RUTAS LOCALES EN TU CARPETA IMG)
// =========================================================================

const TODOS_LOS_CROMOS = [
    {
        id: 1,
        obra: "Crónicas de Molly",
        nombre: "Molly, Estrella de las Arenas",
        rareza: "epico",
        img: "img/1.png" // <--- Aquí lee la foto 1 de tu carpeta img
    },
    {
        id: 2,
        obra: "Crónicas de Molly",
        nombre: "Molly, Guardiana del Bosque Divino",
        rareza: "raro",
        img: "img/2.png" // <--- Aquí lee la foto 2 de tu carpeta img
    },
    {
        id: 3,
        obra: "Manhwa Fanart",
        nombre: "Pepinito Card",
        rareza: "epico",
        img: "img/3.png" // <--- Tu foto del manhwa recortada
    }
    // Puedes seguir agregando más cartas hacia abajo siguiendo este orden:
    // { id: 4, obra: "...", nombre: "...", rareza: "comun", img: "img/4.png" }
];

// Estructura interna del usuario
let usuario = {
    nombre: "yuki",
    puntos: 3000,             
    misionesCompletadas: 7,
    g_comun: 10, g_rara: 0, g_epica: 0,
    disponiblesEvento: 2,
    disponiblesDiario: 1,
    misCromosIds: [1, 2, 3], // Te dejo las 3 cartas desbloqueadas para que pruebes el 3D
    avatarCromoId: 1,         
    ultimoReinicioDia: ""
};

// Elementos de la Interfaz
const btnTabCofres = document.getElementById('tab-btn-cofres');
const btnTabPerfil = document.getElementById('tab-btn-perfil');
const btnTabCromos = document.getElementById('tab-btn-cromos');
const viewCofres = document.getElementById('view-cofres');
const viewPerfil = document.getElementById('view-perfil');
const viewCromos = document.getElementById('view-cromos');

function iniciarSistema() {
    const guardado = localStorage.getItem('sekai_chronicles_save');
    const pantallaBienvenida = document.getElementById('welcome-screen');

    if (guardado) { 
        usuario = JSON.parse(guardado); 
        if (pantallaBienvenida) pantallaBienvenida.classList.add('hidden');
    } else {
        if (pantallaBienvenida) pantallaBienvenida.classList.remove('hidden');
    }
    
    // Iconos decorativos de respaldo para los cofres (vía internet estable)
    const chestImg1 = document.querySelector('.main-chest-img');
    if(chestImg1) chestImg1.src = "https://cdn-icons-png.flaticon.com/512/3082/3082031.png";
    
    const chests = document.querySelectorAll('.main-chest-img');
    if(chests[1]) chests[1].src = "https://cdn-icons-png.flaticon.com/512/1041/1041446.png";

    comprobarReinicioTiempo();
    generarCarruselAutomatico();
    guardarYActualizar();
    actualizarPerfilVisual();
}

// Registro / Bienvenido
if(document.getElementById('btn-crear-usuario')) {
    document.getElementById('btn-crear-usuario').addEventListener('click', () => {
        const nombreInput = document.getElementById('input-nuevo-usuario').value.trim();
        if (nombreInput === "") { alert("¡Pon un nombre!"); return; }
        usuario.nombre = nombreInput;
        usuario.puntos = 3000;
        document.getElementById('welcome-screen').classList.add('hidden');
        guardarYActualizar();
        actualizarPerfilVisual();
    });
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
        usuario.disponiblesEvento = 2;
        usuario.disponiblesDiario = 1;
        usuario.ultimoReinicioDia = hoy;
        guardarYActualizar();
    }
}

// Reloj simulado
setInterval(() => {
    if(document.getElementById('timer-evento')) document.getElementById('timer-evento').textContent = "Siguiente reinicio en: 23:59:00";
    if(document.getElementById('timer-diario')) document.getElementById('timer-diario').textContent = "Siguiente reinicio en: 23:59:00";
}, 1000);

// Control de Pestañas Navegables
btnTabCofres.addEventListener('click', () => cambiarPestaña(btnTabCofres, viewCofres));
btnTabPerfil.addEventListener('click', () => { cambiarPestaña(btnTabPerfil, viewPerfil); actualizarPerfilVisual(); });
btnTabCromos.addEventListener('click', () => { cambiarPestaña(btnTabCromos, viewCromos); renderizarAlbum(); });

function cambiarPestaña(boton, vista) {
    [btnTabCofres, btnTabPerfil, btnTabCromos].forEach(b => b.classList.remove('active'));
    [viewCofres, viewPerfil, viewCromos].forEach(v => v.classList.add('hidden'));
    boton.classList.add('active'); vista.classList.remove('hidden');
}

// Botón de Mazmorra (+PA)
document.getElementById('btn-hacer-mision').addEventListener('click', () => {
    usuario.puntos += 25;
    usuario.misionesCompletadas++;
    guardarYActualizar();
    actualizarPerfilVisual();
    alert("¡Mazmorra superada! +25 Puntos de Alma");
});

// Mecánica Gacha (Invocaciones)
document.getElementById('btn-abrir-evento').addEventListener('click', () => {
    if (usuario.puntos >= 500) {
        usuario.puntos -= 500;
        const randomCard = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        if (!usuario.misCromosIds.includes(randomCard.id)) usuario.misCromosIds.push(randomCard.id);
        guardarYActualizar();
        alert(`¡Invocaste a: ${randomCard.nombre}!`);
    } else { alert("Puntos insuficientes."); }
});

document.getElementById('btn-abrir-diario').addEventListener('click', () => {
    if (usuario.puntos >= 1000) {
        usuario.puntos -= 1000;
        const randomCard = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        if (!usuario.misCromosIds.includes(randomCard.id)) usuario.misCromosIds.push(randomCard.id);
        guardarYActualizar();
        alert(`¡Invocación Épica: ${randomCard.nombre}!`);
    } else { alert("Puntos insuficientes."); }
});

function guardarYActualizar() {
    if(document.getElementById('badge-evento')) document.getElementById('badge-evento').textContent = `${usuario.disponiblesEvento} Cofres Disponibles`;
    if(document.getElementById('badge-diario')) document.getElementById('badge-diario').textContent = `${usuario.disponiblesDiario} Cofre Disponible`;
    localStorage.setItem('sekai_chronicles_save', JSON.stringify(usuario));
}

function actualizarPerfilVisual() {
    document.getElementById('display-username').textContent = usuario.nombre;
    document.getElementById('stats-misiones').textContent = usuario.misionesCompletadas;
    document.getElementById('profile-points-count').textContent = usuario.puntos;
    document.getElementById('profile-card-count').textContent = `${usuario.misCromosIds.length}/300`;
    
    const contenedorAvatar = document.getElementById('profile-avatar-display');
    if (usuario.avatarCromoId) {
        const infoCromo = TODOS_LOS_CROMOS.find(c => c.id === usuario.avatarCromoId);
        if (infoCromo) {
            contenedorAvatar.innerHTML = `<div class="card-preview"><div class="card-img-box"><img src="${infoCromo.img}"></div></div>`;
            return;
        }
    }
    contenedorAvatar.innerHTML = `<div class="no-avatar-msg">Elige un avatar</div>`;
}

function renderizarAlbum() {
    const grid = document.getElementById('album-grid-container');
    grid.innerHTML = '';
    usuario.misCromosIds.forEach(id => {
        const cromo = TODOS_LOS_CROMOS.find(c => c.id === id);
        if (cromo) {
            grid.innerHTML += `
                <div class="card-container-relative">
                    <div class="card-preview">
                        <div class="card-img-box"><img src="${cromo.img}"></div>
                        <div class="card-footer"><b>${cromo.nombre}</b></div>
                    </div>
                </div>`;
        }
    });
}

iniciarSistema();
