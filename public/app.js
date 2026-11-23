let API_URL = '';

async function obtenerConfiguracion() {
    if (API_URL) return API_URL;
    try {
        const res = await fetch('./config.json');
        if (!res.ok) throw new Error(`HTTP ${res.status} al leer config.json`);
        const config = await res.json();
        
        let base = config.apiUrl.replace(/\/+$/, '');
        API_URL = `${base}/api/tareas-dynamo`;
        return API_URL;
    } catch (error) {
        console.error('Error al cargar config.json:', error);
        throw error;
    }
}

async function cargarTareas() {
    try {
        const url = await obtenerConfiguracion();
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error en la API: HTTP ${res.status}`);
        
        const tareas = await res.json();
        const lista = document.getElementById('lista');
        
        if (Array.isArray(tareas)) {
            lista.innerHTML = tareas.map(t => 
                `<li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; background: #f4f4f4; padding: 8px 12px; border-radius: 4px;">
                    <span>${t.descripcion}</span>
                    <button onclick="eliminarTarea('${t.id}')" style="background-color: #e74c3c; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-weight: bold;">🗑️ Borrar</button>
                </li>`
            ).join('');
        }
    } catch (error) {
        console.error('Error al cargar tareas de DynamoDB:', error);
    }
}

async function agregarTarea() {
    const input = document.getElementById('titulo'); 
    const textoTarea = input.value.trim();
    if (!textoTarea) return;

    try {
        const url = await obtenerConfiguracion();
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion: textoTarea })
        });

        if (!res.ok) throw new Error(`Error al guardar: HTTP ${res.status}`);

        input.value = '';
        cargarTareas();
    } catch (error) {
        console.error('Error al guardar tarea en DynamoDB:', error);
    }
}

async function eliminarTarea(id) {
    if (!id || id === 'undefined') {
        console.error('El ID de la tarea no es válido');
        return;
    }

    try {
        const baseUrl = await obtenerConfiguracion();
        const res = await fetch(`${baseUrl}/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error(`Error al eliminar: HTTP ${res.status}`);

        cargarTareas();
    } catch (error) {
        console.error('Error al eliminar tarea de DynamoDB:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarTareas);