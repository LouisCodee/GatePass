/* ==========================================================================
   GPMS HTML5 Signature Canvas Engine with Bezier Curve Smoothing
   ========================================================================== */

let isCanvasInitialized = false;
let canvasCtx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function initSignatureCanvas() {
  const canvas = document.getElementById('signatureCanvas');
  if (!canvas) return;

  canvasCtx = canvas.getContext('2d');
  canvasCtx.strokeStyle = '#3b82f6';
  canvasCtx.lineWidth = 3;
  canvasCtx.lineCap = 'round';
  canvasCtx.lineJoin = 'round';

  if (isCanvasInitialized) return;
  isCanvasInitialized = true;

  const getCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    isDrawing = true;
    const { x, y } = getCoords(e);
    lastX = x;
    lastY = y;
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    
    // Smooth quadratic curve interpolation
    const midX = (lastX + x) / 2;
    const midY = (lastY + y) / 2;
    canvasCtx.quadraticCurveTo(lastX, lastY, midX, midY);
    canvasCtx.stroke();
    
    lastX = x;
    lastY = y;
  };

  const stopDraw = () => { isDrawing = false; };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: true });
  canvas.addEventListener('touchmove', draw, { passive: true });
  canvas.addEventListener('touchend', stopDraw);
}

function clearSignatureCanvas() {
  const canvas = document.getElementById('signatureCanvas');
  if (canvas && canvasCtx) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function submitClientSignature() {
  const pass = gatePassesDB.find(p => p.serialNo === activePassId);
  if (pass) {
    const canvas = document.getElementById('signatureCanvas');
    const signatureData = canvas ? canvas.toDataURL() : 'digital-signature-captured';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    pass.clientSignature = signatureData;
    pass.status = 'Client Acknowledged';
    pass.auditTrail.unshift({ timestamp: now, user: `Client (${pass.clientName})`, action: 'Digitally signed physical item inspection sign-off' });

    playSynthSound('success');
    showToast('Client acknowledgment signature captured successfully!', 'success');
    navigateTo('PG-04', pass.serialNo);
  }
}
