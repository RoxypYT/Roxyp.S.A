const supabaseUrl = 'https://oubfxxogesvodrzknlqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91YmZ4eG9nZXN2b2RyemtubHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTk2NTMsImV4cCI6MjA4NjY5NTY1M30.qqNy8FEkRlwEbXqDpbG_AmUt0DWprU9fqFi5YAaG0O8';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

let modoAuth = 'login';

function abrirModalAuth() { document.getElementById('authModal').style.display = 'flex'; }
function cerrarModalAuth() { document.getElementById('authModal').style.display = 'none'; }

function toggleAuth() {
    modoAuth = (modoAuth === 'login') ? 'signup' : 'login';
    document.getElementById('authTitle').innerText = modoAuth === 'login' ? 'ACCESO' : 'REGISTRO';
    document.getElementById('submit-auth').innerText = modoAuth === 'login' ? 'Entrar' : 'Crear Cuenta';
}

async function ejecutarAuth() {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;
    if(modoAuth === 'signup') {
        const { error } = await _supabase.auth.signUp({ email, password: pass });
        if(error) alert(error.message); else alert("✅ Registro OK. Revisa tu email.");
    } else {
        const { error } = await _supabase.auth.signInWithPassword({ email, password: pass });
        if(error) alert("Datos incorrectos"); else { cerrarModalAuth(); checkUser(); }
    }
}

async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    if(user) {
        document.getElementById('auth-btn').innerText = "Cerrar Sesión";
        document.getElementById('auth-btn').onclick = async () => {
            await _supabase.auth.signOut();
            location.reload();
        };
        document.getElementById('balance-display').classList.remove('hidden');
        cargarSaldo(user.id);
    }
}

async function cargarSaldo(uid) {
    const { data } = await _supabase.from('perfiles').select('saldo_rp').eq('id', uid).single();
    if(data) document.getElementById('user-balance').innerText = data.saldo_rp.toFixed(2) + " RP";
}

// Funciones de Pago
function pagoBizum() { alert("👾 Manda Bizum al: [TU_NUMERO]\nConcepto: ROXYP + Tu Email"); }
function pagoPaypal() { window.open("https://paypal.me/TU_USUARIO/1", "_blank"); }

// Muro
async function postear() {
    const txt = document.getElementById('msg');
    const { data: { user } } = await _supabase.auth.getUser();
    if(!user) return abrirModalAuth();
    await _supabase.from('comentarios').insert([{ contenido: txt.value, usuario: user.email.split('@')[0] }]);
    txt.value = "";
    cargarMuro();
}

async function cargarMuro() {
    const { data } = await _supabase.from('comentarios').select('*').order('created_at', { ascending: false }).limit(10);
    if(data) document.getElementById('muro').innerHTML = data.map(c => `<p><b class="text-blue-500">@${c.usuario}:</b> ${c.contenido}</p>`).join('');
}

// Inicializar
checkUser();
cargarMuro();
