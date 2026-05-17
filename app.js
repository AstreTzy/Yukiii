// BANCO DE DATOS INTEGRADO CON LAS OBRAS Y PERSONAJES DE TUS CAPTURAS REALES
const TODOS_LOS_CROMOS = [
    { id: 1, obra: "¿¡Hay Diosas en Ingeniería?!", nombre: "Hayoon (lencería)", rareza: "comun", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200" },
    { id: 2, obra: "Dragon Ball Z", nombre: "Vegetto (ssj)", rareza: "raro", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200" },
    { id: 3, obra: "Entre Nosotros", nombre: "Si-Woon (lencería)", rareza: "comun", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200" },
    { id: 4, obra: "Komi-san No Puede Comunicarse", nombre: "Shouko Komi (navidad)", rareza: "epico", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200" },
    { id: 5, obra: "Me Comí a tu Madre Primero", nombre: "Lee Sohee (lencería)", rareza: "comun", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200" },
    { id: 6, obra: "Relaciones Laborales", nombre: "Rani (diamond)", rareza: "epico", img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200" }
];

// ESTRUCTURA DE ECONOMÍA MODIFICADA: EMPIEZAS CON 500 PUNTOS
let usuario = {
    nombre: "",
    puntos: 500, 
    g_comun: 10, g_rara: 0, g_epica: 0,
    disponiblesEvento: 3,
    disponiblesDiario: 1,
    misCromosIds: [],
    ultimoReinicioDia: ""
};

// CAPTURA DE INTERFAZ DEL NAVEGADOR
const btnTabCofres = document.getElementById('tab-btn-cofres');
const btnTabPerfil = document.getElementById('tab-btn-perfil');
const btnTabCromos = document.getElementById('tab-btn-cromos');
const viewCofres = document.getElementById('view-cofres');
const viewPerfil = document.getElementById('view-perfil');
const viewCromos = document.getElementById('view-cromos');
const modal = document.getElementById('reward-modal');

// CARGAR SESIÓN Y ARRANCAR MOTOR
function cargarJuego() {
    const guardado = localStorage.getItem('gacha_game_total_save');
    if (guardado) {
        usuario = JSON.parse(guardado);
    }
    
    comprobarNuevoUsuario();
    comprobarReinicioTiempo();
    guardarAlmacenamiento();
    actualizarRelojes();
}

// CREACIÓN DE USUARIO NUEVO INTERACTIVO
function comprobarNuevoUsuario() {
    if (!usuario.nombre || usuario.nombre.trim() === "") {
        document.getElementById('modal-title').textContent = "¡NUEVA CUENTA!";
        document.getElementById('modal-body-content').innerHTML = `
            <p>Introduce tu nick de jugador para iniciar con tus 500 puntos:</p>
            <input type="text" id="input-username-nuevo" class="username-input" placeholder="Nombre de usuario..." maxlength="15">
        `;
        const btnAceptar = document.getElementById('btn-cerrar-modal');
        btnAceptar.onclick = function() {
            const campoTexto = document.getElementById('input-username-nuevo').value;
            if (campoTexto && campoTexto.trim() !== "") {
                usuario.nombre = campoTexto.trim();
                document.getElementById('display-username').textContent = usuario.nombre;
                modal.classList.add('hidden');
                guardarAlmacenamiento();
                btnAceptar.onclick = () => modal.classList.add('hidden'); // Restaura cierre estándar
            } else { alert("Por favor ingresa un nombre válido."); }
        };
        modal.classList.remove('hidden');
    } else {
        document.getElementById('display-username').textContent = usuario.nombre;
    }
}

// RELOJ DIARIO CON BONO DE REFRESH DE +500 PUNTOS
function comprobarReinicioTiempo() {
    const hoy = new Date().toDateString();
    
    if (usuario.ultimoReinicioDia !== hoy) {
        if (usuario.ultimoReinicioDia !== "") {
            usuario.puntos += 500; // REGALO DIARIO DE 500 PUNTOS
            setTimeout(() => {
                document.getElementById('modal-title').textContent = "¡REGALO DIARIO!";
                abrirModalRecompensa("<h3>¡Bono del día listo!</h3><p>Has recibido tus <b style='color:#5cb85c;'>+500 Puntos</b> de hoy.</p>");
            }, 1000);
        }
        usuario.disponiblesEvento = 3;
        usuario.disponiblesDiario = 1;
        usuario.ultimoReinicioDia = hoy;
        guardarAlmacenamiento();
    }
}

function actualizarRelojes() {
    const ahora = new Date();
    const mañana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    const diferencia = mañana - ahora;

    const horas = String(Math.floor((diferencia / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    const minutos = String(Math.floor((diferencia / 1000 / 60) % 60)).padStart(2, '0');
    const segundos = String(Math.floor((diferencia / 1000) % 60)).padStart(2, '0');

    const tiempoTexto = `Siguiente reinicio en: ${horas}:${minutos}:${segundos}`;
    document.getElementById('timer-evento').textContent = tiempoTexto;
    document.getElementById('timer-diario').textContent = tiempoTexto;
}

// Ejecución del reloj en vivo
setInterval(() => {
    actualizarRelojes();
    comprobarReinicioTiempo();
}, 1000);

// NAVEGACIÓN ENTRE SECCIONES
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

// ACCIÓN: EDITAR NOMBRE EN PERFIL
document.getElementById('btn-editar-nombre').addEventListener('click', () => {
    const nuevoNombre = prompt("Introduce tu nuevo nombre de usuario:", usuario.nombre);
    if (nuevoNombre && nuevoNombre.trim() !== "") {
        usuario.nombre = nuevoNombre.trim();
        document.getElementById('display-username').textContent = usuario.nombre;
        guardarAlmacenamiento();
    }
});

// COMPRA Y APERTURA DE COFRES CON DESCUENTOS EXACTOS
document.getElementById('btn-abrir-evento').addEventListener('click', () => {
    if(usuario.puntos >= 500 && usuario.disponiblesEvento > 0) {
        usuario.puntos -= 500; // Descuenta 500
        usuario.disponiblesEvento--;
        const premio = TODOS_LOS_CROMOS[Math.floor(Math.random() * 3)]; // Selección de cromos normales de evento
        agregarColeccion(premio, 500);
    } else { alert("Puntos insuficientes (500 pts) o límite diario alcanzado."); }
});

document.getElementById('btn-abrir-diario').addEventListener('click', () => {
    if(usuario.puntos >= 1000 && usuario.disponiblesDiario > 0) {
        usuario.puntos -= 1000; // Descuenta 1000 de la caja épica
        usuario.disponiblesDiario--;
        const premio = TODOS_LOS_CROMOS[Math.floor(Math.random() * TODOS_LOS_CROMOS.length)];
        agregarColeccion(premio, 1000);
    } else { alert("Necesitas 1000 pts para la Caja Épica o ya la abriste hoy."); }
});

document.getElementById('btn-abrir-gemas').addEventListener('click', () => {
    if(usuario.puntos >= 100) {
        usuario.puntos -= 100; // Descuenta 100 puntos
        const r = Math.random();
        let tipoGema = "Gema Común";
        if(r < 0.1) { usuario.g_epica++; tipoGema = "Gema Épica ✨"; }
        else if(r < 0.35) { usuario.g_rara++; tipoGema = "Gema Rara 💎"; }
        else { usuario.g_comun++; }
        guardarAlmacenamiento();
        document.getElementById('modal-title').textContent = "¡COFRE DE GEMAS!";
        abrirModalRecompensa(`<h3>¡Recibiste!</h3><p style='font-size:18px; color:#4eb0b0;'>${tipoGema}</p><p style='font-size:12px; color:#78828c;'>Costo: -100 Puntos</p>`);
    } else { alert("Puntos insuficientes (100 pts)."); }
});

// AGREGAR AL ÁLBUM Y ALERTA VISUAL DE DESCUENTOS
function agregarColeccion(carta, puntosDescontados) {
    if(!usuario.misCromosIds.includes(carta.id)) {
        usuario.misCromosIds.push(carta.id);
    }
    guardarAlmacenamiento();
    
    document.getElementById('modal-title').textContent = "¡CROMO OBTENIDO!";
    const cardHtml = `
        <div class="card-preview" style="width:130px; height:200px; transform:scale(1.1); margin-top:15px;">
            <div class="card-header ${carta.rareza}">Cromo ${carta.rareza}</div>
            <div class="card-img-box"><img src="${carta.img}"></div>
            <div class="card-footer" style="flex-direction:column; gap:2px; padding:2px 1px;">
                <b style="font-size:8px; color:#fff; display:block; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;">${carta.obra}</b>
                <span style="font-size:7.5px; color:#cbd4db;">${carta.nombre}</span>
            </div>
        </div>
        <p style="color:#d9534f; font-size:13px; margin-top:25px; font-weight:bold;">Puntos descontados: -${puntosDescontados} pts.</p>
    `;
    abrirModalRecompensa(cardHtml);
}

function guardarAlmacenamiento() {
    document.getElementById('badge-evento').textContent = `${usuario.disponiblesEvento} Cofres Disponibles`;
    document.getElementById('badge-diario').textContent = `${usuario.disponiblesDiario} Cofre Disponible`;
    
    document.getElementById('btn-abrir-evento').disabled = usuario.disponiblesEvento === 0;
    document.getElementById('btn-abrir-diario').disabled = usuario.disponiblesDiario === 0;
    
    localStorage.setItem('gacha_game_total_save', JSON.stringify(usuario));
}

// ACTUALIZACIÓN VISUAL DE ESTADÍSTICAS Y BARRA DE PROGRESO
function actualizarDatosPerfil() {
    const totalMaximoJuego = 300;
    const obtenidos = usuario.misCromosIds.length;
    const calculoPorcentaje = ((obtenidos / totalMaximoJuego) * 100).toFixed(2);
    
    document.getElementById('profile-card-count').textContent = `${obtenidos}/${totalMaximoJuego}`;
    document.getElementById('profile-points-count').textContent = usuario.puntos;
    document.getElementById('progress-text-percent').textContent = `${calculoPorcentaje} %`;
    document.getElementById('profile-bar-fill').style.width = `${calculoPorcentaje}%`;
}

// REFRESH DE LA SECCIÓN "MIS CROMOS" CON BOTÓN "+" Y FILAS COMPLETA DE TEXTO
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
                <div class="card-top-bar" style="background:#b0b8c1; text-align:center; font-weight:bold; color:#000; font-size:12px; border-bottom:1px solid #000; height:16px; line-height:16px; cursor:pointer;">+</div>
                <div class="card-img-box"><img src="${cromoInfo.img}"></div>
                <div class="card-footer" style="flex-direction:column; gap:2px; padding:2px 1px;">
                    <b style="font-size:8px; color:#fff; display:block; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;">${cromoInfo.obra}</b>
                    <span style="font-size:7.5px; color:#cbd4db;">${cromoInfo.nombre}</span>
                </div>
            `;
            grid.appendChild(cajaCromo);
        }
    });
}

function abrirModalRecompensa(htmlContenido) {
    document.getElementById('modal-body-content').innerHTML = htmlContenido;
    modal.classList.remove('hidden');
}

document.getElementById('btn-cerrar-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
});

// INICIALIZACIÓN
cargarJuego();
