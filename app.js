body {
    background-color: #1f262e;
    color: #cbd4db;
    font-family: 'Segoe UI', Arial, sans-serif;
    margin: 0; padding: 0;
    user-select: none;
}

/* Barra Navegación Superior */
.top-nav {
    background-color: #26303c;
    display: flex;
    justify-content: space-around;
    border-bottom: 2px solid #192026;
    position: sticky; top: 0; z-index: 10;
}
.nav-item {
    background: none; border: none;
    color: #8393a2; font-size: 14px; font-weight: bold;
    padding: 16px 10px; cursor: pointer; width: 100%; text-align: center;
    transition: all 0.2s;
}
.nav-item.active {
    color: #e39d39; border-bottom: 3px solid #e39d39;
    background-color: rgba(255, 255, 255, 0.02);
}

.content-container { padding: 14px; max-width: 430px; margin: 0 auto; }
.hidden { display: none !important; }

.section-chest { margin-bottom: 25px; }
.title-chest { font-size: 16px; color: #fff; margin: 0 0 10px 0; font-weight: 600; }
.arrow { color: #e39d39; margin-right: 5px; }
.event-tag { color: #5bc0de; font-size: 13px; }

/* Carrusel Horizontal Animado */
.carousel-container {
    background: #161b22; padding: 10px; border-radius: 4px;
    overflow: hidden; display: flex; margin-bottom: 15px;
    border: 1px solid #2d3846;
}
.carousel-track {
    display: flex; gap: 12px;
    animation: scrollCarousel 20s linear infinite;
    width: max-content;
}
.carousel-track:hover { animation-play-state: paused; }
.carousel-card {
    display: flex; flex-direction: column; width: 75px; text-align: center; font-size: 10px; color: #fff;
}
.carousel-card img { width: 75px; height: 100px; object-fit: cover; border-radius: 3px; border: 1px solid #3c4b5e; }
.carousel-card span { margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@keyframes scrollCarousel {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

/* Indicadores de Cofres */
.availability-badge {
    background-color: #0d1117; border: 1px solid #e39d39; color: #e39d39;
    padding: 3px 12px; font-size: 12px; border-radius: 4px; width: fit-content; margin: 0 auto 6px auto;
}
.timer-display { font-size: 11px; color: #78828c; text-align: center; margin-bottom: 4px; font-family: monospace; }
.cost-tag { text-align: center; font-size: 12px; color: #a2afbc; margin-bottom: 12px; }
.chest-display { display: flex; justify-content: center; margin-bottom: 12px; }
.main-chest-img { width: 110px; height: auto; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); }

/* Botones Universales */
.btn-open {
    background: linear-gradient(180deg, #4a5768 0%, #2c3845 100%);
    color: #fff; border: 1px solid #000; width: 100%; padding: 11px 0;
    font-size: 14px; font-weight: bold; border-radius: 3px; cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}
.btn-open:active { transform: scale(0.99); background: #232d37; }
.btn-open:disabled { background: #2d353f; color: #57626e; border-color: #222; cursor: not-allowed; }

.btn-mission {
    background: linear-gradient(180deg, #e39d39 0%, #b8761d 100%);
    color: #000; border: 1px solid #7c4e0f; width: 100%; padding: 12px 0;
    font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer; margin-top: 15px;
}

/* Estructura del Álbum de Cromos */
.mystery-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 15px; }
.album-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 8px; }
.gems-counter-row { display: flex; justify-content: space-between; background: #161b22; padding: 10px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-bottom: 15px; border: 1px solid #2d3846; color: #e39d39; }

.card-container-relative { position: relative; width: 100%; height: 215px; }

.card-preview {
    background-color: #1c2127; border: 1px solid #000; border-radius: 4px;
    display: flex; flex-direction: column; overflow: hidden; height: 100%;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
.card-top-bar {
    background: #364453; text-align: center; font-weight: bold; color: #fff;
    font-size: 13px; height: 18px; line-height: 18px; cursor: pointer;
    border-bottom: 1px solid #000; transition: background 0.2s;
}
.card-top-bar:hover { background: #e39d39; color: #000; }

.card-img-box { flex: 1; background: #000; overflow: hidden; }
.card-img-box img { width: 100%; height: 100%; object-fit: cover; }

.card-footer {
    background-color: #181d24; color: #fff; padding: 5px 3px;
    text-align: center; display: flex; flex-direction: column; gap: 2px;
}
.card-footer b { font-size: 9px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-footer span { font-size: 8px; color: #8a99a5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-header.comun { background-color: #5bc0de; font-size: 10px; text-align: center; color: #000; font-weight: bold; }
.card-header.raro { background-color: #5cb85c; font-size: 10px; text-align: center; color: #000; font-weight: bold; }
.card-header.epico { background-color: #e39d39; font-size: 10px; text-align: center; color: #000; font-weight: bold; }

/* Menú Desplegable de las Cartas */
.card-action-menu {
    position: absolute; top: 18px; left: 0; width: 100%; height: calc(100% - 18px);
    background: rgba(16, 22, 29, 0.95); z-index: 5;
    display: flex; flex-direction: column; justify-content: center; padding: 6px; box-sizing: border-box; gap: 6px;
}
.btn-action-menu {
    background: rgba(45, 56, 70, 0.9); border: 1px solid #3e4d5e; color: #fff;
    font-size: 9px; padding: 6px 2px; border-radius: 3px; cursor: pointer; text-align: center;
}
.btn-action-menu:hover { background: #e39d39; color: #000; }

/* Perfil de Usuario */
.profile-card { background: #26303c; padding: 16px; border-radius: 6px; border: 1px solid #2d3846; }
.profile-header-box { text-align: center; margin-bottom: 15px; position: relative; }
.user-tag-title {
    background: #364453; color: #fff; font-size: 12px; font-weight: bold;
    padding: 4px 0; width: 100%; border-radius: 3px; margin-bottom: 12px; letter-spacing: 1px;
}
.main-avatar-container {
    width: 170px; height: 245px; margin: 0 auto; border-radius: 6px;
    overflow: hidden; border: 2px solid #e39d39; background: #161b22;
    box-shadow: 0 0 15px rgba(227, 157, 57, 0.2);
}
.no-avatar-msg { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 11px; color: #57626e; text-align: center; padding: 10px; }

.profile-username { font-size: 22px; margin: 12px 0 0 0; color: #fff; font-weight: bold; }
.edit-text { font-size: 12px; color: #8393a2; margin-left: 6px; cursor: pointer; font-weight: normal; }

.stats-panel { display: flex; gap: 16px; background: #181d24; padding: 14px; border-radius: 4px; align-items: center; margin-top: 10px; }
.rank-badge-box { display: flex; justify-content: center; align-items: center; }
.rank-icon { width: 64px; height: auto; filter: drop-shadow(0 2px 6px rgba(162,57,227,0.4)); }
.stats-text-box p { margin: 5px 0; font-size: 13px; color: #a2afbc; }
.stat-val { font-weight: bold; color: #fff; font-family: monospace; font-size: 14px; }

/* Barra de Medalla */
.progress-section { margin-top: 15px; }
.progress-txt { font-size: 12px; color: #8393a2; margin-bottom: 6px; }
.bar-container { background: #0d1117; height: 14px; border-radius: 7px; overflow: hidden; border: 1px solid #2d3846; }
.bar-fill { background: linear-gradient(90deg, #e39d39, #f3be7a); height: 100%; width: 0%; transition: width 0.5s; }

/* Modales Universales (Pantallas Flotantes) */
.modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal-content { background: #26303c; padding: 20px; border-radius: 6px; text-align: center; max-width: 260px; width: 100%; display: flex; flex-direction: column; align-items: center; border: 1px solid #3c4b5e; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
