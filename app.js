// BANCO TOTAL DE DATOS DE LAS CARTAS REALES
const TODOS_LOS_CROMOS = [
    { id: 1, nombre: "Goku (navidad)", rareza: "raro", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200" },
    { id: 2, nombre: "Jaeun (navidad)", rareza: "raro", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200" },
    { id: 3, nombre: "Chopper (navidad)", rareza: "raro", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200" },
    { id: 4, nombre: "Vegetto (ssj)", rareza: "raro", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200" },
    { id: 5, nombre: "Shouko Komi", rareza: "epico", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200" },
    { id: 6, nombre: "Hayoon (lenceria)", rareza: "comun", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200" }
];

// VARIABLES DE SESIÓN LOCAL DEL JUGADOR
let usuario = {
    puntos: 5700,
    g_comun: 10, g_rara: 0, g_epica: 0,
    disponiblesEvento: 3,
    disponiblesDiario: 1,
    misCromosIds: []
};

// Cargar sesión si ya existe en la memoria del navegador
if(localStorage.getItem('gacha_game_total_save')) {
    usuario = JSON.parse(localStorage.getItem('gacha_game_total_save'));
}

// CAPTURA DE BOTONES Y SECCIONES
const btnTabCofres = document.getElementById('tab-btn-cofres');
const btnTabPerfil = document.getElementById('tab-btn-perfil');
const btnTabCromos = document.getElementById('tab-btn-cromos');

const viewCofres = document.getElementById('view-cofres');
const viewPerfil = document.getElementById('view-perfil');
const viewCromos = document.getElementById('view-cromos');

// MANEJO DE PESTAÑAS (NAVEGACIÓN)
btnTabCofres.addEventListener('click', () => activarPestaña(btnTabCofres, viewCofres));
btnTabPerfil.addEventListener('click', () => {
    activarPestaña(btnTabPerfil, viewPerfil);
    actualizarDatosPerfil();
});
btnTabCromos.addEventListener('click', () => {
    activarPestaña(btnTabCromos, viewCromos);
    renderizarContenedorAlbum();
});

function activarPestaña(botonActivo, vistaActiva) {
    [btnTabCofres, btnTabPerfil, btnTabCromos].forEach(b => b.classList.remove('active'));
    [viewCofres, viewPerfil, viewCromos].forEach(v => v.classList.add('hidden'));
    botonActivo.classList.add('active');
    vistaActiva.classList.remove('hidden');
}

// COMPRA DE COFRES
document.getElementById('btn-abrir-evento').addEventListener('click', () => {
    if(usuario.puntos >= 200 && usuario.disponiblesEvento > 0) {
        usuario.puntos -= 200;
        usuario.disponiblesEvento--;
        
        // Elige estrictamente entre los 3 primeros que son los de Navidad
        const premio = TODOS_LOS_CROMOS[Math.floor(Math.random() * 3)];
        agregarColeccion(premio);
    } else { alert("Verifica tus puntos o intentos diarios."); }
});

document.getElementById('btn-abrir-diario').addEventListener('click', () => {
    if(usuario.puntos >= 400 && usuario.disponiblesDiario > 0) {
        usuario.puntos -= 400;
        usuario.disponiblesDiario--;
        
        const premio = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        agregarColeccion(premio);
    } else { alert("No posees puntos o ya abriste este cofre."); }
});

document.getElementById('btn-abrir-gemas').addEventListener('click', () => {
    if(usuario.puntos >= 100) {
        usuario.puntos -= 100;
        
        const r = Math.random();
        let tipoGema = "Gema Común";
        if(r < 0.1) { usuario.g_epica++; tipoGema = "Gema Épica ✨"; }
        else if(r < 0.35) { usuario.g_rara++; tipoGema = "Gema Rara 💎"; }
        else { usuario.g_comun++; }
        
        guardarAlmacenamiento();
        abrirModalRecompensa(`<h3>¡Recibiste!</h3><p style='font-size:18px; color:#4eb0b0;'>${tipoGema}</p>`);
    } else { alert("Puntos insuficientes."); }
});

// GESTIÓN DEL INVENTARIO
function agregarColeccion(carta) {
    if(!usuario.misCromosIds.includes(carta.id)) {
        usuario.misCromosIds.push(carta.id);
    }
    guardarAlmacenamiento();
    
    // Inyecta el cromo de alta definición en la ventana emergente
    const cardHtml = `
        <div class="card-preview" style="width:130px; height:200px; transform:scale(1.1); margin-top:15px;">
            <div class="card-header ${carta.rareza}">Cromo ${carta.rareza}</div>
            <div class="card-img-box"><img src="${carta.img}"></div>
            <div class="card-footer">${carta.nombre}</div>
        </div>
    `;
    abrirModalRecompensa(cardHtml);
}

function guardarAlmacenamiento() {
    document.getElementById('badge-evento').textContent = `${usuario.disponiblesEvento} Cofre Disponible`;
    document.getElementById('badge-diario').textContent = `${usuario.disponiblesDiario} Cofre Disponible`;
    
    document.getElementById('btn-abrir-evento').disabled = usuario.disponiblesEvento === 0;
    document.getElementById('btn-abrir-diario').disabled = usuario.disponiblesDiario === 0;
    
    localStorage.setItem('gacha_game_total_save', JSON.stringify(usuario));
}

// REFRESCAR PANTALLA DE DATOS (MIS ESTADÍSTICAS)
function actualizarDatosPerfil() {
    const totalMaximoJuego = 300;
    const obtenidos = usuario.misCromosIds.length;
    const calculoPorcentaje = ((obtenidos / totalMaximoJuego) * 100).toFixed(2);
    
    document.getElementById('profile-card-count').textContent = `${obtenidos}/${totalMaximoJuego}`;
    document.getElementById('profile-points-count').textContent = usuario.puntos;
    document.getElementById('progress-text-percent').textContent = `${calculoPorcentaje} %`;
    document.getElementById('profile-bar-fill').style.width = `${calculoPorcentaje}%`;
}

// REFRESCAR ÁLBUM VISUAL DE CROMOS obtenidos
function renderizarContenedorAlbum() {
    document.getElementById('gem-count-comun').textContent = usuario.g_comun;
    document.getElementById('gem-count-rara').textContent = usuario.g_rara;
    document.getElementById('gem-count-epica').textContent = usuario.g_epica;
    
    const grid = document.getElementById('album-grid-container');
    grid.innerHTML = '';
    
    if(usuario.misCromosIds.length === 0) {
        grid.innerHTML = `<p style="grid-column:span 3; text-align:center; color:#78828c; padding:30px 0;">No tienes cromos en tu colección.</p>`;
        return;
    }
    
    usuario.misCromosIds.forEach(id => {
        const cromoInfo = TODOS_LOS_CROMOS.find(c => c.id === id);
        if(cromoInfo) {
            const cajaCromo = document.createElement('div');
            cajaCromo.className = "card-preview";
            cajaCromo.innerHTML = `
                <div class="card-header ${cromoInfo.rareza}">Cromo</div>
                <div class="card-img-box"><img src="${cromoInfo.img}"></div>
                <div class="card-footer">${cromoInfo.nombre}</div>
            `;
            grid.appendChild(cajaCromo);
        }
    });
}

// SISTEMA INTERNO DE VENTANA EMERGENTE (MODAL)
const modal = document.getElementById('reward-modal');
function abrirModalRecompensa(htmlContenido) {
    document.getElementById('modal-body-content').innerHTML = htmlContenido;
    modal.classList.remove('hidden');
}
document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Inicialización Automática al Encender la Aplicación
guardarAlmacenamiento();
