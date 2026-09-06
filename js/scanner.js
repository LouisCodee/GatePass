/* ==========================================================================
   GPMS Gate Scanner & Web Audio API Synthesizer
   ========================================================================== */

let audioCtx = null;

// Web Audio API Synthesizer for Tactile Audio Feedback
function playSynthSound(type = 'success') {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'success') {
      // High-pitched pleasant chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'alert') {
      // Low-pitched dramatic alert tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(164.81, now + 0.12); // E3
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    // Audio Context optional fallback
  }
}

function resetGateScan() {
  const input = document.getElementById('gateScanInput');
  if (input) input.value = '';
}

function simulateQRScan() {
  const randomPass = gatePassesDB[Math.floor(Math.random() * gatePassesDB.length)];
  const input = document.getElementById('gateScanInput');
  if (input) input.value = randomPass.serialNo;
  performGateLookup();
}

function performGateLookup() {
  const inputVal = document.getElementById('gateScanInput')?.value.trim().toUpperCase();
  if (!inputVal) {
    showToast('Please enter or scan a Gate Pass Serial Number', 'warning');
    return;
  }

  const pass = gatePassesDB.find(p => p.serialNo === inputVal || p.clientName.toUpperCase().includes(inputVal));
  if (pass) {
    if (pass.status === 'Approved – Ready for Exit') {
      playSynthSound('success');
    } else {
      playSynthSound('alert');
    }
    navigateTo('PG-15', pass.serialNo);
  } else {
    playSynthSound('alert');
    showToast(`No Gate Pass found matching "${inputVal}"`, 'error');
  }
}
