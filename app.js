// =========================================================================
//  1. CONFIGURACIÓN AUTOMÁTICA POR NÚMEROS (GACHA SEKAI)
// =========================================================================

// 👇 ¡ESTE ES EL ÚNICO NÚMERO QUE TOCARÁS! 
// Cambiando este número el juego creará, registrará y te dará las cartas en automático.
const TOTAL_FOTOS_SUBIDAS = 3; 

// Generador inteligente de la lista de cromos usando tus números
const TODOS_LOS_CROMOS = Array.from({ length: TOTAL_FOTOS_SUBIDAS }, (_, index) => {
    const numero = index + 1;
    
    // Asigna rarezas automáticas (Común, Raro, Épico) para darle emoción
    let rarezaCard = "comun";
    if (numero % 3 === 0) rarezaCard = "epico";
    else if (numero % 2 === 0) rarezaCard = "raro";

    return {
        id: numero,
        obra: "Colección Sekai",
        nombre: `Cromo #${numero}`,
        rareza: rarezaCard,
        img: `img/${numero}.png` // Busca automáticamente en tu carpeta img/1.png, img/2.png, etc.
    };
});

// Genera la lista de IDs para que el jugador tenga desbloqueadas todas las que subas
const listaIdsAutomaticos = Array.from({ length: TOTAL_FOTOS_SUBIDAS }, (_, i) => i + 1);

// =========================================================================
//  2. ESTRUCTURA DE DATOS DEL USUARIO
// =========================================================================
let usuario = {
    nombre: "yuki",
    puntos: 3000,             
    misionesCompletadas: 7,
    g_comun: 10, g_rara: 0, g_epica: 0,
    disponiblesEvento: 2,
    disponiblesDiario: 1,
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

// =========================================================================
//  3. NÚCLEO DEL JUEGO (INICIALIZACIÓN)
// =========================================================================
function iniciarSistema() {
    const guardado = localStorage.getItem('sekai_chronicles_save');
    const pantallaBienvenida = document.getElementById('welcome-screen');

    // Si ya entró antes, respeta sus datos y oculta la bienvenida
    if (guardado) { 
        usuario = JSON.parse(guardado); 
        // Actualiza la lista automática por si subiste nuevas fotos mientras no estaba
        listaIdsAutomaticos.forEach(id => {
            if (!usuario.misCromosIds.includes(id)) usuario.misCromosIds.push(id);
        });
        if (pantallaBienvenida) pantallaBienvenida.classList.add('hidden');
    } else {
        if (pantallaBienvenida) pantallaBienvenida.classList.remove('hidden');
    }
    
    // Coloca imágenes estables de respaldo para los cofres de la tienda
    const chestImg1 = document.querySelector('.main-chest-img');
    if(chestImg1) chestImg1.src = "https://cdn-icons-png.flaticon.com/512/3082/3082031.png";
    
    const chests = document.querySelectorAll('.main-chest-img');
    if(chests[1]) chests[1].src = "https://cdn-icons-png.flaticon.com/512/1041/1041446.png";

    comprobarReinicioTiempo();
    generarCarruselAutomatico();
    guardarYActualizar();
    actualizarPerfilVisual();
}

// Registro de nuevos usuarios
if(document.getElementById('btn-crear-usuario')) {
    document.getElementById('btn-crear-usuario').addEventListener('click', () => {
        const nombreInput = document.getElementById('input-nuevo-usuario').value.trim();
        if (nombreInput === "") { alert("¡Pon un nombre!"); return; }
        usuario.nombre = nombreInput;
        usuario.puntos = 3000; // Regalo de bienvenida
        usuario.misCromosIds = listaIdsAutomaticos;
        document.getElementById('welcome-screen').classList.add('hidden');
        guardarYActualizar();
        actualizarPerfilVisual();
    });
}

// Generador del Carrusel Horizontal Superior
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

// Control de los temporizadores diarios
function comprobarReinicioTiempo() {
    const hoy = new Date().toDateString();
    if (usuario.ultimoReinicioDia !== hoy) {
        usuario.disponiblesEvento = 2;
        usuario.disponiblesDiario = 1;
        usuario.ultimoReinicioDia = hoy;
        guardarYActualizar();
    }
}

setInterval(() => {
    if(document.getElementById('timer-evento')) document.getElementById('timer-evento').textContent = "Siguiente reinicio en: 23:59:00";
    if(document.getElementById('timer-diario')) document.getElementById('timer-diario').textContent = "Siguiente reinicio en: 23:59:00";
}, 1000);

// =========================================================================
//  4. CONTROL DE PESTAÑAS (NAVEGACIÓN)
// =========================================================================
btnTabCofres.addEventListener('click', () => cambiarPestaña(btnTabCofres, viewCofres));
btnTabPerfil.addEventListener('click', () => { cambiarPestaña(btnTabPerfil, viewPerfil); actualizarPerfilVisual(); });
btnTabCromos.addEventListener('click', () => { cambiarPestaña(btnTabCromos, viewCromos); renderizarAlbum(); });

function cambiarPestaña(boton, vista) {
    [btnTabCofres, btnTabPerfil, btnTabCromos].forEach(b => b.classList.remove('active'));
    [viewCofres, viewPerfil, viewCromos].forEach(v => v.classList.add('hidden'));
    boton.classList.add('active'); vista.classList.remove('hidden');
}

// =========================================================================
//  5. BOTONES DE ACCIÓN (MAZMORRAS Y TIENDA GACHA)
// =========================================================================
document.getElementById('btn-hacer-mision').addEventListener('click', () => {
    usuario.puntos += 25;
    usuario.misionesCompletadas++;
    guardarYActualizar();
    actualizarPerfilVisual();
    alert("¡Mazmorra superada! +25 Puntos de Alma");
});

document.getElementById('btn-abrir-evento').addEventListener('click', () => {
    if (usuario.puntos >= 500) {
        usuario.puntos -= 500;
        const randomCard = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        if (!usuario.misCromosIds.includes(randomCard.id)) usuario.misCromosIds.push(randomCard.id);
        guardarYActualizar();
        alert(`¡Invocaste a: ${randomCard.nombre}!`);
    } else { alert("Puntos insuficientes de Alma."); }
});

document.getElementById('btn-abrir-diario').addEventListener('click', () => {
    if (usuario.puntos >= 1000) {
        usuario.puntos -= 1000;
        const randomCard = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        if (!usuario.misCromosIds.includes(randomCard.id)) usuario.misCromosIds.push(randomCard.id);
        guardarYActualizar();
        alert(`¡Invocación Épica: ${randomCard.nombre}!`);
    } else { alert("Puntos insuficientes de Alma."); }
});

function guardarYActualizar() {
    if(document.getElementById('badge-evento')) document.getElementById('badge-evento').textContent = `${usuario.disponiblesEvento} Cofres Disponibles`;
    if(document.getElementById('badge-diario')) document.getElementById('badge-diario').textContent = `${usuario.disponiblesDiario} Cofre Disponible`;
    localStorage.setItem('sekai_chronicles_save', JSON.stringify(usuario));
}

// =========================================================================
//  6. RENDERIZADO VISUAL DEL PERFIL Y EL ÁLBUM 3D
// =========================================================================
function actualizarPerfilVisual() {
    document.getElementById('display-username').textContent = usuario.nombre;
    document.getElementById('stats-misiones').textContent = usuario.misionesCompletadas;
    document.getElementById('profile-points-count').textContent = usuario.puntos;
    document.getElementById('profile-card-count').textContent = `${usuario.misCromosIds.length}/300`;
    
    const contenedorAvatar = document.getElementById('profile-avatar-display');
    if (usuario.avatarCromoId) {
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
    contenedorAvatar.innerHTML = `<div class="no-avatar-msg">Elige un avatar en tus Cromos</div>`;
}

function renderizarAlbum() {
    const grid = document.getElementById('album-grid-container');
    if (!grid) return;
    grid.innerHTML = '';
    
    usuario.misCromosIds.forEach(id => {
        const cromo = TODOS_LOS_CROMOS.find(c => c.id === id);
        if (cromo) {
            grid.innerHTML += `
                <div class="card-container-relative">
                    <div class="card-preview">
                        <div class="card-header ${cromo.rareza}">${cromo.rareza.toUpperCase()}</div>
                        <div class="card-img-box">
                            <img src="${cromo.img}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1041/1041446.png'">
                        </div>
                        <div class="card-footer">
                            <b>${cromo.nombre}</b>
                        </div>
                    </div>
                </div>`;
        }
    });
}

// ¡Arrancamos el motor del juego!
iniciarSistema();
