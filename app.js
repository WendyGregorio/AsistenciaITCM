// app.js

document.addEventListener('DOMContentLoaded', () => {
    // === Reloj y Fecha ===
    function updateClock() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString();
        document.getElementById('date').textContent = now.toLocaleDateString();
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Fecha predeterminada (Hoy local)
    const dateInput = document.getElementById('dateFilter');
    const now = new Date();
    const todayISO = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    dateInput.value = todayISO;

    // Cargar datos iniciales
    loadAttendance(todayISO);

    // Evento cambio de fecha
    dateInput.addEventListener('change', (e) => {
        loadAttendance(e.target.value);
    });

    // === Registrar Entrada ===
    const entryForm = document.getElementById('entryForm');
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnEntry');
        const status = document.getElementById('entryStatus');

        btn.disabled = true;
        status.textContent = "Guardando...";
        status.className = "status-msg";

        const formData = new FormData(entryForm);
        const data = Object.fromEntries(formData.entries());

        // Datos automáticos
        const entryDateObj = new Date();
        const dateString = new Date(entryDateObj.getTime() - (entryDateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const timeString = entryDateObj.toLocaleTimeString();

        try {
            // Verificar duplicados (Entrada sin salida el mismo día)
            const q = db.collection("attendance")
                .where("list_number", "==", data.list_number)
                .where("date", "==", dateString)
                .where("exit_time", "==", null);

            const snapshot = await q.get();

            if (!snapshot.empty) {
                throw new Error("El alumno ya tiene una entrada activa hoy.");
            }

            // Guardar en Firestore
            await db.collection("attendance").add({
                ...data,
                entry_time: timeString,
                exit_time: null,
                date: dateString,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            status.textContent = `¡Entrada registrada: ${timeString}!`;
            status.classList.add("success");
            entryForm.reset();

            // Si estamos viendo "hoy", recargar la tabla
            if (dateInput.value === dateString) {
                loadAttendance(dateString);
            }

        } catch (error) {
            console.error("Error:", error);
            status.textContent = error.message;
            status.classList.add("error");
        } finally {
            btn.disabled = false;
            setTimeout(() => { status.textContent = ""; }, 5000);
        }
    });

    // === Registrar Salida ===
    const exitForm = document.getElementById('exitForm');
    exitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnExit');
        const status = document.getElementById('exitStatus');
        const listNumber = document.getElementById('exit_list_number').value;

        btn.disabled = true;
        status.textContent = "Buscando...";
        status.className = "status-msg";

        const exitDateObj = new Date();
        const dateString = new Date(exitDateObj.getTime() - (exitDateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const timeString = exitDateObj.toLocaleTimeString();

        try {
            // Buscar registro activo (sin salida) de HOY para este numero de lista
            const q = db.collection("attendance")
                .where("list_number", "==", listNumber)
                .where("date", "==", dateString)
                .where("exit_time", "==", null)
                .limit(1);

            const snapshot = await q.get();

            if (snapshot.empty) {
                throw new Error("No se encontró entrada pendiente para hoy.");
            }

            const docId = snapshot.docs[0].id;

            // Actualizar registro
            await db.collection("attendance").doc(docId).update({
                exit_time: timeString
            });

            status.textContent = `¡Salida registrada: ${timeString}!`;
            status.classList.add("success");
            exitForm.reset();

            if (dateInput.value === dateString) {
                loadAttendance(dateString);
            }

        } catch (error) {
            console.error("Error:", error);
            status.textContent = error.message;
            status.classList.add("error");
        } finally {
            btn.disabled = false;
            setTimeout(() => { status.textContent = ""; }, 5000);
        }
    });
});

// === Cargar Tabla (Listener en tiempo real) ===
let unsubscribe = null;

function loadAttendance(dateStr) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center">Cargando...</td></tr>';

    // Detener listener anterior si existe
    if (unsubscribe) {
        unsubscribe();
    }

    // Iniciar nuevo listener
    unsubscribe = db.collection("attendance")
        .where("date", "==", dateStr)
        .orderBy("entry_time", "desc") // Requiere índice compuesto en Firestore, si falla, quitar orderBy o crear indice
        .onSnapshot((snapshot) => {
            tableBody.innerHTML = '';

            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center">No hay registros.</td></tr>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${data.date}</td>
                    <td>${data.entry_time}</td>
                    <td>${data.exit_time || '<span style="color:#d32f2f">Pendiente</span>'}</td>
                    <td>${data.list_number}</td>
                    <td>${data.student_name} ${data.student_lastname}</td>
                    <td>${data.semester}</td>
                    <td>${data.subject}</td>
                    <td>${data.teacher}</td>
                `;
                tableBody.appendChild(tr);
            });
        }, (error) => {
            console.error("Error loading table:", error);
            if (error.code === 'failed-precondition') {
                // Indice faltante
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red">Falta índice en Firestore. Consulta la consola.</td></tr>';
            } else {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red">Error cargando datos. Revisa la consola.</td></tr>';
            }
        });
}
